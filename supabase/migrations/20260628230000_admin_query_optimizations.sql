-- Contagens leves para onboarding admin (sem carregar catálogo inteiro).

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
