-- Transactional CSV import: single RPC, set-based upsert, full rollback on error.

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
  IF v_product_count = 0 THEN
    RAISE EXCEPTION 'products array is required';
  END IF;

  IF v_product_count > 500 THEN
    RAISE EXCEPTION 'maximum 500 products per batch';
  END IF;

  CREATE TEMP TABLE tmp_import_products ON COMMIT DROP AS
  SELECT *
  FROM jsonb_to_recordset(payload -> 'products') AS x(
    id text,
    slug text,
    name text,
    short_description text,
    long_description text,
    price numeric,
    promotional_price numeric,
    category text,
    club text,
    images text[],
    status text,
    import_batch_id text,
    is_update boolean
  );

  CREATE TEMP TABLE tmp_import_variations ON COMMIT DROP AS
  SELECT *
  FROM jsonb_to_recordset(payload -> 'variations') AS x(
    product_slug text,
    sku text,
    size text,
    color text,
    stock integer
  );

  IF EXISTS (
    SELECT 1 FROM tmp_import_products WHERE slug IS NULL OR btrim(slug) = ''
  ) THEN
    RAISE EXCEPTION 'empty slug in payload';
  END IF;

  IF EXISTS (
    SELECT slug FROM tmp_import_products GROUP BY slug HAVING COUNT(*) > 1
  ) THEN
    RAISE EXCEPTION 'duplicate slug in payload';
  END IF;

  IF EXISTS (
    SELECT 1 FROM tmp_import_variations WHERE sku IS NULL OR btrim(sku) = ''
  ) THEN
    RAISE EXCEPTION 'empty sku in payload';
  END IF;

  IF EXISTS (
    SELECT sku FROM tmp_import_variations GROUP BY sku HAVING COUNT(*) > 1
  ) THEN
    RAISE EXCEPTION 'duplicate sku in payload';
  END IF;

  IF EXISTS (
    SELECT 1
    FROM tmp_import_variations iv
    LEFT JOIN tmp_import_products ip ON ip.slug = iv.product_slug
    WHERE ip.slug IS NULL
  ) THEN
    RAISE EXCEPTION 'variation references unknown product_slug';
  END IF;

  IF EXISTS (
    SELECT 1
    FROM tmp_import_products ip
    JOIN public.products p ON p.slug = ip.slug AND p.id <> ip.id
  ) THEN
    RAISE EXCEPTION 'slug already belongs to another product';
  END IF;

  IF EXISTS (
    SELECT 1
    FROM tmp_import_variations iv
    JOIN public.products p ON p.slug = iv.product_slug
    JOIN public.product_variations pv ON pv.sku = iv.sku
    WHERE pv.product_id <> p.id
  ) THEN
    RAISE EXCEPTION 'sku already belongs to another product';
  END IF;

  IF EXISTS (
    SELECT 1
    FROM tmp_import_products ip
    WHERE COALESCE(ip.is_update, false)
      AND NOT EXISTS (SELECT 1 FROM public.products p WHERE p.id = ip.id)
  ) THEN
    RAISE EXCEPTION 'update references missing product id';
  END IF;

  SELECT
    COUNT(*) FILTER (WHERE NOT COALESCE(is_update, false)),
    COUNT(*) FILTER (WHERE COALESCE(is_update, false))
  INTO v_created, v_updated
  FROM tmp_import_products;

  INSERT INTO public.products (
    id,
    slug,
    name,
    short_description,
    long_description,
    price,
    promotional_price,
    category,
    club,
    images,
    status,
    import_batch_id,
    updated_at
  )
  SELECT
    ip.id,
    ip.slug,
    ip.name,
    COALESCE(ip.short_description, ''),
    COALESCE(ip.long_description, ''),
    ip.price,
    ip.promotional_price,
    COALESCE(ip.category, ''),
    ip.club,
    COALESCE(ip.images, '{}'::text[]),
    ip.status,
    v_batch_id,
    now()
  FROM tmp_import_products ip
  ON CONFLICT (id) DO UPDATE SET
    slug = EXCLUDED.slug,
    name = EXCLUDED.name,
    short_description = EXCLUDED.short_description,
    long_description = EXCLUDED.long_description,
    price = EXCLUDED.price,
    promotional_price = EXCLUDED.promotional_price,
    category = EXCLUDED.category,
    club = EXCLUDED.club,
    images = EXCLUDED.images,
    status = EXCLUDED.status,
    import_batch_id = EXCLUDED.import_batch_id,
    updated_at = now();

  INSERT INTO public.product_variations (id, product_id, size, color, sku, stock)
  SELECT
    COALESCE(pv.id, gen_random_uuid()::text),
    p.id,
    iv.size,
    iv.color,
    iv.sku,
    GREATEST(0, COALESCE(iv.stock, 0))
  FROM tmp_import_variations iv
  JOIN public.products p ON p.slug = iv.product_slug
  LEFT JOIN public.product_variations pv ON pv.sku = iv.sku
  ON CONFLICT (sku) DO UPDATE SET
    size = EXCLUDED.size,
    color = EXCLUDED.color,
    stock = EXCLUDED.stock;

  INSERT INTO public.import_batches (
    id,
    filename,
    total,
    created,
    updated,
    skipped,
    warnings,
    errors,
    source
  )
  VALUES (
    v_batch_id,
    left(v_filename, 255),
    v_product_count,
    v_created,
    v_updated,
    v_skipped,
    v_warnings,
    0,
    'csv'
  );

  RETURN jsonb_build_object(
    'batchId', v_batch_id,
    'created', v_created,
    'updated', v_updated,
    'skipped', v_skipped
  );
END;
$$;

REVOKE ALL ON FUNCTION public.apply_product_import_batch(jsonb) FROM PUBLIC;
REVOKE ALL ON FUNCTION public.apply_product_import_batch(jsonb) FROM anon;
REVOKE ALL ON FUNCTION public.apply_product_import_batch(jsonb) FROM authenticated;
GRANT EXECUTE ON FUNCTION public.apply_product_import_batch(jsonb) TO service_role;
