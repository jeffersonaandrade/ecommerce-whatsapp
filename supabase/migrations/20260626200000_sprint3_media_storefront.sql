-- Sprint 3: imagem de categoria + carrossel banner_slides
-- set_updated_at() e is_store_admin() já existem de migrações anteriores.

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

DROP POLICY IF EXISTS "banner_slides_public_read" ON public.banner_slides;
CREATE POLICY "banner_slides_public_read"
  ON public.banner_slides FOR SELECT TO anon, authenticated
  USING (active = true);

DROP POLICY IF EXISTS "banner_slides_admin_select" ON public.banner_slides;
CREATE POLICY "banner_slides_admin_select"
  ON public.banner_slides FOR SELECT TO authenticated
  USING (public.is_store_admin());

DROP POLICY IF EXISTS "banner_slides_admin_insert" ON public.banner_slides;
CREATE POLICY "banner_slides_admin_insert"
  ON public.banner_slides FOR INSERT TO authenticated
  WITH CHECK (public.is_store_admin());

DROP POLICY IF EXISTS "banner_slides_admin_update" ON public.banner_slides;
CREATE POLICY "banner_slides_admin_update"
  ON public.banner_slides FOR UPDATE TO authenticated
  USING (public.is_store_admin()) WITH CHECK (public.is_store_admin());

DROP POLICY IF EXISTS "banner_slides_admin_delete" ON public.banner_slides;
CREATE POLICY "banner_slides_admin_delete"
  ON public.banner_slides FOR DELETE TO authenticated
  USING (public.is_store_admin());

GRANT SELECT ON TABLE public.banner_slides TO anon, authenticated;
GRANT INSERT, UPDATE, DELETE ON TABLE public.banner_slides TO authenticated;
