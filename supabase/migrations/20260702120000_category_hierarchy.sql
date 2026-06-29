-- Categorias hierárquicas (máx. 3 níveis) + products.category_id

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

-- Raízes existentes: path = slug
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
