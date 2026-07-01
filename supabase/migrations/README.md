# Supabase migrations

Migrations versionadas do core **ecommerce-sports**. Aplicar **por ordem de timestamp** em cada projeto Supabase do cliente.

## Onboarding — cliente novo (Supabase vazio)

1. Criar projeto Supabase vazio.
2. No Dashboard: criar buckets públicos `branding` e `products`.
3. Aplicar **`20260625190000_baseline_sports_store.sql`** (baseline fundacional).
4. Aplicar os demais arquivos desta pasta em ordem cronológica até o HEAD do core.
5. Configurar role `admin` no JWT (`app_metadata.role`) para usuários admin.
6. Rodar preset/branding conforme [`docs/operations/CLIENT_SETUP_CHECKLIST.md`](../docs/operations/CLIENT_SETUP_CHECKLIST.md).

## Nunca reaplicar baseline em banco existente

| Cenário | Ação |
|---------|------|
| **UnitSports produção** | Já migrado via MCP histórico — **não** rodar `20260625190000_*` |
| **Cliente novo** | Baseline + migrations incrementais |
| **Dúvida se baseline já existe** | Comparar `schema_migrations` / `\dt public.*` antes de aplicar |

O baseline existe para **reprodutibilidade de novos deploys**, não para retroactive fix em produção.

## Fonte canônica consolidada

DDL completo (referência): [`scripts/migration/supabase-migrations.sql`](../scripts/migration/supabase-migrations.sql)

Novas migrations devem ser adicionadas **nesta pasta** e espelhadas no arquivo consolidado.

## Validação recomendada (projeto de teste)

```bash
# Com Supabase CLI linkado a projeto de teste vazio:
supabase db reset
```

Ou copiar/colar cada migration no SQL Editor de um projeto isolado e confirmar:

- tabelas core (`products`, `categories`, `store_settings`, …)
- RLS habilitado
- `is_store_admin()` presente
- buckets storage acessíveis
