# RLS verification report — 2026-06-24

Auditoria **read-only** das políticas RLS definidas em `supabase/migrations/` e baseline. Objetivo: confirmar isolamento admin vs storefront antes de go-live multi-client.

**Escopo:** análise estática do repositório + queries de verificação para executar no Supabase (UnitSports ou projeto de teste).

**Status geral:** estrutura RLS consistente com modelo `is_store_admin()`; **1 achado P1** em `commercial_product_policy_overrides`.

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
| `commercial_product_policy_overrides` | Sim | **`USING (true)` — leitura total** | Admin only | **Revisar P1** |
| Storage `branding` / `products` | Sim | Read público | Write admin | OK |

---

## Mecanismo central

Função `public.is_store_admin()` (baseline):

```sql
(auth.jwt() -> 'app_metadata' ->> 'role') = 'admin'
```

Todas as policies admin dependem desta claim. Usuários anon/authenticated sem role admin não escrevem em tabelas sensíveis.

---

## Achado P1 — `commercial_product_policy_overrides_public_read`

**Arquivo:** `supabase/migrations/20260801120000_commercial_policies.sql`

```sql
CREATE POLICY "commercial_product_policy_overrides_public_read"
  ON public.commercial_product_policy_overrides FOR SELECT
  TO anon, authenticated
  USING (true);
```

**Risco:** qualquer visitante (anon) pode ler **todos** os overrides comerciais por produto, incluindo condições/ações em JSONB que podem antecipar regras de preço/canal ainda não visíveis no storefront.

**Mitigação sugerida (P1, pós-P0):** restringir leitura pública a overrides de produtos ativos e policies habilitadas, ou mover resolução comercial para RPC `SECURITY DEFINER` sem exposição direta da tabela.

**Prioridade:** P1 segurança — escalar para P0 se teste anon confirmar vazamento de dados sensíveis.

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

Se retornar linhas sem autenticação admin → confirmar achado P1.

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

## Limitações desta auditoria

- Verificação **estática** no repositório; execução live depende de credenciais Supabase do cliente.
- UnitSports **não foi alterado** nesta remediação.
- MCP Supabase não executado nesta sessão — operador deve rodar queries acima em projeto de referência.

---

## Próximos passos (P1)

1. Executar teste anon em `commercial_product_policy_overrides`.
2. Se confirmado vazamento: migration para restringir policy ou RPC server-side.
3. Repetir verificação após fix em projeto de teste antes de aplicar em produção.
