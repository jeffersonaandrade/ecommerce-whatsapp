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
