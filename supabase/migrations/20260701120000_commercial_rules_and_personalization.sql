-- Regras comerciais (promoções) + personalização global e por produto.
--
-- Reconstruída a partir do bloco canônico já aplicado em
-- scripts/migration/supabase-migrations.sql (20260701120000). Esta migration
-- estava ausente da pasta supabase/migrations/, o que quebrava novos clientes
-- (a RPC query_storefront_products_page referencia personalization_enabled).
--
-- Cobre: tabela commercial_rules (+ RLS) e colunas personalization_* em
-- products e store_settings.

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
