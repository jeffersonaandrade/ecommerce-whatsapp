-- Fase 2.5: accumulation jsonb em commercial_policies (gates de acumulação na policy)

ALTER TABLE public.commercial_policies
  ADD COLUMN IF NOT EXISTS accumulation jsonb NOT NULL DEFAULT '{}'::jsonb;

COMMENT ON COLUMN public.commercial_policies.accumulation IS
  'Override parcial de stageGates (allowAutoRules, allowManualRules, etc.) — policy vencedora sobrescreve defaults do canal em store_settings.commercial_sales_channels';
