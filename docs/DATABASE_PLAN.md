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

## Migrations Supabase

**Arquivo canônico (DDL):** [`scripts/migration/supabase-migrations.sql`](../scripts/migration/supabase-migrations.sql)

Aplicar novas migrations via **MCP Supabase** (`apply_migration`). Após aplicar, adicionar o bloco SQL no arquivo acima com o nome/version da migration.

### Registro aplicado (produção UnitSports)

| Version | Nome | Descrição |
|---------|------|-----------|
| `20260625192654` | `create_sports_store_tables` | `products`, `product_variations`, `store_settings` |
| `20260625192704` | `create_sports_store_rls` | RLS inicial + `is_store_admin()` |
| `20260625192715` | `create_sports_store_storage` | Policies buckets `branding` / `products` |
| `20260625192844` | `seed_sports_store_data` | Seed settings |
| `20260625192938` | `seed_products_batch_1` | Seed produtos (lote 1) |
| `20260625192941` | `seed_products_batch_2` | Seed produtos (lote 2) |
| `20260625192949` | `seed_products_batch_3` | Seed produtos (lote 3) |
| `20260625214951` | `rls_is_store_admin_policies` | Troca policies permissivas |
| `20260625215039` | `storage_admin_policies` | Storage admin-only |
| `20260625215042` | `set_admin_app_metadata_role` | Role admin no JWT |
| `20260626015218` | `create_categories_table_v1_1` | Tabela `categories` |
| `20260626015229` | `create_categories_rls_v1_1` | RLS + seed categorias |
| `20260626183041` | `add_header_brand_display_to_store_settings` | `header_brand_display` |
| `20260626183213` | `sprint2_import_batch_schema` | `import_batch_id`, `import_status_policy`, `import_batches` |
| `20260626183757` | `add_get_product_status_counts_rpc` | RPC `get_product_status_counts()` — tabs admin produtos |
| `20260626190619` | `sprint3_media_storefront` | `categories.image_path`, tabela `banner_slides` + RLS |
| `20260626190630` | `sprint4a_benefit_items` | `benefit_items`, `benefits_eyebrow/title` em settings + seed |
| `20260626221601` | `transactional_product_import` | RPC `apply_product_import_batch(jsonb)` — import CSV transacional |
| `20260626224221` | `import_batch_post_upsert_sku_check` | Revalida SKU após upsert de products na RPC de import |
| `20260627153700` | `banner_slide_visibility` | Coluna `visibility` (`all` \| `desktop` \| `mobile`); `desktop_image_path` nullable para slides mobile-only |
| `20260627210000` | `store_onboarding` | Tabela `store_onboarding` — estado da implantação guiada (separado de `store_settings`) |

> **Operacional:** DDL via MCP `apply_migration`; dados via `npm run migrate:supabase`. Consultas de verificação via MCP `execute_sql`.

---

## SQL — referência rápida

O DDL completo está em [`scripts/migration/supabase-migrations.sql`](../scripts/migration/supabase-migrations.sql).  
Use o SQL Editor ou MCP apenas para **projeto novo** ou **migration incremental** (bloco isolado no final do arquivo).

### Schema atual (colunas extras pós-Sprint 2)

Além do schema base em `store_settings`:

- `header_brand_display` — `'both' | 'logo_only' | 'name_only'` (default `both`)
- `benefits_eyebrow`, `benefits_title` — cabeçalho da seção benefícios na home (Sprint 4A)
- `benefit_items` — cards editáveis (max 6 via app; seed `benefit-default-1..3`)
- `import_status_policy` — `'active' | 'draft'` (default `draft`)

Além do schema base em `products`:

- `import_batch_id` — UUID do lote CSV (nullable, indexado)

Tabela admin:

- `import_batches` — histórico de importação (RLS admin-only; persistência no código pendente)

### 1. Tabelas base (início do arquivo SQL)

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

Ver arquivo completo + migrations incrementais em [`scripts/migration/supabase-migrations.sql`](../scripts/migration/supabase-migrations.sql).

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
| `products` | Sim | uploads admin; path `{product_id}/{unique}.{ext}` via Central de Mídia (browser → Storage) |

**Central de Mídia (2026-06):** upload em lote usa JWT admin + anon key no browser (`createBrowserSupabaseClient`). Metadados (`products.images`) via `setProductImages` — bytes não passam pela Netlify.

Convenção de associação de arquivos: `{slug|sku}--{01..05}.{jpg|jpeg|png|webp}`.

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
| `ENABLE_MIGRATION_TOOLS` | Netlify + local | `true` habilita Import CSV e Central de Mídia no admin (onboarding). Default: desligado (`notFound()` nas rotas) |

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
2. `ENABLE_MIGRATION_TOOLS=true` — habilitar Import CSV + Central de Mídia durante onboarding
3. Import CSV — catálogo real (RPC transacional)
4. Migração imagens — dry-run → upload seguros → validação manual (`scripts/README.md`)
5. Publicar produtos aprovados (`draft` → `active`)
6. Validar pedido WhatsApp em produção
7. Desligar `ENABLE_MIGRATION_TOOLS` quando catálogo estiver estável
8. Registrar fricções → backlog Sprint 4+

---

## Migração de imagens (operacional)

Quando o catálogo já existe com URLs externas e há arquivos locais exportados:

1. `npm run migrate:images:dry-run` — classifica seguro vs ambíguo
2. Revisar `test-data/reports/LOCAL_IMAGE_MIGRATION_DRY_RUN.md`
3. `npm run migrate:images:pilot` — validar amostra com cliente
4. `npm run migrate:images:remaining` — lote dos seguros restantes
5. Corrigir ambíguos manualmente via admin ou Central de Mídia

Detalhes: [`IMPORT_PIPELINE.md`](IMPORT_PIPELINE.md) § Migração de imagens.

---

*Última atualização: 2026-06-27 — migrations + migração imagens UnitSports*
