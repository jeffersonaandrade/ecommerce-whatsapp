-- Estado operacional da implantação (separado de store_settings).

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
