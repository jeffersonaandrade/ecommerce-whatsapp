-- Sprint A2: filtros de mídia server-side + contagens + query admin otimizada.

CREATE OR REPLACE FUNCTION public.products_match_media(p_images text[], p_media text)
RETURNS boolean
LANGUAGE sql
IMMUTABLE
AS $$
  SELECT CASE
    WHEN p_media IS NULL OR p_media = 'all' THEN true
    WHEN p_media = 'empty' THEN COALESCE(cardinality(p_images), 0) = 0
    WHEN p_media IN ('external', 'broken') THEN public.images_has_external(p_images)
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
    'broken', (
      SELECT COUNT(*)::int FROM public.products
      WHERE public.images_has_external(images)
    ),
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
