# RLS verification report — 2026-06-24

Auditoria **read-only** das políticas RLS definidas em `supabase/migrations/` e baseline. Objetivo: confirmar isolamento admin vs storefront antes de go-live multi-client.

**Escopo:** análise estática do repositório + queries de verificação para executar no Supabase (UnitSports ou projeto de teste).

**Status geral:** estrutura RLS consistente com modelo `is_store_admin()`; **1 achado LATENTE** (backlog Security Hardening — módulo Commercial).

---

## Resumo executivo

| Área | RLS | Leitura pública | Escrita admin | Observação |
|------|-----|-----------------|---------------|------------|
| `products` | Sim | Apenas `status = 'active'` | `is_store_admin()` | OK |
| `product_variations` | Sim | Via produto ativo | `is_store_admin()` | OK |
| `store_settings` | Sim | Leitura total (storefront) | Admin only write | OK — dados públicos de loja |
| `categories` | Sim | `visible = true` | Admin only | OK |
| `import_batches` | Sim | Nenhuma (admin only) | Admin only | OK |
| `banner_slides` | Sim | `active = true` | Admin only | OK |
| `benefit_items` | Sim | Ativos | Admin only | OK |
| `store_onboarding` | Sim | Nenhuma | Admin only | OK |
| `commercial_policies` | Sim | `enabled = true` | Admin only | OK |
| `commercial_product_policy_overrides` | Sim | **`USING (true)` — leitura total** | Admin only | **LATENTE** — backlog Security Hardening |
| Storage `branding` / `products` | Sim | Read público | Write admin | OK |

---

## Mecanismo central

Função `public.is_store_admin()` (baseline):

```sql
(auth.jwt() -> 'app_metadata' ->> 'role') = 'admin'
```

Todas as policies admin dependem desta claim. Usuários anon/authenticated sem role admin não escrevem em tabelas sensíveis.

---

## Achado LATENTE — `commercial_product_policy_overrides_public_read`

**Classificação:** LATENTE — **não corrigir nesta sprint.** Backlog **Security Hardening** (módulo Commercial).

**Origem no repo:** tabela criada em `d891d78` (2026-06-30) — `feat(commercial): policies de canal no motor e admin CRUD`, migration [`20260801120000_commercial_policies.sql`](../../supabase/migrations/20260801120000_commercial_policies.sql). **Não** foi criada durante P0/P1 recente.

**Arquivo da policy:**

```sql
CREATE POLICY "commercial_product_policy_overrides_public_read"
  ON public.commercial_product_policy_overrides FOR SELECT
  TO anon, authenticated
  USING (true);
```

**O que realmente aconteceu:**

```text
Tabela existente (desde motor comercial v1)
  → policy RLS permissiva
  → 0 linhas em UnitSports hoje
  → nenhum caller / endpoint / frontend usa leitura anon
```

**Risco teórico:** visitante anon poderia ler overrides (JSONB condições/ações) **se** existirem linhas — vazamento de regras comerciais não expostas no storefront.

**Impacto em produção hoje:** nenhum — achado de segurança **válido**, não erro de arquitetura; ganho imediato de migration seria pequeno.

**Decisão (2026-07-01):** adiar correção. Remover policy pública **antes da primeira funcionalidade de produção** que utilize `commercial_product_policy_overrides` (Policy Overrides: RLS + CRUD admin + API + frontend no mesmo contexto).

**Não gerar migration nesta etapa.**

---

## Backlog — Security Hardening (Commercial)

| Item | Quando | Ação |
|------|--------|------|
| `commercial_product_policy_overrides` RLS | Ativação da feature Policy Overrides | `DROP POLICY commercial_product_policy_overrides_public_read`; validar GRANT/REVOKE; storefront via service role ou RPC `SECURITY DEFINER` |
| Referência | [`COMMERCIAL_ENGINE.md`](../COMMERCIAL_ENGINE.md) § Security Hardening | |

**Rascunho futuro (referência only — não versionar como migration até go-live da feature):**

```sql
-- Executar junto do go-live Policy Overrides, após teste em Supabase vazio
DROP POLICY IF EXISTS "commercial_product_policy_overrides_public_read"
  ON public.commercial_product_policy_overrides;
```

---

## Queries de verificação (copiar no SQL Editor Supabase)

### 1. Tabelas com RLS desabilitado

```sql
SELECT c.relname AS table_name, c.relrowsecurity AS rls_enabled
FROM pg_class c
JOIN pg_namespace n ON n.oid = c.relnamespace
WHERE n.nspname = 'public'
  AND c.relkind = 'r'
ORDER BY 1;
```

Esperado: `rls_enabled = true` em todas as tabelas de negócio.

### 2. Policies por tabela

```sql
SELECT schemaname, tablename, policyname, roles, cmd, qual, with_check
FROM pg_policies
WHERE schemaname = 'public'
ORDER BY tablename, policyname;
```

### 3. Simular leitura anon em overrides (via service role + set role)

No SQL Editor, como superuser/service role, validar contagem exposta:

```sql
-- Contagem total de overrides (referência admin)
SELECT COUNT(*) FROM public.commercial_product_policy_overrides;
```

Teste real anon: usar **anon key** no client JS ou PostgREST:

```javascript
const { data, error } = await supabase
  .from('commercial_product_policy_overrides')
  .select('id, product_id, conditions, actions')
  .limit(5)
```

Se retornar linhas sem autenticação admin → risco **ativo** (escalar de LATENTE para correção imediata). Com 0 linhas → permanece LATENTE.

### 4. Draft products não expostos

```sql
-- Deve retornar 0 linhas quando executado como anon (testar via API)
SELECT id FROM public.products WHERE status = 'draft' LIMIT 1;
```

---

## Storage

Policies em baseline (`branding_*`, `products_*` em `storage.objects`):

- Leitura: bucket público
- Escrita/update/delete: `is_store_admin()` only

Verificar buckets existem e são públicos conforme [`supabase/migrations/README.md`](../../supabase/migrations/README.md).

---

## Verificação live — UnitSports (2026-07-01)

Teste com **anon key** de produção (read-only, sem INSERT):

```javascript
// Resultado observado
{ error: null, count: 0, rowsReturned: 0 }
```

| Conclusão | Detalhe |
|-----------|---------|
| **Policy permissiva confirmada** | `SELECT` anon **não é bloqueado** — a policy `USING (true)` está ativa |
| **Impacto atual** | Tabela **vazia** (0 linhas) — risco **latente**, não exploração ativa hoje |
| **Impacto futuro** | Qualquer override criado no admin ficará legível via PostgREST anon |

**Origem:** migration `d891d78` / `20260801120000` — anterior ao P0; UnitSports **não alterado** nesta sprint.

---

## Limitações desta auditoria

- Verificação live UnitSports: **2026-07-01** (anon SELECT permitido; tabela vazia).
- Nenhuma migration de correção aplicada — item em backlog Security Hardening.
- MCP Supabase não executado — teste via `@supabase/supabase-js` + anon key local.

---

## Próximos passos

1. ~~Executar teste anon em `commercial_product_policy_overrides`.~~ **Feito 2026-07-01**
2. ~~Reclassificar achado.~~ **LATENTE — backlog Commercial Security Hardening**
3. Corrigir RLS **junto** do go-live Policy Overrides (RLS + CRUD + API + frontend).
4. Re-testar anon após correção em projeto de teste antes de UnitSports.
