-- Corrige classificação de mídia: URL externa != quebrada.
-- "broken" não é inferível server-side sem probe persistente.

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

GRANT EXECUTE ON FUNCTION public.products_match_media(text[], text) TO authenticated, service_role;
GRANT EXECUTE ON FUNCTION public.get_media_status_counts() TO authenticated, service_role;
