-- Commercial Policies (canais de venda) + overrides por produto + extensão store_settings.

CREATE TABLE IF NOT EXISTS public.commercial_policies (
  id text PRIMARY KEY,
  name text NOT NULL,
  channel text NOT NULL
    CHECK (channel IN ('retail', 'wholesale', 'distributor')),
  priority int NOT NULL DEFAULT 0,
  enabled boolean NOT NULL DEFAULT true,
  is_default boolean NOT NULL DEFAULT false,
  conditions jsonb NOT NULL DEFAULT '{}'::jsonb,
  actions jsonb NOT NULL DEFAULT '[]'::jsonb,
  starts_at timestamptz,
  ends_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT commercial_policies_date_range CHECK (
    starts_at IS NULL OR ends_at IS NULL OR starts_at <= ends_at
  )
);

CREATE INDEX IF NOT EXISTS commercial_policies_storefront_idx
  ON public.commercial_policies (enabled, channel, priority DESC, starts_at, ends_at);

CREATE TABLE IF NOT EXISTS public.commercial_product_policy_overrides (
  id text PRIMARY KEY,
  product_id text NOT NULL REFERENCES public.products(id) ON DELETE CASCADE,
  policy_id text REFERENCES public.commercial_policies(id) ON DELETE CASCADE,
  conditions jsonb NOT NULL DEFAULT '{}'::jsonb,
  actions jsonb NOT NULL DEFAULT '[]'::jsonb,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS commercial_product_policy_overrides_product_idx
  ON public.commercial_product_policy_overrides (product_id, policy_id);

ALTER TABLE public.store_settings
  ADD COLUMN IF NOT EXISTS commercial_sales_channels jsonb NOT NULL DEFAULT '{"retail": true}'::jsonb,
  ADD COLUMN IF NOT EXISTS commercial_default_policy_id text
    REFERENCES public.commercial_policies(id) ON DELETE SET NULL;

ALTER TABLE public.commercial_policies ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.commercial_product_policy_overrides ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "commercial_policies_public_read" ON public.commercial_policies;
CREATE POLICY "commercial_policies_public_read"
  ON public.commercial_policies FOR SELECT
  TO anon, authenticated
  USING (enabled = true);

DROP POLICY IF EXISTS "commercial_policies_admin_select" ON public.commercial_policies;
CREATE POLICY "commercial_policies_admin_select"
  ON public.commercial_policies FOR SELECT
  TO authenticated
  USING (public.is_store_admin());

DROP POLICY IF EXISTS "commercial_policies_admin_insert" ON public.commercial_policies;
CREATE POLICY "commercial_policies_admin_insert"
  ON public.commercial_policies FOR INSERT
  TO authenticated
  WITH CHECK (public.is_store_admin());

DROP POLICY IF EXISTS "commercial_policies_admin_update" ON public.commercial_policies;
CREATE POLICY "commercial_policies_admin_update"
  ON public.commercial_policies FOR UPDATE
  TO authenticated
  USING (public.is_store_admin())
  WITH CHECK (public.is_store_admin());

DROP POLICY IF EXISTS "commercial_policies_admin_delete" ON public.commercial_policies;
CREATE POLICY "commercial_policies_admin_delete"
  ON public.commercial_policies FOR DELETE
  TO authenticated
  USING (public.is_store_admin());

DROP POLICY IF EXISTS "commercial_product_policy_overrides_public_read" ON public.commercial_product_policy_overrides;
CREATE POLICY "commercial_product_policy_overrides_public_read"
  ON public.commercial_product_policy_overrides FOR SELECT
  TO anon, authenticated
  USING (true);

DROP POLICY IF EXISTS "commercial_product_policy_overrides_admin_select" ON public.commercial_product_policy_overrides;
CREATE POLICY "commercial_product_policy_overrides_admin_select"
  ON public.commercial_product_policy_overrides FOR SELECT
  TO authenticated
  USING (public.is_store_admin());

DROP POLICY IF EXISTS "commercial_product_policy_overrides_admin_insert" ON public.commercial_product_policy_overrides;
CREATE POLICY "commercial_product_policy_overrides_admin_insert"
  ON public.commercial_product_policy_overrides FOR INSERT
  TO authenticated
  WITH CHECK (public.is_store_admin());

DROP POLICY IF EXISTS "commercial_product_policy_overrides_admin_update" ON public.commercial_product_policy_overrides;
CREATE POLICY "commercial_product_policy_overrides_admin_update"
  ON public.commercial_product_policy_overrides FOR UPDATE
  TO authenticated
  USING (public.is_store_admin())
  WITH CHECK (public.is_store_admin());

DROP POLICY IF EXISTS "commercial_product_policy_overrides_admin_delete" ON public.commercial_product_policy_overrides;
CREATE POLICY "commercial_product_policy_overrides_admin_delete"
  ON public.commercial_product_policy_overrides FOR DELETE
  TO authenticated
  USING (public.is_store_admin());
