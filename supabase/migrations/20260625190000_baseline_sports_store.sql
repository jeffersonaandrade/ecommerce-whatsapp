-- =============================================================================
-- Baseline sports store — onboarding de NOVOS clientes (Supabase vazio)
-- =============================================================================
--
-- Origem: consolidado de scripts/migration/supabase-migrations.sql (blocos
-- 20260625192654 … 20260626184500), comparado com schema versionado existente.
--
-- IMPORTANTE:
--   • Aplicar SOMENTE em projeto Supabase NOVO e VAZIO.
--   • NUNCA reaplicar em bancos existentes (UnitSports produção já possui
--     essas estruturas via migrations históricas MCP).
--   • Criar buckets `branding` e `products` no Dashboard antes de storage policies.
--   • Após baseline, aplicar demais arquivos em supabase/migrations/ por ordem
--     de timestamp (20260626200000_* em diante).
--
-- Validação: supabase db reset (CLI) ou SQL Editor em projeto de teste isolado.
-- =============================================================================

-- -----------------------------------------------------------------------------
-- 20260625192654_create_sports_store_tables
-- -----------------------------------------------------------------------------

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


-- -----------------------------------------------------------------------------
-- 20260625192704_create_sports_store_rls
-- -----------------------------------------------------------------------------

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


-- -----------------------------------------------------------------------------
-- 20260625192715_create_sports_store_storage
-- Buckets `branding` e `products` criados no Dashboard (public read).
-- -----------------------------------------------------------------------------

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


-- -----------------------------------------------------------------------------
-- 20260625214951_rls_is_store_admin_policies
-- MigraÃ§Ã£o: substituir policies permissivas antigas (USING true) por is_store_admin.
-- -----------------------------------------------------------------------------

DROP POLICY IF EXISTS "products_admin_all" ON public.products;
DROP POLICY IF EXISTS "variations_admin_all" ON public.product_variations;
DROP POLICY IF EXISTS "store_settings_admin_write" ON public.store_settings;


-- -----------------------------------------------------------------------------
-- 20260625215039_storage_admin_policies
-- MigraÃ§Ã£o: substituir policies storage antigas sem filtro admin.
-- -----------------------------------------------------------------------------

DROP POLICY IF EXISTS "branding_authenticated_write" ON storage.objects;
DROP POLICY IF EXISTS "branding_authenticated_update" ON storage.objects;
DROP POLICY IF EXISTS "branding_authenticated_delete" ON storage.objects;
DROP POLICY IF EXISTS "products_authenticated_write" ON storage.objects;


-- -----------------------------------------------------------------------------
-- 20260626015218_create_categories_table_v1_1
-- -----------------------------------------------------------------------------

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


-- -----------------------------------------------------------------------------
-- 20260626015229_create_categories_rls_v1_1
-- -----------------------------------------------------------------------------

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

-- Seed idempotente (categories)
INSERT INTO public.categories (name, slug, sort_order, visible)
VALUES
  ('AcessÃ³rios', 'acessorios', 10, true),
  ('Camisas',    'camisas',    20, true),
  ('Jaquetas',   'jaquetas',   30, true),
  ('Meias',      'meias',      40, true),
  ('Shorts',     'shorts',     50, true)
ON CONFLICT (slug) DO NOTHING;


-- -----------------------------------------------------------------------------
-- 20260626183041_add_header_brand_display_to_store_settings
-- PreferÃªncia de exibiÃ§Ã£o da marca no header (logo + nome | sÃ³ logo | sÃ³ nome).
-- -----------------------------------------------------------------------------

ALTER TABLE public.store_settings
  ADD COLUMN IF NOT EXISTS header_brand_display text NOT NULL DEFAULT 'both';

ALTER TABLE public.store_settings
  DROP CONSTRAINT IF EXISTS store_settings_header_brand_display_check;

ALTER TABLE public.store_settings
  ADD CONSTRAINT store_settings_header_brand_display_check
  CHECK (header_brand_display IN ('both', 'logo_only', 'name_only'));


-- -----------------------------------------------------------------------------
-- 20260626183213_sprint2_import_batch_schema
-- Rastreamento de importaÃ§Ã£o CSV + policy de status default.
-- -----------------------------------------------------------------------------

ALTER TABLE public.products
  ADD COLUMN IF NOT EXISTS import_batch_id text NULL;

CREATE INDEX IF NOT EXISTS products_import_batch_id_idx
  ON public.products (import_batch_id)
  WHERE import_batch_id IS NOT NULL;

ALTER TABLE public.store_settings
  ADD COLUMN IF NOT EXISTS import_status_policy text NOT NULL DEFAULT 'draft';

ALTER TABLE public.store_settings
  DROP CONSTRAINT IF EXISTS store_settings_import_status_policy_check;

ALTER TABLE public.store_settings
  ADD CONSTRAINT store_settings_import_status_policy_check
  CHECK (import_status_policy IN ('active', 'draft'));

CREATE TABLE IF NOT EXISTS public.import_batches (
  id text PRIMARY KEY,
  created_at timestamptz NOT NULL DEFAULT now(),
  filename text NOT NULL DEFAULT '',
  total int NOT NULL DEFAULT 0,
  created int NOT NULL DEFAULT 0,
  updated int NOT NULL DEFAULT 0,
  skipped int NOT NULL DEFAULT 0,
  warnings int NOT NULL DEFAULT 0,
  errors int NOT NULL DEFAULT 0,
  source text NOT NULL DEFAULT 'csv'
);

ALTER TABLE public.import_batches ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "import_batches_admin_select" ON public.import_batches;
CREATE POLICY "import_batches_admin_select"
  ON public.import_batches FOR SELECT
  TO authenticated
  USING (public.is_store_admin());

DROP POLICY IF EXISTS "import_batches_admin_insert" ON public.import_batches;
CREATE POLICY "import_batches_admin_insert"
  ON public.import_batches FOR INSERT
  TO authenticated
  WITH CHECK (public.is_store_admin());

DROP POLICY IF EXISTS "import_batches_admin_update" ON public.import_batches;
CREATE POLICY "import_batches_admin_update"
  ON public.import_batches FOR UPDATE
  TO authenticated
  USING (public.is_store_admin())
  WITH CHECK (public.is_store_admin());

DROP POLICY IF EXISTS "import_batches_admin_delete" ON public.import_batches;
CREATE POLICY "import_batches_admin_delete"
  ON public.import_batches FOR DELETE
  TO authenticated
  USING (public.is_store_admin());

GRANT SELECT, INSERT, UPDATE, DELETE ON TABLE public.import_batches TO authenticated;


-- -----------------------------------------------------------------------------
-- 20260626184500_add_get_product_status_counts_rpc
-- Contagens de status para /admin/products (evita fetchAllProducts no fallback).
-- -----------------------------------------------------------------------------

CREATE OR REPLACE FUNCTION public.get_product_status_counts()
RETURNS jsonb
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT jsonb_build_object(
    'all', (SELECT COUNT(*)::int FROM public.products),
    'active', (SELECT COUNT(*)::int FROM public.products WHERE status = 'active'),
    'draft', (SELECT COUNT(*)::int FROM public.products WHERE status = 'draft'),
    'unavailable', (SELECT COUNT(*)::int FROM public.products WHERE status = 'unavailable'),
    'noStock', (
      SELECT COUNT(*)::int
      FROM public.products p
      WHERE COALESCE(
        (SELECT SUM(v.stock) FROM public.product_variations v WHERE v.product_id = p.id),
        0
      ) = 0
    )
  );
$$;

GRANT EXECUTE ON FUNCTION public.get_product_status_counts() TO authenticated, service_role;
