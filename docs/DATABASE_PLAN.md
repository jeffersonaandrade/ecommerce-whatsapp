# DATABASE_PLAN — Sports Store (Supabase)

**Modelo:** single-tenant — 1 projeto Supabase por cliente.  
**Referências:** [`HANDOFF.md`](HANDOFF.md), [`DOMAIN_MODEL.md`](DOMAIN_MODEL.md), [`types/product.ts`](../types/product.ts), [`types/store-settings.ts`](../types/store-settings.ts)

---

## Diagrama ER (Sprint 1–2)

```text
store_settings (singleton id = 'default')

categories (V1.1 — CRUD admin; products.category ainda string/slug legado)

products ──< product_variations
   │
   └── images: text[] (URLs externas ou paths Storage)

Storage buckets (não relacional):
  branding/   — logo, favicons, og, hero
  products/   — uploads admin (Sprint 2+)
```

**Fora deste plano (Sprint 4+):** `banners`, `nav_items`

**Aplicado em produção (2026-06-26):** tabela `categories` — migrations MCP `create_categories_table_v1_1`, `create_categories_rls_v1_1`. Seed: 5 categorias. **`products.category` ainda não normalizado para slug** (aguarda código + migration dedicada).

---

## Mapeamento JSON → Postgres

| JSON / filesystem | Postgres / Storage |
|-------------------|-------------------|
| `storage/catalog.json` | `products` + `product_variations` |
| `storage/store-settings.json` | `store_settings` (row `default`) |
| `storage/categories.json` (V1.1 código) | `categories` |
| `storage/branding/*` | bucket `branding` |

---

## SQL — copiar e colar no Supabase SQL Editor

Execute **na ordem** em: Supabase Dashboard → SQL → New query.

### 1. Tabelas

```sql
-- products
CREATE TABLE IF NOT EXISTS public.products (
  id text PRIMARY KEY,
  slug text NOT NULL UNIQUE,
  name text NOT NULL,
  short_description text NOT NULL DEFAULT '',
  long_description text NOT NULL DEFAULT '',
  price numeric(12, 2) NOT NULL CHECK (price >= 0),
  promotional_price numeric(12, 2) CHECK (promotional_price IS NULL OR promotional_price >= 0),
  category text NOT NULL DEFAULT '',
  club text,
  images text[] NOT NULL DEFAULT '{}',
  status text NOT NULL DEFAULT 'draft'
    CHECK (status IN ('active', 'draft', 'unavailable')),
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS products_status_idx ON public.products (status);
CREATE INDEX IF NOT EXISTS products_category_idx ON public.products (category);

-- product_variations
CREATE TABLE IF NOT EXISTS public.product_variations (
  id text PRIMARY KEY,
  product_id text NOT NULL REFERENCES public.products (id) ON DELETE CASCADE,
  size text,
  color text,
  sku text NOT NULL UNIQUE,
  stock integer NOT NULL DEFAULT 0 CHECK (stock >= 0)
);

CREATE INDEX IF NOT EXISTS product_variations_product_id_idx
  ON public.product_variations (product_id);

-- store_settings (singleton)
CREATE TABLE IF NOT EXISTS public.store_settings (
  id text PRIMARY KEY DEFAULT 'default',
  store_name text NOT NULL,
  description text NOT NULL DEFAULT '',
  site_url text NOT NULL DEFAULT '',
  whatsapp_phone text NOT NULL DEFAULT '',
  whatsapp_message_prefix text NOT NULL DEFAULT '',
  email text NOT NULL DEFAULT '',
  instagram text NOT NULL DEFAULT '',
  facebook text NOT NULL DEFAULT '',
  phone text NOT NULL DEFAULT '',
  logo_path text,
  og_image_path text,
  primary_color text NOT NULL DEFAULT '#111111',
  secondary_color text NOT NULL DEFAULT '#f5f5f5',
  hero_image_path text,
  hero_headline text NOT NULL DEFAULT '',
  hero_headline_line2 text NOT NULL DEFAULT '',
  hero_subheadline text NOT NULL DEFAULT '',
  hero_cta_label text NOT NULL DEFAULT '',
  hero_cta_href text NOT NULL DEFAULT '/products',
  about_text text NOT NULL DEFAULT '',
  address text NOT NULL DEFAULT '',
  city_state text NOT NULL DEFAULT '',
  business_hours text NOT NULL DEFAULT '',
  exchange_policy_text text NOT NULL DEFAULT '',
  updated_at timestamptz NOT NULL DEFAULT now()
);
```

### 1b. Tabela `categories` (V1.1 — aplicada 2026-06-26)

Migration MCP: `create_categories_table_v1_1` + `create_categories_rls_v1_1`.

```sql
CREATE TABLE IF NOT EXISTS public.categories (
  id text PRIMARY KEY DEFAULT gen_random_uuid()::text,
  name text NOT NULL,
  slug text NOT NULL,
  description text NOT NULL DEFAULT '',
  sort_order integer NOT NULL DEFAULT 0,
  visible boolean NOT NULL DEFAULT true,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT categories_name_not_empty CHECK (char_length(trim(name)) > 0),
  CONSTRAINT categories_slug_not_empty CHECK (char_length(trim(slug)) > 0),
  CONSTRAINT categories_slug_unique UNIQUE (slug),
  CONSTRAINT categories_slug_format CHECK (slug ~ '^[a-z0-9]+(?:-[a-z0-9]+)*$')
);

CREATE INDEX IF NOT EXISTS categories_visible_sort_idx
  ON public.categories (visible, sort_order, name);

CREATE INDEX IF NOT EXISTS categories_slug_idx
  ON public.categories (slug);

CREATE OR REPLACE FUNCTION public.set_updated_at()
RETURNS trigger
LANGUAGE plpgsql
SET search_path = public
AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS categories_set_updated_at ON public.categories;
CREATE TRIGGER categories_set_updated_at
  BEFORE UPDATE ON public.categories
  FOR EACH ROW
  EXECUTE FUNCTION public.set_updated_at();

ALTER TABLE public.categories ENABLE ROW LEVEL SECURITY;

CREATE POLICY "categories_public_read"
  ON public.categories FOR SELECT
  TO anon, authenticated
  USING (visible = true);

CREATE POLICY "categories_admin_select"
  ON public.categories FOR SELECT
  TO authenticated
  USING (public.is_store_admin());

CREATE POLICY "categories_admin_insert"
  ON public.categories FOR INSERT
  TO authenticated
  WITH CHECK (public.is_store_admin());

CREATE POLICY "categories_admin_update"
  ON public.categories FOR UPDATE
  TO authenticated
  USING (public.is_store_admin())
  WITH CHECK (public.is_store_admin());

CREATE POLICY "categories_admin_delete"
  ON public.categories FOR DELETE
  TO authenticated
  USING (public.is_store_admin());

GRANT SELECT ON TABLE public.categories TO anon, authenticated;
GRANT INSERT, UPDATE, DELETE ON TABLE public.categories TO authenticated;
```

**Seed inicial (idempotente):**

```sql
INSERT INTO public.categories (name, slug, sort_order, visible)
VALUES
  ('Acessórios', 'acessorios', 10, true),
  ('Camisas',    'camisas',    20, true),
  ('Jaquetas',   'jaquetas',   30, true),
  ('Meias',      'meias',      40, true),
  ('Shorts',     'shorts',     50, true)
ON CONFLICT (slug) DO NOTHING;
```

> **Pendente:** `UPDATE products SET category = slug` — só após repositories + admin UI + vitrine por slug.

### 2. RLS

**Instalação inicial** (projeto novo):

```sql
ALTER TABLE public.products ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.product_variations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.store_settings ENABLE ROW LEVEL SECURITY;

CREATE OR REPLACE FUNCTION public.is_store_admin()
RETURNS boolean
LANGUAGE sql
STABLE
SET search_path = public
AS $$
  SELECT coalesce(
    (auth.jwt() -> 'app_metadata' ->> 'role') = 'admin',
    false
  );
$$;

-- Leitura pública: produtos ativos
CREATE POLICY "products_public_read"
  ON public.products FOR SELECT
  TO anon, authenticated
  USING (status = 'active');

CREATE POLICY "products_admin_select"
  ON public.products FOR SELECT
  TO authenticated
  USING (public.is_store_admin());

CREATE POLICY "products_admin_insert"
  ON public.products FOR INSERT
  TO authenticated
  WITH CHECK (public.is_store_admin());

CREATE POLICY "products_admin_update"
  ON public.products FOR UPDATE
  TO authenticated
  USING (public.is_store_admin())
  WITH CHECK (public.is_store_admin());

CREATE POLICY "products_admin_delete"
  ON public.products FOR DELETE
  TO authenticated
  USING (public.is_store_admin());

-- Variações: leitura quando produto ativo
CREATE POLICY "variations_public_read"
  ON public.product_variations FOR SELECT
  TO anon, authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.products p
      WHERE p.id = product_id AND p.status = 'active'
    )
  );

CREATE POLICY "variations_admin_select"
  ON public.product_variations FOR SELECT
  TO authenticated
  USING (public.is_store_admin());

CREATE POLICY "variations_admin_insert"
  ON public.product_variations FOR INSERT
  TO authenticated
  WITH CHECK (public.is_store_admin());

CREATE POLICY "variations_admin_update"
  ON public.product_variations FOR UPDATE
  TO authenticated
  USING (public.is_store_admin())
  WITH CHECK (public.is_store_admin());

CREATE POLICY "variations_admin_delete"
  ON public.product_variations FOR DELETE
  TO authenticated
  USING (public.is_store_admin());

-- store_settings: leitura pública (vitrine)
CREATE POLICY "store_settings_public_read"
  ON public.store_settings FOR SELECT
  TO anon, authenticated
  USING (true);

CREATE POLICY "store_settings_admin_insert"
  ON public.store_settings FOR INSERT
  TO authenticated
  WITH CHECK (public.is_store_admin());

CREATE POLICY "store_settings_admin_update"
  ON public.store_settings FOR UPDATE
  TO authenticated
  USING (public.is_store_admin())
  WITH CHECK (public.is_store_admin());

CREATE POLICY "store_settings_admin_delete"
  ON public.store_settings FOR DELETE
  TO authenticated
  USING (public.is_store_admin());
```

**Migração** (projeto já provisionado com policies permissivas `USING (true)`):

```sql
CREATE OR REPLACE FUNCTION public.is_store_admin()
RETURNS boolean
LANGUAGE sql
STABLE
SET search_path = public
AS $$
  SELECT coalesce(
    (auth.jwt() -> 'app_metadata' ->> 'role') = 'admin',
    false
  );
$$;

DROP POLICY IF EXISTS "products_admin_all" ON public.products;
DROP POLICY IF EXISTS "variations_admin_all" ON public.product_variations;
DROP POLICY IF EXISTS "store_settings_admin_write" ON public.store_settings;

-- Recriar policies admin (copiar bloco acima a partir de products_admin_select)
```

> **Server actions:** repositórios usam `SUPABASE_SERVICE_ROLE_KEY` (bypass RLS). Service role bypassa RLS por design — **autorização é responsabilidade da camada app** (`requireAdmin()` em todas as mutations). RLS protege acesso direto via PostgREST/Storage com anon key + JWT.

### 3. Storage buckets

No Dashboard → Storage → New bucket:

| Bucket | Public | Uso |
|--------|--------|-----|
| `branding` | Sim | logo, favicons, og, hero |
| `products` | Sim | uploads admin (futuro) |

Policies (SQL Editor):

```sql
-- branding: leitura pública
CREATE POLICY "branding_public_read"
  ON storage.objects FOR SELECT
  TO public
  USING (bucket_id = 'branding');

CREATE POLICY "branding_admin_insert"
  ON storage.objects FOR INSERT
  TO authenticated
  WITH CHECK (bucket_id = 'branding' AND public.is_store_admin());

CREATE POLICY "branding_admin_update"
  ON storage.objects FOR UPDATE
  TO authenticated
  USING (bucket_id = 'branding' AND public.is_store_admin());

CREATE POLICY "branding_admin_delete"
  ON storage.objects FOR DELETE
  TO authenticated
  USING (bucket_id = 'branding' AND public.is_store_admin());

-- products bucket
CREATE POLICY "products_public_read"
  ON storage.objects FOR SELECT
  TO public
  USING (bucket_id = 'products');

CREATE POLICY "products_admin_insert"
  ON storage.objects FOR INSERT
  TO authenticated
  WITH CHECK (bucket_id = 'products' AND public.is_store_admin());

CREATE POLICY "products_admin_update"
  ON storage.objects FOR UPDATE
  TO authenticated
  USING (bucket_id = 'products' AND public.is_store_admin());

CREATE POLICY "products_admin_delete"
  ON storage.objects FOR DELETE
  TO authenticated
  USING (bucket_id = 'products' AND public.is_store_admin());
```

**Migração Storage** (substituir policies antigas sem filtro admin):

```sql
DROP POLICY IF EXISTS "branding_authenticated_write" ON storage.objects;
DROP POLICY IF EXISTS "branding_authenticated_update" ON storage.objects;
DROP POLICY IF EXISTS "branding_authenticated_delete" ON storage.objects;
DROP POLICY IF EXISTS "products_authenticated_write" ON storage.objects;
-- Recriar com bloco acima (branding_admin_* / products_admin_*)
```

---

## Variáveis de ambiente

| Variável | Onde | Descrição |
|----------|------|-----------|
| `NEXT_PUBLIC_SUPABASE_URL` | Netlify + local | URL do projeto |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Netlify + local | Chave anon (browser + middleware) |
| `SUPABASE_SERVICE_ROLE_KEY` | Netlify + local (server only) | Service role — **nunca** expor no client |
| `DATA_PROVIDER` | Netlify + local | `json` (default) ou `supabase` |
| `NEXT_PUBLIC_DATA_PROVIDER` | Netlify + local | Espelho público para Auth no browser |

Copie [`.env.local.example`](../.env.local.example) para `.env.local`.

---

## Setup manual (Sprint 1)

1. Criar projeto Supabase (dev/staging)
2. Executar SQL acima (tabelas → RLS → storage policies)
3. Criar buckets `branding` e `products` (public read)
4. Auth → Email provider habilitado; **desabilitar sign ups públicos**
5. Criar usuário admin (Authentication → Users → Add user)
6. Editar admin → Raw App Meta Data: `{ "role": "admin" }`
7. Copiar URL + anon key + service role key para `.env.local`
8. Teste: upload manual em `branding`, login admin no Dashboard

---

## Migração JSON → Supabase (Sprint 2)

Com `.env.local` configurado:

```bash
node scripts/migration/migrate-json-to-supabase.mjs
```

Lê `storage/catalog.json` (ou `catalog.seed.json`) + `storage/store-settings.json` e faz upsert. Upload de `storage/branding/*` para o bucket.

---

## Checklist provisionamento por cliente (Sprint 3)

1. [ ] Novo projeto Supabase (1 por cliente)
2. [ ] Executar SQL + buckets + admin user
3. [ ] Site Netlify + env vars (`DATA_PROVIDER=supabase`, `NEXT_PUBLIC_DATA_PROVIDER=supabase`, keys)
4. [ ] Rodar `migrate-json-to-supabase.mjs` com dados do cliente
5. [ ] Smoke test:
   - [ ] Home + PLP + PDP carregam
   - [ ] Admin login (email/senha Supabase)
   - [ ] Salvar settings persiste após redeploy
   - [ ] CRUD produto + import CSV
   - [ ] Upload logo gera favicon/OG
   - [ ] Pedido WhatsApp `#TEMP-...`

---

## Onboarding 1º cliente

1. Identidade — nome, WhatsApp, logo via `/admin/settings`
2. Import CSV — catálogo real
3. Validar pedido WhatsApp em produção
4. Registrar fricções → backlog Sprint 4+

---

*Última atualização: categories V1.1 schema (MCP) — 2026-06-26*
