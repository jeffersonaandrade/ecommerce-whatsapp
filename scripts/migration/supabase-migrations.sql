-- =============================================================================
-- Supabase migrations — ecommerce-sports
-- =============================================================================
--
-- Fonte canônica de DDL do projeto. Aplicar via:
--   • MCP Supabase: apply_migration (preferido — registra em schema_migrations)
--   • SQL Editor: blocos abaixo, na ordem, em projeto novo
--
-- Registro remoto (produção UnitSports, 2026-06-26):
--   create_sports_store_tables
--   create_sports_store_rls
--   create_sports_store_storage
--   seed_sports_store_data
--   seed_products_batch_1 | _2 | _3
--   rls_is_store_admin_policies
--   storage_admin_policies
--   set_admin_app_metadata_role
--   create_categories_table_v1_1
--   create_categories_rls_v1_1
--   add_header_brand_display_to_store_settings
--   sprint2_import_batch_schema
--   add_get_product_status_counts_rpc
--
-- Documentação operacional: docs/DATABASE_PLAN.md
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
-- Migração: substituir policies permissivas antigas (USING true) por is_store_admin.
-- -----------------------------------------------------------------------------

DROP POLICY IF EXISTS "products_admin_all" ON public.products;
DROP POLICY IF EXISTS "variations_admin_all" ON public.product_variations;
DROP POLICY IF EXISTS "store_settings_admin_write" ON public.store_settings;


-- -----------------------------------------------------------------------------
-- 20260625215039_storage_admin_policies
-- Migração: substituir policies storage antigas sem filtro admin.
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
  ('Acessórios', 'acessorios', 10, true),
  ('Camisas',    'camisas',    20, true),
  ('Jaquetas',   'jaquetas',   30, true),
  ('Meias',      'meias',      40, true),
  ('Shorts',     'shorts',     50, true)
ON CONFLICT (slug) DO NOTHING;


-- -----------------------------------------------------------------------------
-- 20260626183041_add_header_brand_display_to_store_settings
-- Preferência de exibição da marca no header (logo + nome | só logo | só nome).
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
-- Rastreamento de importação CSV + policy de status default.
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


-- -----------------------------------------------------------------------------
-- 20260626200000_sprint3_media_storefront
-- Imagem de categoria + tabela de slides do carrossel.
-- set_updated_at() e is_store_admin() já existem de migrações anteriores.
-- -----------------------------------------------------------------------------

ALTER TABLE public.categories
  ADD COLUMN IF NOT EXISTS image_path text;

CREATE TABLE IF NOT EXISTS public.banner_slides (
  id                 text PRIMARY KEY DEFAULT gen_random_uuid()::text,
  desktop_image_path text NOT NULL,
  mobile_image_path  text,
  title              text,
  subtitle           text,
  cta_label          text,
  cta_href           text,
  sort_order         integer NOT NULL DEFAULT 0,
  active             boolean NOT NULL DEFAULT true,
  created_at         timestamptz NOT NULL DEFAULT now(),
  updated_at         timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT banner_slides_cta_both_or_none
    CHECK (
      (cta_label IS NULL AND cta_href IS NULL) OR
      (cta_label IS NOT NULL AND cta_href IS NOT NULL)
    )
);

CREATE INDEX IF NOT EXISTS banner_slides_sort_idx
  ON public.banner_slides (sort_order, created_at);

CREATE INDEX IF NOT EXISTS banner_slides_active_idx
  ON public.banner_slides (active) WHERE active = true;

DROP TRIGGER IF EXISTS banner_slides_set_updated_at ON public.banner_slides;
CREATE TRIGGER banner_slides_set_updated_at
  BEFORE UPDATE ON public.banner_slides
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

ALTER TABLE public.banner_slides ENABLE ROW LEVEL SECURITY;

CREATE POLICY "banner_slides_public_read"
  ON public.banner_slides FOR SELECT TO anon, authenticated
  USING (active = true);

CREATE POLICY "banner_slides_admin_select"
  ON public.banner_slides FOR SELECT TO authenticated
  USING (public.is_store_admin());

CREATE POLICY "banner_slides_admin_insert"
  ON public.banner_slides FOR INSERT TO authenticated
  WITH CHECK (public.is_store_admin());

CREATE POLICY "banner_slides_admin_update"
  ON public.banner_slides FOR UPDATE TO authenticated
  USING (public.is_store_admin()) WITH CHECK (public.is_store_admin());

CREATE POLICY "banner_slides_admin_delete"
  ON public.banner_slides FOR DELETE TO authenticated
  USING (public.is_store_admin());

GRANT SELECT ON TABLE public.banner_slides TO anon, authenticated;
GRANT INSERT, UPDATE, DELETE ON TABLE public.banner_slides TO authenticated;


-- -----------------------------------------------------------------------------
-- 20260626210000_sprint4a_benefit_items
-- Benefícios editáveis na home (Sprint 4A).
-- -----------------------------------------------------------------------------

ALTER TABLE public.store_settings
  ADD COLUMN IF NOT EXISTS benefits_eyebrow text NOT NULL DEFAULT 'Por que comprar conosco',
  ADD COLUMN IF NOT EXISTS benefits_title text NOT NULL DEFAULT 'Benefícios';

CREATE TABLE IF NOT EXISTS public.benefit_items (
  id text PRIMARY KEY,
  title text NOT NULL,
  description text NOT NULL DEFAULT '',
  sort_order integer NOT NULL DEFAULT 0,
  active boolean NOT NULL DEFAULT true,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT benefit_items_title_not_empty CHECK (char_length(trim(title)) > 0)
);

CREATE INDEX IF NOT EXISTS benefit_items_active_sort_idx
  ON public.benefit_items (active, sort_order);

DROP TRIGGER IF EXISTS benefit_items_set_updated_at ON public.benefit_items;
CREATE TRIGGER benefit_items_set_updated_at
  BEFORE UPDATE ON public.benefit_items
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

ALTER TABLE public.benefit_items ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "benefit_items_public_read" ON public.benefit_items;
CREATE POLICY "benefit_items_public_read"
  ON public.benefit_items FOR SELECT TO anon, authenticated
  USING (active = true);

DROP POLICY IF EXISTS "benefit_items_admin_select" ON public.benefit_items;
CREATE POLICY "benefit_items_admin_select"
  ON public.benefit_items FOR SELECT TO authenticated
  USING (public.is_store_admin());

DROP POLICY IF EXISTS "benefit_items_admin_insert" ON public.benefit_items;
CREATE POLICY "benefit_items_admin_insert"
  ON public.benefit_items FOR INSERT TO authenticated
  WITH CHECK (public.is_store_admin());

DROP POLICY IF EXISTS "benefit_items_admin_update" ON public.benefit_items;
CREATE POLICY "benefit_items_admin_update"
  ON public.benefit_items FOR UPDATE TO authenticated
  USING (public.is_store_admin()) WITH CHECK (public.is_store_admin());

DROP POLICY IF EXISTS "benefit_items_admin_delete" ON public.benefit_items;
CREATE POLICY "benefit_items_admin_delete"
  ON public.benefit_items FOR DELETE TO authenticated
  USING (public.is_store_admin());

GRANT SELECT ON public.benefit_items TO anon, authenticated;
GRANT INSERT, UPDATE, DELETE ON public.benefit_items TO authenticated;

INSERT INTO public.benefit_items (id, title, description, sort_order, active)
VALUES
  ('benefit-default-1', 'Envio rápido', 'Entrega em até 5 dias úteis em todo o Brasil.', 10, true),
  ('benefit-default-2', 'Produtos originais', '100% autênticos com garantia de qualidade.', 20, true),
  ('benefit-default-3', 'Suporte dedicado', 'Atendimento quando você precisar.', 30, true)
ON CONFLICT (id) DO NOTHING;


-- -----------------------------------------------------------------------------
-- 20260626221601_transactional_product_import
-- Import CSV transacional via RPC apply_product_import_batch(jsonb).
-- -----------------------------------------------------------------------------

-- (conteúdo idêntico a supabase/migrations/20260626221601_transactional_product_import.sql)

CREATE OR REPLACE FUNCTION public.apply_product_import_batch(payload jsonb)
RETURNS jsonb
LANGUAGE plpgsql
VOLATILE
SECURITY INVOKER
SET search_path = ''
AS $$
DECLARE
  v_batch_id text;
  v_filename text;
  v_skipped int;
  v_warnings int;
  v_created int;
  v_updated int;
  v_product_count int;
BEGIN
  PERFORM pg_advisory_xact_lock(hashtext('product_import'));
  v_batch_id := payload ->> 'batchId';
  v_filename := COALESCE(payload ->> 'filename', '');
  v_skipped := COALESCE((payload ->> 'skipped')::int, 0);
  v_warnings := COALESCE((payload ->> 'warnings')::int, 0);
  IF v_batch_id IS NULL OR btrim(v_batch_id) = '' THEN
    RAISE EXCEPTION 'batchId is required';
  END IF;
  v_product_count := COALESCE(jsonb_array_length(payload -> 'products'), 0);
  IF v_product_count = 0 THEN RAISE EXCEPTION 'products array is required'; END IF;
  IF v_product_count > 500 THEN RAISE EXCEPTION 'maximum 500 products per batch'; END IF;
  CREATE TEMP TABLE tmp_import_products ON COMMIT DROP AS
  SELECT * FROM jsonb_to_recordset(payload -> 'products') AS x(
    id text, slug text, name text, short_description text, long_description text,
    price numeric, promotional_price numeric, category text, club text, images text[],
    status text, import_batch_id text, is_update boolean
  );
  CREATE TEMP TABLE tmp_import_variations ON COMMIT DROP AS
  SELECT * FROM jsonb_to_recordset(payload -> 'variations') AS x(
    product_slug text, sku text, size text, color text, stock integer
  );
  IF EXISTS (SELECT 1 FROM tmp_import_products WHERE slug IS NULL OR btrim(slug) = '') THEN
    RAISE EXCEPTION 'empty slug in payload';
  END IF;
  IF EXISTS (SELECT slug FROM tmp_import_products GROUP BY slug HAVING COUNT(*) > 1) THEN
    RAISE EXCEPTION 'duplicate slug in payload';
  END IF;
  IF EXISTS (SELECT 1 FROM tmp_import_variations WHERE sku IS NULL OR btrim(sku) = '') THEN
    RAISE EXCEPTION 'empty sku in payload';
  END IF;
  IF EXISTS (SELECT sku FROM tmp_import_variations GROUP BY sku HAVING COUNT(*) > 1) THEN
    RAISE EXCEPTION 'duplicate sku in payload';
  END IF;
  IF EXISTS (
    SELECT 1 FROM tmp_import_variations iv
    LEFT JOIN tmp_import_products ip ON ip.slug = iv.product_slug
    WHERE ip.slug IS NULL
  ) THEN RAISE EXCEPTION 'variation references unknown product_slug'; END IF;
  IF EXISTS (
    SELECT 1 FROM tmp_import_products ip
    JOIN public.products p ON p.slug = ip.slug AND p.id <> ip.id
  ) THEN RAISE EXCEPTION 'slug already belongs to another product'; END IF;
  IF EXISTS (
    SELECT 1 FROM tmp_import_variations iv
    JOIN public.products p ON p.slug = iv.product_slug
    JOIN public.product_variations pv ON pv.sku = iv.sku
    WHERE pv.product_id <> p.id
  ) THEN RAISE EXCEPTION 'sku already belongs to another product'; END IF;
  IF EXISTS (
    SELECT 1 FROM tmp_import_products ip
    WHERE COALESCE(ip.is_update, false)
      AND NOT EXISTS (SELECT 1 FROM public.products p WHERE p.id = ip.id)
  ) THEN RAISE EXCEPTION 'update references missing product id'; END IF;
  SELECT
    COUNT(*) FILTER (WHERE NOT COALESCE(is_update, false)),
    COUNT(*) FILTER (WHERE COALESCE(is_update, false))
  INTO v_created, v_updated FROM tmp_import_products;
  INSERT INTO public.products (
    id, slug, name, short_description, long_description, price, promotional_price,
    category, club, images, status, import_batch_id, updated_at
  )
  SELECT ip.id, ip.slug, ip.name, COALESCE(ip.short_description, ''), COALESCE(ip.long_description, ''),
    ip.price, ip.promotional_price, COALESCE(ip.category, ''), ip.club,
    COALESCE(ip.images, '{}'::text[]), ip.status, v_batch_id, now()
  FROM tmp_import_products ip
  ON CONFLICT (id) DO UPDATE SET
    slug = EXCLUDED.slug, name = EXCLUDED.name, short_description = EXCLUDED.short_description,
    long_description = EXCLUDED.long_description, price = EXCLUDED.price,
    promotional_price = EXCLUDED.promotional_price, category = EXCLUDED.category,
    club = EXCLUDED.club, images = EXCLUDED.images, status = EXCLUDED.status,
    import_batch_id = EXCLUDED.import_batch_id, updated_at = now();
  INSERT INTO public.product_variations (id, product_id, size, color, sku, stock)
  SELECT COALESCE(pv.id, gen_random_uuid()::text), p.id, iv.size, iv.color, iv.sku,
    GREATEST(0, COALESCE(iv.stock, 0))
  FROM tmp_import_variations iv
  JOIN public.products p ON p.slug = iv.product_slug
  LEFT JOIN public.product_variations pv ON pv.sku = iv.sku
  ON CONFLICT (sku) DO UPDATE SET size = EXCLUDED.size, color = EXCLUDED.color, stock = EXCLUDED.stock;
  INSERT INTO public.import_batches (
    id, filename, total, created, updated, skipped, warnings, errors, source
  ) VALUES (
    v_batch_id, left(v_filename, 255), v_product_count, v_created, v_updated, v_skipped, v_warnings, 0, 'csv'
  );
  RETURN jsonb_build_object(
    'batchId', v_batch_id, 'created', v_created, 'updated', v_updated, 'skipped', v_skipped
  );
END;
$$;

REVOKE ALL ON FUNCTION public.apply_product_import_batch(jsonb) FROM PUBLIC;
REVOKE ALL ON FUNCTION public.apply_product_import_batch(jsonb) FROM anon;
REVOKE ALL ON FUNCTION public.apply_product_import_batch(jsonb) FROM authenticated;
GRANT EXECUTE ON FUNCTION public.apply_product_import_batch(jsonb) TO service_role;


-- -----------------------------------------------------------------------------
-- 20260626224221_import_batch_post_upsert_sku_check
-- Revalida ownership de SKU apos upsert de products (slug canonico pode alterar resolucao).
-- -----------------------------------------------------------------------------

-- (conteúdo idêntico a supabase/migrations/20260626230001_import_batch_post_upsert_sku_check.sql)

CREATE OR REPLACE FUNCTION public.apply_product_import_batch(payload jsonb)
RETURNS jsonb
LANGUAGE plpgsql
VOLATILE
SECURITY INVOKER
SET search_path = ''
AS $$
DECLARE
  v_batch_id text;
  v_filename text;
  v_skipped int;
  v_warnings int;
  v_created int;
  v_updated int;
  v_product_count int;
BEGIN
  PERFORM pg_advisory_xact_lock(hashtext('product_import'));
  v_batch_id := payload ->> 'batchId';
  v_filename := COALESCE(payload ->> 'filename', '');
  v_skipped := COALESCE((payload ->> 'skipped')::int, 0);
  v_warnings := COALESCE((payload ->> 'warnings')::int, 0);
  IF v_batch_id IS NULL OR btrim(v_batch_id) = '' THEN
    RAISE EXCEPTION 'batchId is required';
  END IF;
  v_product_count := COALESCE(jsonb_array_length(payload -> 'products'), 0);
  IF v_product_count = 0 THEN RAISE EXCEPTION 'products array is required'; END IF;
  IF v_product_count > 500 THEN RAISE EXCEPTION 'maximum 500 products per batch'; END IF;
  CREATE TEMP TABLE tmp_import_products ON COMMIT DROP AS
  SELECT * FROM jsonb_to_recordset(payload -> 'products') AS x(
    id text, slug text, name text, short_description text, long_description text,
    price numeric, promotional_price numeric, category text, club text, images text[],
    status text, import_batch_id text, is_update boolean
  );
  CREATE TEMP TABLE tmp_import_variations ON COMMIT DROP AS
  SELECT * FROM jsonb_to_recordset(payload -> 'variations') AS x(
    product_slug text, sku text, size text, color text, stock integer
  );
  IF EXISTS (SELECT 1 FROM tmp_import_products WHERE slug IS NULL OR btrim(slug) = '') THEN
    RAISE EXCEPTION 'empty slug in payload';
  END IF;
  IF EXISTS (SELECT slug FROM tmp_import_products GROUP BY slug HAVING COUNT(*) > 1) THEN
    RAISE EXCEPTION 'duplicate slug in payload';
  END IF;
  IF EXISTS (SELECT 1 FROM tmp_import_variations WHERE sku IS NULL OR btrim(sku) = '') THEN
    RAISE EXCEPTION 'empty sku in payload';
  END IF;
  IF EXISTS (SELECT sku FROM tmp_import_variations GROUP BY sku HAVING COUNT(*) > 1) THEN
    RAISE EXCEPTION 'duplicate sku in payload';
  END IF;
  IF EXISTS (
    SELECT 1 FROM tmp_import_variations iv
    LEFT JOIN tmp_import_products ip ON ip.slug = iv.product_slug
    WHERE ip.slug IS NULL
  ) THEN RAISE EXCEPTION 'variation references unknown product_slug'; END IF;
  IF EXISTS (
    SELECT 1 FROM tmp_import_products ip
    JOIN public.products p ON p.slug = ip.slug AND p.id <> ip.id
  ) THEN RAISE EXCEPTION 'slug already belongs to another product'; END IF;
  IF EXISTS (
    SELECT 1 FROM tmp_import_variations iv
    JOIN public.products p ON p.slug = iv.product_slug
    JOIN public.product_variations pv ON pv.sku = iv.sku
    WHERE pv.product_id <> p.id
  ) THEN RAISE EXCEPTION 'sku already belongs to another product'; END IF;
  IF EXISTS (
    SELECT 1 FROM tmp_import_products ip
    WHERE COALESCE(ip.is_update, false)
      AND NOT EXISTS (SELECT 1 FROM public.products p WHERE p.id = ip.id)
  ) THEN RAISE EXCEPTION 'update references missing product id'; END IF;
  SELECT
    COUNT(*) FILTER (WHERE NOT COALESCE(is_update, false)),
    COUNT(*) FILTER (WHERE COALESCE(is_update, false))
  INTO v_created, v_updated FROM tmp_import_products;
  INSERT INTO public.products (
    id, slug, name, short_description, long_description, price, promotional_price,
    category, club, images, status, import_batch_id, updated_at
  )
  SELECT ip.id, ip.slug, ip.name, COALESCE(ip.short_description, ''), COALESCE(ip.long_description, ''),
    ip.price, ip.promotional_price, COALESCE(ip.category, ''), ip.club,
    COALESCE(ip.images, '{}'::text[]), ip.status, v_batch_id, now()
  FROM tmp_import_products ip
  ON CONFLICT (id) DO UPDATE SET
    slug = EXCLUDED.slug, name = EXCLUDED.name, short_description = EXCLUDED.short_description,
    long_description = EXCLUDED.long_description, price = EXCLUDED.price,
    promotional_price = EXCLUDED.promotional_price, category = EXCLUDED.category,
    club = EXCLUDED.club, images = EXCLUDED.images, status = EXCLUDED.status,
    import_batch_id = EXCLUDED.import_batch_id, updated_at = now();
  IF EXISTS (
    SELECT 1 FROM tmp_import_variations iv
    JOIN public.products p ON p.slug = iv.product_slug
    JOIN public.product_variations pv ON pv.sku = iv.sku
    WHERE pv.product_id <> p.id
  ) THEN RAISE EXCEPTION 'sku already belongs to another product'; END IF;
  INSERT INTO public.product_variations (id, product_id, size, color, sku, stock)
  SELECT COALESCE(pv.id, gen_random_uuid()::text), p.id, iv.size, iv.color, iv.sku,
    GREATEST(0, COALESCE(iv.stock, 0))
  FROM tmp_import_variations iv
  JOIN public.products p ON p.slug = iv.product_slug
  LEFT JOIN public.product_variations pv ON pv.sku = iv.sku
  ON CONFLICT (sku) DO UPDATE SET size = EXCLUDED.size, color = EXCLUDED.color, stock = EXCLUDED.stock;
  INSERT INTO public.import_batches (
    id, filename, total, created, updated, skipped, warnings, errors, source
  ) VALUES (
    v_batch_id, left(v_filename, 255), v_product_count, v_created, v_updated, v_skipped, v_warnings, 0, 'csv'
  );
  RETURN jsonb_build_object(
    'batchId', v_batch_id, 'created', v_created, 'updated', v_updated, 'skipped', v_skipped
  );
END;
$$;

REVOKE ALL ON FUNCTION public.apply_product_import_batch(jsonb) FROM PUBLIC;
REVOKE ALL ON FUNCTION public.apply_product_import_batch(jsonb) FROM anon;
REVOKE ALL ON FUNCTION public.apply_product_import_batch(jsonb) FROM authenticated;
GRANT EXECUTE ON FUNCTION public.apply_product_import_batch(jsonb) TO service_role;

-- -----------------------------------------------------------------------------
-- 20260627153700_banner_slide_visibility
-- Visibilidade por dispositivo: all | desktop | mobile
-- -----------------------------------------------------------------------------

ALTER TABLE public.banner_slides
ALTER COLUMN desktop_image_path DROP NOT NULL;

ALTER TABLE public.banner_slides
ADD COLUMN IF NOT EXISTS visibility text NOT NULL DEFAULT 'all';

ALTER TABLE public.banner_slides
DROP CONSTRAINT IF EXISTS banner_slides_visibility_check;

ALTER TABLE public.banner_slides
ADD CONSTRAINT banner_slides_visibility_check
CHECK (visibility IN ('all', 'desktop', 'mobile'));
