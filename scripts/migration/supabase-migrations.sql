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
-- 20260628230000_admin_query_optimizations
-- Contagens de mídia para onboarding admin (sem scan do catálogo inteiro).
-- -----------------------------------------------------------------------------

CREATE OR REPLACE FUNCTION public.images_has_external(p_images text[])
RETURNS boolean
LANGUAGE sql
IMMUTABLE
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM unnest(COALESCE(p_images, '{}')) AS u(url)
    WHERE nullif(trim(url), '') IS NOT NULL
      AND url NOT LIKE '%/storage/v1/object/public/products/%'
  );
$$;

CREATE OR REPLACE FUNCTION public.get_media_issue_count()
RETURNS int
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT COUNT(*)::int
  FROM public.products
  WHERE COALESCE(cardinality(images), 0) = 0
     OR public.images_has_external(images);
$$;

GRANT EXECUTE ON FUNCTION public.get_media_issue_count() TO authenticated, service_role;


-- -----------------------------------------------------------------------------
-- 20260628240000_sprint_a2_media_filters
-- Filtros mídia server-side, counts categorias, query admin paginada.
-- -----------------------------------------------------------------------------

CREATE OR REPLACE FUNCTION public.products_match_media(p_images text[], p_media text)
RETURNS boolean
LANGUAGE sql
IMMUTABLE
AS $$
  SELECT CASE
    WHEN p_media IS NULL OR p_media = 'all' THEN true
    WHEN p_media = 'empty' THEN COALESCE(cardinality(p_images), 0) = 0
    WHEN p_media = 'external' THEN public.images_has_external(p_images)
    WHEN p_media = 'broken' THEN public.images_has_external(p_images)
    WHEN p_media = 'storage' THEN
      COALESCE(cardinality(p_images), 0) > 0
      AND NOT public.images_has_external(p_images)
    ELSE true
  END;
$$;

CREATE OR REPLACE FUNCTION public.get_media_status_counts()
RETURNS jsonb
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT jsonb_build_object(
    'all', (SELECT COUNT(*)::int FROM public.products),
    'empty', (
      SELECT COUNT(*)::int FROM public.products
      WHERE COALESCE(cardinality(images), 0) = 0
    ),
    'external', (
      SELECT COUNT(*)::int FROM public.products
      WHERE public.images_has_external(images)
    ),
    'broken', 0,
    'storage', (
      SELECT COUNT(*)::int FROM public.products
      WHERE COALESCE(cardinality(images), 0) > 0
        AND NOT public.images_has_external(images)
    )
  );
$$;

CREATE OR REPLACE FUNCTION public.count_products_by_category()
RETURNS jsonb
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT COALESCE(
    jsonb_object_agg(
      category_key,
      jsonb_build_object(
        'total', total,
        'active', active
      )
    ),
    '{}'::jsonb
  )
  FROM (
    SELECT
      lower(trim(category)) AS category_key,
      COUNT(*)::int AS total,
      COUNT(*) FILTER (WHERE status = 'active')::int AS active
    FROM public.products
    WHERE nullif(trim(category), '') IS NOT NULL
    GROUP BY lower(trim(category))
  ) AS grouped;
$$;

CREATE OR REPLACE FUNCTION public.count_products_for_category(p_category text)
RETURNS jsonb
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT jsonb_build_object(
    'total', (
      SELECT COUNT(*)::int
      FROM public.products
      WHERE lower(trim(category)) = lower(trim(p_category))
         OR lower(trim(category)) = lower(trim(
           regexp_replace(regexp_replace(lower(trim(p_category)), '[^a-z0-9]+', '-', 'g'), '(^-|-$)', '', 'g')
         ))
    ),
    'active', (
      SELECT COUNT(*)::int
      FROM public.products
      WHERE status = 'active'
        AND (
          lower(trim(category)) = lower(trim(p_category))
          OR lower(trim(category)) = lower(trim(
            regexp_replace(regexp_replace(lower(trim(p_category)), '[^a-z0-9]+', '-', 'g'), '(^-|-$)', '', 'g')
          ))
        )
    )
  );
$$;

GRANT EXECUTE ON FUNCTION public.products_match_media(text[], text) TO authenticated, service_role;
GRANT EXECUTE ON FUNCTION public.get_media_status_counts() TO authenticated, service_role;
GRANT EXECUTE ON FUNCTION public.count_products_by_category() TO authenticated, service_role;
GRANT EXECUTE ON FUNCTION public.count_products_for_category(text) TO authenticated, service_role;

CREATE OR REPLACE FUNCTION public.query_admin_products_page(
  p_media text DEFAULT NULL,
  p_status text[] DEFAULT NULL,
  p_search text DEFAULT NULL,
  p_has_stock boolean DEFAULT NULL,
  p_page int DEFAULT 1,
  p_page_size int DEFAULT 25,
  p_order_col text DEFAULT 'name',
  p_asc boolean DEFAULT true
)
RETURNS jsonb
LANGUAGE plpgsql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_offset int := GREATEST(p_page - 1, 0) * p_page_size;
  v_total int;
  v_rows jsonb;
BEGIN
  SELECT COUNT(*)::int INTO v_total
  FROM public.products p
  WHERE (p_status IS NULL OR cardinality(p_status) = 0 OR p.status = ANY(p_status))
    AND (
      p_search IS NULL OR p_search = '' OR p.name ILIKE '%' || p_search || '%'
      OR EXISTS (
        SELECT 1 FROM public.product_variations v
        WHERE v.product_id = p.id AND v.sku ILIKE '%' || p_search || '%'
      )
    )
    AND (p_media IS NULL OR p_media = 'all' OR public.products_match_media(p.images, p_media))
    AND (
      p_has_stock IS NULL
      OR p_has_stock = (
        COALESCE((
          SELECT SUM(v.stock) FROM public.product_variations v WHERE v.product_id = p.id
        ), 0) > 0
      )
    );

  SELECT COALESCE(jsonb_agg(row_to_json(sub.*)), '[]'::jsonb) INTO v_rows
  FROM (
    SELECT
      p.id,
      p.slug,
      p.name,
      p.short_description,
      p.price,
      p.promotional_price,
      p.category,
      p.club,
      p.images,
      p.status,
      p.import_batch_id,
      COALESCE((
        SELECT jsonb_agg(jsonb_build_object(
          'id', v.id,
          'sku', v.sku,
          'stock', v.stock,
          'size', v.size,
          'color', v.color
        ) ORDER BY v.sku)
        FROM public.product_variations v
        WHERE v.product_id = p.id
      ), '[]'::jsonb) AS product_variations
    FROM public.products p
    WHERE (p_status IS NULL OR cardinality(p_status) = 0 OR p.status = ANY(p_status))
      AND (
        p_search IS NULL OR p_search = '' OR p.name ILIKE '%' || p_search || '%'
        OR EXISTS (
          SELECT 1 FROM public.product_variations v
          WHERE v.product_id = p.id AND v.sku ILIKE '%' || p_search || '%'
        )
      )
      AND (p_media IS NULL OR p_media = 'all' OR public.products_match_media(p.images, p_media))
      AND (
        p_has_stock IS NULL
        OR p_has_stock = (
          COALESCE((
            SELECT SUM(v.stock) FROM public.product_variations v WHERE v.product_id = p.id
          ), 0) > 0
        )
      )
    ORDER BY
      CASE WHEN p_order_col = 'name' AND p_asc THEN p.name END ASC NULLS LAST,
      CASE WHEN p_order_col = 'name' AND NOT p_asc THEN p.name END DESC NULLS LAST,
      CASE WHEN p_order_col = 'price' AND p_asc THEN p.price END ASC NULLS LAST,
      CASE WHEN p_order_col = 'price' AND NOT p_asc THEN p.price END DESC NULLS LAST,
      CASE WHEN p_order_col = 'id' AND p_asc THEN p.id END ASC NULLS LAST,
      CASE WHEN p_order_col = 'id' AND NOT p_asc THEN p.id END DESC NULLS LAST,
      p.id ASC
    LIMIT p_page_size
    OFFSET v_offset
  ) sub;

  RETURN jsonb_build_object('total', v_total, 'products', v_rows);
END;
$$;

GRANT EXECUTE ON FUNCTION public.query_admin_products_page(text, text[], text, boolean, int, int, text, boolean) TO authenticated, service_role;


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

-- -----------------------------------------------------------------------------
-- 20260627210000_store_onboarding
-- Estado operacional da implantação (separado de store_settings).
-- -----------------------------------------------------------------------------

CREATE TABLE IF NOT EXISTS public.store_onboarding (
  id text PRIMARY KEY DEFAULT 'default',
  state jsonb NOT NULL DEFAULT '{}'::jsonb,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

DROP TRIGGER IF EXISTS store_onboarding_set_updated_at ON public.store_onboarding;
CREATE TRIGGER store_onboarding_set_updated_at
  BEFORE UPDATE ON public.store_onboarding
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

ALTER TABLE public.store_onboarding ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "store_onboarding_admin_select" ON public.store_onboarding;
CREATE POLICY "store_onboarding_admin_select"
  ON public.store_onboarding FOR SELECT
  TO authenticated
  USING (public.is_store_admin());

DROP POLICY IF EXISTS "store_onboarding_admin_insert" ON public.store_onboarding;
CREATE POLICY "store_onboarding_admin_insert"
  ON public.store_onboarding FOR INSERT
  TO authenticated
  WITH CHECK (public.is_store_admin());

DROP POLICY IF EXISTS "store_onboarding_admin_update" ON public.store_onboarding;
CREATE POLICY "store_onboarding_admin_update"
  ON public.store_onboarding FOR UPDATE
  TO authenticated
  USING (public.is_store_admin())
  WITH CHECK (public.is_store_admin());

DROP POLICY IF EXISTS "store_onboarding_admin_delete" ON public.store_onboarding;
CREATE POLICY "store_onboarding_admin_delete"
  ON public.store_onboarding FOR DELETE
  TO authenticated
  USING (public.is_store_admin());

GRANT SELECT, INSERT, UPDATE, DELETE ON public.store_onboarding TO authenticated;

INSERT INTO public.store_onboarding (id)
VALUES ('default')
ON CONFLICT (id) DO NOTHING;


-- -----------------------------------------------------------------------------
-- 20260629120000_sprint_c_storefront_category_query
-- PLP ?category= paginada no SQL (sem pool de 5000 produtos em memória).
-- -----------------------------------------------------------------------------

CREATE OR REPLACE FUNCTION public.product_matches_storefront_category(
  p_product_category text,
  p_filter_param text
)
RETURNS boolean
LANGUAGE sql
IMMUTABLE
AS $$
  SELECT CASE
    WHEN p_filter_param IS NULL OR btrim(p_filter_param) = '' THEN true
    WHEN btrim(COALESCE(p_product_category, '')) = '' THEN false
    ELSE (
      lower(trim(p_product_category)) = lower(trim(p_filter_param))
      OR lower(trim(p_product_category)) = lower(trim(
        regexp_replace(
          regexp_replace(lower(trim(p_filter_param)), '[^a-z0-9]+', '-', 'g'),
          '(^-|-$)', '', 'g'
        )
      ))
      OR lower(trim(
        regexp_replace(
          regexp_replace(lower(trim(p_product_category)), '[^a-z0-9]+', '-', 'g'),
          '(^-|-$)', '', 'g'
        )
      )) = lower(trim(
        regexp_replace(
          regexp_replace(lower(trim(p_filter_param)), '[^a-z0-9]+', '-', 'g'),
          '(^-|-$)', '', 'g'
        )
      ))
      OR EXISTS (
        SELECT 1
        FROM public.categories c
        WHERE c.visible = true
          AND (
            lower(trim(c.slug)) = lower(trim(p_filter_param))
            OR lower(trim(c.name)) = lower(trim(p_filter_param))
            OR lower(trim(c.slug)) = lower(trim(
              regexp_replace(
                regexp_replace(lower(trim(p_filter_param)), '[^a-z0-9]+', '-', 'g'),
                '(^-|-$)', '', 'g'
              )
            ))
          )
          AND (
            lower(trim(p_product_category)) = lower(trim(c.slug))
            OR lower(trim(p_product_category)) = lower(trim(c.name))
            OR lower(trim(
              regexp_replace(
                regexp_replace(lower(trim(p_product_category)), '[^a-z0-9]+', '-', 'g'),
                '(^-|-$)', '', 'g'
              )
            )) = lower(trim(c.slug))
          )
      )
    )
  END;
$$;

CREATE OR REPLACE FUNCTION public.query_storefront_products_page(
  p_category_param text DEFAULT NULL,
  p_page int DEFAULT 1,
  p_page_size int DEFAULT 24
)
RETURNS jsonb
LANGUAGE plpgsql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_offset int := GREATEST(p_page - 1, 0) * p_page_size;
  v_total int;
  v_rows jsonb;
BEGIN
  SELECT COUNT(*)::int INTO v_total
  FROM public.products p
  WHERE p.status = 'active'
    AND public.product_matches_storefront_category(p.category, p_category_param);

  SELECT COALESCE(jsonb_agg(row_to_json(sub.*)), '[]'::jsonb) INTO v_rows
  FROM (
    SELECT
      p.id,
      p.slug,
      p.name,
      p.short_description,
      p.price,
      p.promotional_price,
      p.category,
      p.club,
      p.images,
      p.status,
      p.import_batch_id,
      COALESCE((
        SELECT jsonb_agg(jsonb_build_object(
          'id', v.id,
          'sku', v.sku,
          'stock', v.stock,
          'size', v.size,
          'color', v.color
        ) ORDER BY v.sku)
        FROM public.product_variations v
        WHERE v.product_id = p.id
      ), '[]'::jsonb) AS product_variations
    FROM public.products p
    WHERE p.status = 'active'
      AND public.product_matches_storefront_category(p.category, p_category_param)
    ORDER BY p.name ASC, p.id ASC
    LIMIT p_page_size
    OFFSET v_offset
  ) sub;

  RETURN jsonb_build_object('total', v_total, 'products', v_rows);
END;
$$;

GRANT EXECUTE ON FUNCTION public.product_matches_storefront_category(text, text) TO authenticated, service_role, anon;
GRANT EXECUTE ON FUNCTION public.query_storefront_products_page(text, int, int) TO authenticated, service_role, anon;


-- -----------------------------------------------------------------------------
-- 20260701120000_commercial_rules_and_personalization
-- Regras comerciais (promoções) + personalização global e por produto.
-- -----------------------------------------------------------------------------

CREATE TABLE IF NOT EXISTS public.commercial_rules (
  id text PRIMARY KEY,
  kind text NOT NULL DEFAULT 'promotion'
    CHECK (kind IN ('promotion')),
  name text NOT NULL,
  type text NOT NULL DEFAULT 'quantity_discount'
    CHECK (type IN ('quantity_discount')),
  status text NOT NULL DEFAULT 'draft'
    CHECK (status IN ('draft', 'scheduled', 'active', 'expired', 'archived')),
  priority int NOT NULL DEFAULT 0,
  stackable boolean NOT NULL DEFAULT false,
  applies_to text NOT NULL DEFAULT 'all_products'
    CHECK (applies_to = 'all_products'),
  config jsonb NOT NULL DEFAULT '{}'::jsonb,
  starts_at timestamptz,
  ends_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT commercial_rules_date_range CHECK (
    starts_at IS NULL OR ends_at IS NULL OR starts_at <= ends_at
  )
);

CREATE INDEX IF NOT EXISTS commercial_rules_storefront_idx
  ON public.commercial_rules (status, priority DESC, starts_at, ends_at);

ALTER TABLE public.products
  ADD COLUMN IF NOT EXISTS personalization_enabled boolean NOT NULL DEFAULT false,
  ADD COLUMN IF NOT EXISTS personalization_price numeric(12,2)
    CHECK (personalization_price IS NULL OR personalization_price >= 0);

ALTER TABLE public.store_settings
  ADD COLUMN IF NOT EXISTS personalization_enabled boolean NOT NULL DEFAULT false,
  ADD COLUMN IF NOT EXISTS personalization_default_price numeric(12,2) NOT NULL DEFAULT 0,
  ADD COLUMN IF NOT EXISTS personalization_name_max_length int NOT NULL DEFAULT 15,
  ADD COLUMN IF NOT EXISTS personalization_number_min int NOT NULL DEFAULT 0,
  ADD COLUMN IF NOT EXISTS personalization_number_max int NOT NULL DEFAULT 99,
  ADD COLUMN IF NOT EXISTS personalization_notes_required boolean NOT NULL DEFAULT false,
  ADD COLUMN IF NOT EXISTS personalization_notes_max_length int NOT NULL DEFAULT 200;

ALTER TABLE public.commercial_rules ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "commercial_rules_public_read" ON public.commercial_rules;
CREATE POLICY "commercial_rules_public_read"
  ON public.commercial_rules FOR SELECT
  TO anon, authenticated
  USING (status IN ('active', 'scheduled'));

DROP POLICY IF EXISTS "commercial_rules_admin_select" ON public.commercial_rules;
CREATE POLICY "commercial_rules_admin_select"
  ON public.commercial_rules FOR SELECT
  TO authenticated
  USING (public.is_store_admin());

DROP POLICY IF EXISTS "commercial_rules_admin_insert" ON public.commercial_rules;
CREATE POLICY "commercial_rules_admin_insert"
  ON public.commercial_rules FOR INSERT
  TO authenticated
  WITH CHECK (public.is_store_admin());

DROP POLICY IF EXISTS "commercial_rules_admin_update" ON public.commercial_rules;
CREATE POLICY "commercial_rules_admin_update"
  ON public.commercial_rules FOR UPDATE
  TO authenticated
  USING (public.is_store_admin())
  WITH CHECK (public.is_store_admin());

DROP POLICY IF EXISTS "commercial_rules_admin_delete" ON public.commercial_rules;
CREATE POLICY "commercial_rules_admin_delete"
  ON public.commercial_rules FOR DELETE
  TO authenticated
  USING (public.is_store_admin());


-- -----------------------------------------------------------------------------
-- 20260702120000_category_hierarchy
-- Categorias hierárquicas (máx. 3 níveis) + products.category_id
-- -----------------------------------------------------------------------------

-- Categorias hierÃ¡rquicas (mÃ¡x. 3 nÃ­veis) + products.category_id

ALTER TABLE public.categories
  ADD COLUMN IF NOT EXISTS parent_id text REFERENCES public.categories(id) ON DELETE RESTRICT,
  ADD COLUMN IF NOT EXISTS depth smallint NOT NULL DEFAULT 0,
  ADD COLUMN IF NOT EXISTS path text NOT NULL DEFAULT '';

ALTER TABLE public.products
  ADD COLUMN IF NOT EXISTS category_id text REFERENCES public.categories(id) ON DELETE SET NULL;

ALTER TABLE public.categories DROP CONSTRAINT IF EXISTS categories_depth_check;
ALTER TABLE public.categories
  ADD CONSTRAINT categories_depth_check CHECK (depth BETWEEN 0 AND 2);

CREATE INDEX IF NOT EXISTS categories_parent_idx ON public.categories(parent_id);
CREATE INDEX IF NOT EXISTS categories_path_idx ON public.categories(path);
CREATE INDEX IF NOT EXISTS products_category_id_idx ON public.products(category_id);

-- RaÃ­zes existentes: path = slug
UPDATE public.categories
SET
  parent_id = NULL,
  depth = 0,
  path = slug
WHERE parent_id IS NULL
  AND (path IS NULL OR btrim(path) = '');

-- Vincular produtos por slug/nome legado
UPDATE public.products p
SET category_id = c.id
FROM public.categories c
WHERE p.category_id IS NULL
  AND btrim(COALESCE(p.category, '')) <> ''
  AND (
    lower(trim(p.category)) = lower(trim(c.slug))
    OR lower(trim(p.category)) = lower(trim(c.name))
  );

CREATE OR REPLACE FUNCTION public.refresh_category_path_for_row(
  p_id text,
  p_parent_id text,
  p_slug text
)
RETURNS TABLE(depth smallint, path text)
LANGUAGE plpgsql
AS $$
DECLARE
  v_parent_depth smallint := -1;
  v_parent_path text := '';
  v_depth smallint;
  v_path text;
BEGIN
  IF p_parent_id IS NULL THEN
    v_depth := 0;
    v_path := p_slug;
  ELSE
    SELECT c.depth, c.path
    INTO v_parent_depth, v_parent_path
    FROM public.categories c
    WHERE c.id = p_parent_id;

    IF NOT FOUND THEN
      RAISE EXCEPTION 'parent category not found';
    END IF;

    v_depth := v_parent_depth + 1;
    IF v_depth > 2 THEN
      RAISE EXCEPTION 'category depth exceeds maximum of 3 levels';
    END IF;

    v_path := v_parent_path || '/' || p_slug;
  END IF;

  RETURN QUERY SELECT v_depth, v_path;
END;
$$;

CREATE OR REPLACE FUNCTION public.categories_refresh_path_trigger()
RETURNS trigger
LANGUAGE plpgsql
AS $$
DECLARE
  v_fields record;
BEGIN
  SELECT * INTO v_fields
  FROM public.refresh_category_path_for_row(NEW.id, NEW.parent_id, NEW.slug);

  NEW.depth := v_fields.depth;
  NEW.path := v_fields.path;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS categories_refresh_path ON public.categories;
CREATE TRIGGER categories_refresh_path
  BEFORE INSERT OR UPDATE OF parent_id, slug ON public.categories
  FOR EACH ROW
  EXECUTE FUNCTION public.categories_refresh_path_trigger();

CREATE OR REPLACE FUNCTION public.resolve_storefront_category_filter(p_filter_param text)
RETURNS TABLE(id text, path text, slug text)
LANGUAGE sql
STABLE
AS $$
  SELECT c.id, c.path, c.slug
  FROM public.categories c
  WHERE c.visible = true
    AND (
      lower(trim(c.slug)) = lower(trim(p_filter_param))
      OR lower(trim(c.name)) = lower(trim(p_filter_param))
      OR lower(trim(c.slug)) = lower(trim(
        regexp_replace(
          regexp_replace(lower(trim(p_filter_param)), '[^a-z0-9]+', '-', 'g'),
          '(^-|-$)', '', 'g'
        )
      ))
    )
  LIMIT 1;
$$;

DROP FUNCTION IF EXISTS public.product_matches_storefront_category(text, text);

CREATE OR REPLACE FUNCTION public.product_matches_storefront_category(
  p_product_category_id text,
  p_product_category text,
  p_filter_param text
)
RETURNS boolean
LANGUAGE sql
STABLE
AS $$
  SELECT CASE
    WHEN p_filter_param IS NULL OR btrim(p_filter_param) = '' THEN true
    ELSE COALESCE(
      (
        SELECT true
        FROM public.resolve_storefront_category_filter(p_filter_param) f
        WHERE (
          p_product_category_id IS NOT NULL
          AND EXISTS (
            SELECT 1
            FROM public.categories pc
            WHERE pc.id = p_product_category_id
              AND (
                pc.id = f.id
                OR pc.path = f.path
                OR pc.path LIKE f.path || '/%'
              )
          )
        )
        OR (
          btrim(COALESCE(p_product_category, '')) <> ''
          AND (
            EXISTS (
              SELECT 1
              FROM public.categories pc
              JOIN public.categories fc ON fc.id = f.id
              WHERE (
                lower(trim(pc.slug)) = lower(trim(p_product_category))
                OR lower(trim(pc.name)) = lower(trim(p_product_category))
              )
              AND (
                pc.id = fc.id
                OR pc.path = fc.path
                OR pc.path LIKE fc.path || '/%'
              )
            )
            OR lower(trim(p_product_category)) = lower(trim(f.slug))
            OR lower(trim(p_product_category)) = lower(trim(f.path))
          )
        )
      ),
      false
    )
  END;
$$;

CREATE OR REPLACE FUNCTION public.query_storefront_products_page(
  p_category_param text DEFAULT NULL,
  p_page int DEFAULT 1,
  p_page_size int DEFAULT 24
)
RETURNS jsonb
LANGUAGE plpgsql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_offset int := GREATEST(p_page - 1, 0) * p_page_size;
  v_total int;
  v_rows jsonb;
BEGIN
  SELECT COUNT(*)::int INTO v_total
  FROM public.products p
  WHERE p.status = 'active'
    AND public.product_matches_storefront_category(p.category_id, p.category, p_category_param);

  SELECT COALESCE(jsonb_agg(row_to_json(sub.*)), '[]'::jsonb) INTO v_rows
  FROM (
    SELECT
      p.id,
      p.slug,
      p.name,
      p.short_description,
      p.price,
      p.promotional_price,
      p.category,
      p.category_id,
      p.club,
      p.images,
      p.status,
      p.import_batch_id,
      p.personalization_enabled,
      p.personalization_price,
      COALESCE((
        SELECT jsonb_agg(jsonb_build_object(
          'id', v.id,
          'sku', v.sku,
          'stock', v.stock,
          'size', v.size,
          'color', v.color
        ) ORDER BY v.sku)
        FROM public.product_variations v
        WHERE v.product_id = p.id
      ), '[]'::jsonb) AS product_variations
    FROM public.products p
    WHERE p.status = 'active'
      AND public.product_matches_storefront_category(p.category_id, p.category, p_category_param)
    ORDER BY p.name ASC, p.id ASC
    LIMIT p_page_size
    OFFSET v_offset
  ) sub;

  RETURN jsonb_build_object('total', v_total, 'products', v_rows);
END;
$$;

CREATE OR REPLACE FUNCTION public.count_products_for_category(p_category text)
RETURNS jsonb
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT jsonb_build_object(
    'total', (
      SELECT COUNT(*)::int
      FROM public.products p
      WHERE public.product_matches_storefront_category(p.category_id, p.category, p_category)
    ),
    'active', (
      SELECT COUNT(*)::int
      FROM public.products p
      WHERE p.status = 'active'
        AND public.product_matches_storefront_category(p.category_id, p.category, p_category)
    )
  );
$$;

GRANT EXECUTE ON FUNCTION public.refresh_category_path_for_row(text, text, text) TO authenticated, service_role;
GRANT EXECUTE ON FUNCTION public.resolve_storefront_category_filter(text) TO authenticated, service_role, anon;
GRANT EXECUTE ON FUNCTION public.product_matches_storefront_category(text, text, text) TO authenticated, service_role, anon;
GRANT EXECUTE ON FUNCTION public.query_storefront_products_page(text, int, int) TO authenticated, service_role, anon;
GRANT EXECUTE ON FUNCTION public.count_products_for_category(text) TO authenticated, service_role;

-- -----------------------------------------------------------------------------
-- 20260730120000_category_path_cascade
-- Cascade path/depth para descendentes ao mover ou renomear categoria pai
-- -----------------------------------------------------------------------------

CREATE OR REPLACE FUNCTION public.category_subtree_relative_max_depth(p_id text)
RETURNS smallint
LANGUAGE sql
STABLE
AS $$
  WITH RECURSIVE subtree AS (
    SELECT id, 0::smallint AS rel
    FROM public.categories
    WHERE id = p_id
    UNION ALL
    SELECT c.id, (s.rel + 1)::smallint
    FROM public.categories c
    JOIN subtree s ON c.parent_id = s.id
  )
  SELECT COALESCE(MAX(rel), 0)::smallint
  FROM subtree;
$$;

CREATE OR REPLACE FUNCTION public.refresh_category_subtree(p_root_id text)
RETURNS void
LANGUAGE plpgsql
AS $$
DECLARE
  v_parent_path text;
  v_parent_depth smallint;
  child record;
BEGIN
  SELECT path, depth
  INTO v_parent_path, v_parent_depth
  FROM public.categories
  WHERE id = p_root_id;

  IF NOT FOUND THEN
    RETURN;
  END IF;

  FOR child IN
    SELECT id, slug
    FROM public.categories
    WHERE parent_id = p_root_id
    ORDER BY sort_order, name
  LOOP
    UPDATE public.categories
    SET
      depth = v_parent_depth + 1,
      path = v_parent_path || '/' || child.slug
    WHERE id = child.id;

    PERFORM public.refresh_category_subtree(child.id);
  END LOOP;
END;
$$;

CREATE OR REPLACE FUNCTION public.refresh_all_category_paths()
RETURNS void
LANGUAGE plpgsql
AS $$
DECLARE
  root record;
BEGIN
  FOR root IN
    SELECT id, slug
    FROM public.categories
    WHERE parent_id IS NULL
    ORDER BY sort_order, name
  LOOP
    UPDATE public.categories
    SET depth = 0, path = root.slug
    WHERE id = root.id;

    PERFORM public.refresh_category_subtree(root.id);
  END LOOP;
END;
$$;

CREATE OR REPLACE FUNCTION public.categories_refresh_path_trigger()
RETURNS trigger
LANGUAGE plpgsql
AS $$
DECLARE
  v_fields record;
  v_relative smallint;
BEGIN
  IF NEW.parent_id IS NOT NULL THEN
    IF NEW.parent_id = NEW.id THEN
      RAISE EXCEPTION 'category cannot be its own parent';
    END IF;

    IF EXISTS (
      WITH RECURSIVE descendants AS (
        SELECT id
        FROM public.categories
        WHERE parent_id = NEW.id
        UNION ALL
        SELECT c.id
        FROM public.categories c
        JOIN descendants d ON c.parent_id = d.id
      )
      SELECT 1
      FROM descendants
      WHERE id = NEW.parent_id
    ) THEN
      RAISE EXCEPTION 'cannot move category under descendant';
    END IF;
  END IF;

  SELECT * INTO v_fields
  FROM public.refresh_category_path_for_row(NEW.id, NEW.parent_id, NEW.slug);

  NEW.depth := v_fields.depth;
  NEW.path := v_fields.path;

  IF TG_OP = 'UPDATE'
    AND (
      OLD.parent_id IS DISTINCT FROM NEW.parent_id
      OR OLD.slug IS DISTINCT FROM NEW.slug
    )
  THEN
    v_relative := public.category_subtree_relative_max_depth(NEW.id);
    IF NEW.depth + v_relative > 2 THEN
      RAISE EXCEPTION 'category depth exceeds maximum of 3 levels';
    END IF;
  END IF;

  RETURN NEW;
END;
$$;

CREATE OR REPLACE FUNCTION public.categories_cascade_paths_trigger()
RETURNS trigger
LANGUAGE plpgsql
AS $$
BEGIN
  IF TG_OP = 'UPDATE'
    AND (
      OLD.parent_id IS DISTINCT FROM NEW.parent_id
      OR OLD.slug IS DISTINCT FROM NEW.slug
    )
  THEN
    PERFORM public.refresh_category_subtree(NEW.id);
  END IF;

  RETURN NULL;
END;
$$;

DROP TRIGGER IF EXISTS categories_cascade_paths ON public.categories;
CREATE TRIGGER categories_cascade_paths
  AFTER UPDATE OF parent_id, slug ON public.categories
  FOR EACH ROW
  EXECUTE FUNCTION public.categories_cascade_paths_trigger();

SELECT public.refresh_all_category_paths();

GRANT EXECUTE ON FUNCTION public.category_subtree_relative_max_depth(text) TO authenticated, service_role;
GRANT EXECUTE ON FUNCTION public.refresh_category_subtree(text) TO authenticated, service_role;
GRANT EXECUTE ON FUNCTION public.refresh_all_category_paths() TO authenticated, service_role;

-- -----------------------------------------------------------------------------
-- 20260731120000_category_depth_four_levels
-- Limite depth 0–3 (4 níveis visuais); ex.: Camisas > Brasileiro > Retrô > Santa Cruz
-- -----------------------------------------------------------------------------

ALTER TABLE public.categories DROP CONSTRAINT IF EXISTS categories_depth_check;
ALTER TABLE public.categories
  ADD CONSTRAINT categories_depth_check CHECK (depth BETWEEN 0 AND 3);

CREATE OR REPLACE FUNCTION public.refresh_category_path_for_row(
  p_id text,
  p_parent_id text,
  p_slug text
)
RETURNS TABLE(depth smallint, path text)
LANGUAGE plpgsql
AS $$
DECLARE
  v_parent_depth smallint := -1;
  v_parent_path text := '';
  v_depth smallint;
  v_path text;
BEGIN
  IF p_parent_id IS NULL THEN
    v_depth := 0;
    v_path := p_slug;
  ELSE
    SELECT c.depth, c.path
    INTO v_parent_depth, v_parent_path
    FROM public.categories c
    WHERE c.id = p_parent_id;

    IF NOT FOUND THEN
      RAISE EXCEPTION 'parent category not found';
    END IF;

    v_depth := v_parent_depth + 1;
    IF v_depth > 3 THEN
      RAISE EXCEPTION 'category depth exceeds maximum of 4 levels';
    END IF;

    v_path := v_parent_path || '/' || p_slug;
  END IF;

  RETURN QUERY SELECT v_depth, v_path;
END;
$$;

CREATE OR REPLACE FUNCTION public.categories_refresh_path_trigger()
RETURNS trigger
LANGUAGE plpgsql
AS $$
DECLARE
  v_fields record;
  v_relative smallint;
BEGIN
  IF NEW.parent_id IS NOT NULL THEN
    IF NEW.parent_id = NEW.id THEN
      RAISE EXCEPTION 'category cannot be its own parent';
    END IF;

    IF EXISTS (
      WITH RECURSIVE descendants AS (
        SELECT id
        FROM public.categories
        WHERE parent_id = NEW.id
        UNION ALL
        SELECT c.id
        FROM public.categories c
        JOIN descendants d ON c.parent_id = d.id
      )
      SELECT 1
      FROM descendants
      WHERE id = NEW.parent_id
    ) THEN
      RAISE EXCEPTION 'cannot move category under descendant';
    END IF;
  END IF;

  SELECT * INTO v_fields
  FROM public.refresh_category_path_for_row(NEW.id, NEW.parent_id, NEW.slug);

  NEW.depth := v_fields.depth;
  NEW.path := v_fields.path;

  IF TG_OP = 'UPDATE'
    AND (
      OLD.parent_id IS DISTINCT FROM NEW.parent_id
      OR OLD.slug IS DISTINCT FROM NEW.slug
    )
  THEN
    v_relative := public.category_subtree_relative_max_depth(NEW.id);
    IF NEW.depth + v_relative > 3 THEN
      RAISE EXCEPTION 'category depth exceeds maximum of 4 levels';
    END IF;
  END IF;

  RETURN NEW;
END;
$$;


-- -----------------------------------------------------------------------------
-- 20260714170000_create_product_with_variations
-- Create manual at�mico (INSERT estrito, sem upsert) � produto + varia��es.
-- -----------------------------------------------------------------------------

-- Create manual atômico: INSERT estrito (sem upsert) de produto + variações numa transação.
-- Substitui o create via nextProductIdFromDb + upsert onConflict id (risco de overwrite).

CREATE OR REPLACE FUNCTION public.create_product_with_variations(payload jsonb)
RETURNS jsonb
LANGUAGE plpgsql
VOLATILE
SECURITY INVOKER
SET search_path = ''
AS $$
DECLARE
  v_product jsonb;
  v_id text;
  v_slug text;
  v_status text;
  v_variation_count int;
  v_images text[];
BEGIN
  v_product := payload -> 'product';
  IF v_product IS NULL OR jsonb_typeof(v_product) <> 'object' THEN
    RAISE EXCEPTION 'product object is required';
  END IF;

  v_id := btrim(COALESCE(v_product ->> 'id', ''));
  v_slug := btrim(COALESCE(v_product ->> 'slug', ''));
  v_status := COALESCE(NULLIF(btrim(v_product ->> 'status'), ''), 'draft');

  IF v_id = '' THEN
    RAISE EXCEPTION 'product.id is required';
  END IF;

  IF v_slug = '' THEN
    RAISE EXCEPTION 'product.slug is required';
  END IF;

  IF v_status NOT IN ('active', 'draft', 'unavailable') THEN
    RAISE EXCEPTION 'invalid product.status: %', v_status;
  END IF;

  IF EXISTS (SELECT 1 FROM public.products p WHERE p.id = v_id) THEN
    RAISE EXCEPTION 'product id already exists: %', v_id;
  END IF;

  IF EXISTS (SELECT 1 FROM public.products p WHERE p.slug = v_slug) THEN
    RAISE EXCEPTION 'slug already belongs to another product: %', v_slug;
  END IF;

  v_variation_count := COALESCE(jsonb_array_length(payload -> 'variations'), 0);
  IF v_variation_count = 0 THEN
    RAISE EXCEPTION 'at least one variation is required';
  END IF;

  IF EXISTS (
    SELECT 1
    FROM jsonb_array_elements(payload -> 'variations') AS v(elem)
    WHERE btrim(COALESCE(elem ->> 'sku', '')) = ''
  ) THEN
    RAISE EXCEPTION 'empty sku in variations';
  END IF;

  IF EXISTS (
    SELECT btrim(elem ->> 'sku') AS sku
    FROM jsonb_array_elements(payload -> 'variations') AS v(elem)
    GROUP BY btrim(elem ->> 'sku')
    HAVING COUNT(*) > 1
  ) THEN
    RAISE EXCEPTION 'duplicate sku in payload';
  END IF;

  IF EXISTS (
    SELECT 1
    FROM jsonb_array_elements(payload -> 'variations') AS v(elem)
    JOIN public.product_variations pv ON pv.sku = btrim(elem ->> 'sku')
  ) THEN
    RAISE EXCEPTION 'sku already belongs to another product';
  END IF;

  SELECT COALESCE(
    ARRAY(
      SELECT jsonb_array_elements_text(COALESCE(v_product -> 'images', '[]'::jsonb))
    ),
    '{}'::text[]
  )
  INTO v_images;

  INSERT INTO public.products (
    id,
    slug,
    name,
    short_description,
    long_description,
    price,
    promotional_price,
    category,
    category_id,
    club,
    images,
    status,
    import_batch_id,
    personalization_enabled,
    personalization_price,
    updated_at
  )
  VALUES (
    v_id,
    v_slug,
    btrim(COALESCE(v_product ->> 'name', '')),
    COALESCE(v_product ->> 'short_description', ''),
    COALESCE(v_product ->> 'long_description', ''),
    COALESCE((v_product ->> 'price')::numeric, 0),
    NULLIF(v_product ->> 'promotional_price', '')::numeric,
    COALESCE(v_product ->> 'category', ''),
    NULLIF(btrim(COALESCE(v_product ->> 'category_id', '')), ''),
    NULLIF(btrim(COALESCE(v_product ->> 'club', '')), ''),
    v_images,
    v_status,
    NULLIF(btrim(COALESCE(v_product ->> 'import_batch_id', '')), ''),
    COALESCE((v_product ->> 'personalization_enabled')::boolean, false),
    NULLIF(v_product ->> 'personalization_price', '')::numeric,
    now()
  );

  INSERT INTO public.product_variations (id, product_id, size, color, sku, stock)
  SELECT
    COALESCE(NULLIF(btrim(elem ->> 'id'), ''), gen_random_uuid()::text),
    v_id,
    NULLIF(btrim(COALESCE(elem ->> 'size', '')), ''),
    NULLIF(btrim(COALESCE(elem ->> 'color', '')), ''),
    btrim(elem ->> 'sku'),
    GREATEST(0, COALESCE((elem ->> 'stock')::integer, 0))
  FROM jsonb_array_elements(payload -> 'variations') AS v(elem);

  RETURN jsonb_build_object(
    'id', v_id,
    'slug', v_slug,
    'variationCount', v_variation_count
  );
END;
$$;

REVOKE ALL ON FUNCTION public.create_product_with_variations(jsonb) FROM PUBLIC;
REVOKE ALL ON FUNCTION public.create_product_with_variations(jsonb) FROM anon;
REVOKE ALL ON FUNCTION public.create_product_with_variations(jsonb) FROM authenticated;
GRANT EXECUTE ON FUNCTION public.create_product_with_variations(jsonb) TO service_role;
