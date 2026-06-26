-- Sprint 4A: benefícios editáveis na home

ALTER TABLE public.store_settings
  ADD COLUMN IF NOT EXISTS benefits_eyebrow text NOT NULL DEFAULT 'Por que comprar conosco',
  ADD COLUMN IF NOT EXISTS benefits_title text NOT NULL DEFAULT 'Benefícios';

CREATE TABLE IF NOT EXISTS public.benefit_items (
  id text PRIMARY KEY,
  title text NOT NULL,
  description text NOT NULL DEFAULT '',
  sort_order integer NOT NULL DEFAULT 0,
  active boolean NOT NULL DEFAULT true,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT benefit_items_title_not_empty CHECK (char_length(trim(title)) > 0)
);

CREATE INDEX IF NOT EXISTS benefit_items_active_sort_idx
  ON public.benefit_items (active, sort_order);

DROP TRIGGER IF EXISTS benefit_items_set_updated_at ON public.benefit_items;
CREATE TRIGGER benefit_items_set_updated_at
  BEFORE UPDATE ON public.benefit_items
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

ALTER TABLE public.benefit_items ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "benefit_items_public_read" ON public.benefit_items;
CREATE POLICY "benefit_items_public_read"
  ON public.benefit_items FOR SELECT TO anon, authenticated
  USING (active = true);

DROP POLICY IF EXISTS "benefit_items_admin_select" ON public.benefit_items;
CREATE POLICY "benefit_items_admin_select"
  ON public.benefit_items FOR SELECT TO authenticated
  USING (public.is_store_admin());

DROP POLICY IF EXISTS "benefit_items_admin_insert" ON public.benefit_items;
CREATE POLICY "benefit_items_admin_insert"
  ON public.benefit_items FOR INSERT TO authenticated
  WITH CHECK (public.is_store_admin());

DROP POLICY IF EXISTS "benefit_items_admin_update" ON public.benefit_items;
CREATE POLICY "benefit_items_admin_update"
  ON public.benefit_items FOR UPDATE TO authenticated
  USING (public.is_store_admin()) WITH CHECK (public.is_store_admin());

DROP POLICY IF EXISTS "benefit_items_admin_delete" ON public.benefit_items;
CREATE POLICY "benefit_items_admin_delete"
  ON public.benefit_items FOR DELETE TO authenticated
  USING (public.is_store_admin());

GRANT SELECT ON public.benefit_items TO anon, authenticated;
GRANT INSERT, UPDATE, DELETE ON public.benefit_items TO authenticated;

INSERT INTO public.benefit_items (id, title, description, sort_order, active)
VALUES
  ('benefit-default-1', 'Envio rápido', 'Entrega em até 5 dias úteis em todo o Brasil.', 10, true),
  ('benefit-default-2', 'Produtos originais', '100% autênticos com garantia de qualidade.', 20, true),
  ('benefit-default-3', 'Suporte dedicado', 'Atendimento quando você precisar.', 30, true)
ON CONFLICT (id) DO NOTHING;
