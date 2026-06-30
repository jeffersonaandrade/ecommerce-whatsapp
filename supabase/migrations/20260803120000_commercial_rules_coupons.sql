-- Fase 3: cupons manuais em commercial_rules (trigger=manual + code)

ALTER TABLE public.commercial_rules
  ADD COLUMN IF NOT EXISTS trigger text NOT NULL DEFAULT 'auto'
    CHECK (trigger IN ('auto', 'manual')),
  ADD COLUMN IF NOT EXISTS code text,
  ADD COLUMN IF NOT EXISTS conditions jsonb NOT NULL DEFAULT '{}'::jsonb,
  ADD COLUMN IF NOT EXISTS actions jsonb NOT NULL DEFAULT '[]'::jsonb,
  ADD COLUMN IF NOT EXISTS usage_limit int,
  ADD COLUMN IF NOT EXISTS usage_count int NOT NULL DEFAULT 0;

CREATE UNIQUE INDEX IF NOT EXISTS commercial_rules_code_lower_unique_idx
  ON public.commercial_rules (lower(trim(code)))
  WHERE code IS NOT NULL AND length(trim(code)) > 0;

ALTER TABLE public.commercial_rules
  DROP CONSTRAINT IF EXISTS commercial_rules_manual_requires_code;

ALTER TABLE public.commercial_rules
  ADD CONSTRAINT commercial_rules_manual_requires_code
  CHECK (
    trigger <> 'manual'
    OR (code IS NOT NULL AND length(trim(code)) > 0)
  );

ALTER TABLE public.commercial_rules
  DROP CONSTRAINT IF EXISTS commercial_rules_usage_within_limit;

ALTER TABLE public.commercial_rules
  ADD CONSTRAINT commercial_rules_usage_within_limit
  CHECK (usage_limit IS NULL OR usage_count <= usage_limit);

COMMENT ON COLUMN public.commercial_rules.trigger IS 'auto = promoção; manual = cupom com code';
COMMENT ON COLUMN public.commercial_rules.code IS 'Código do cupom (obrigatório quando trigger=manual)';
