# Deploy multi-cliente

Como propagar o **mesmo core** para várias lojas: Netlify + Supabase + domínio por cliente.

Arquitetura: [`ARCHITECTURE.md`](ARCHITECTURE.md) · Versão: [`CORE_VERSION.md`](CORE_VERSION.md) · Compatibilidade: [`COMPATIBILITY.md`](COMPATIBILITY.md)

---

## Modelo

```text
main (core)
  ↓ CI / testes
  ↓ migrate (cada Supabase)
  ↓ deploy (cada Netlify)
  Cliente A, B, C…
```

**Não** multi-tenant no mesmo banco. **Não** fork por cliente.

---

## Fluxo — atualizar 5 lojas

1. **Desenvolver** feature no `main`; `npm test` + `npm run build:netlify`
2. **Release** — bump versão, [`CHANGELOG.md`](../CHANGELOG.md), [`docs/releases/`](releases/)
3. **Decidir rollout** — todos ou subset ([`CORE_VERSION.md`](CORE_VERSION.md))
4. **Por cliente:**
   - Listar migrations pendentes vs `supabase_migrations.schema_migrations`
   - Aplicar via MCP `apply_migration` ou SQL Editor (registrar em DATABASE_PLAN)
   - Deploy Netlify (build hook ou push branch conectada)
   - Smoke: `QA_BASE_URL=https://dominio-do-cliente npm run test:e2e:smoke`
   - Atualizar `coreVersionInstalled` em [`deploy/clients/`](../deploy/clients/) e `clients.local.json`
5. **Registrar** na release note quais slugs foram atualizados

---

## O que muda por cliente (apenas dados/env)

| Item | Onde |
|------|------|
| Supabase URL + keys | Netlify env |
| Domínio | Netlify DNS |
| Nome, logo, cores, textos | `store_settings` + Storage |
| Produtos, categorias, banners | Postgres + Storage |
| WhatsApp, e-mail | `store_settings` |
| `ENABLE_MIGRATION_TOOLS` | Env (fase onboarding) |

---

## Feature flags vs Store Settings

```text
Feature flag  → habilita MÓDULO
Store settings → configura CONTEÚDO do módulo habilitado
```

| Correto | Errado |
|---------|--------|
| `features.bannerCMS = enabled` + slides em DB | `showBanner: true` em settings no lugar de flag |
| `ENABLE_MIGRATION_TOOLS=true` (env operador) | `storeName` ou cores em feature flag |
| Futuro: `store_features.wishlist` | Flag substituindo configuração normal |

**Quando usar env flag:** ferramentas de operador/onboarding (`ENABLE_MIGRATION_TOOLS`), build-time, kill-switch global.

**Quando usar DB flag (futuro):** módulo opcional por plano comercial (wishlist, coupons, checkout).

**Quando NÃO usar flag:** branding, nome da loja, conteúdo — sempre `store_settings` ou tabelas de conteúdo.

Proposta futura (não implementar agora):

```sql
-- opção A: tabela store_features
-- opção B: JSONB store_settings.enabled_features
```

---

## Migrations multi-Supabase

- Toda mudança de schema → arquivo em [`supabase/migrations/`](../supabase/migrations/) + bloco em [`scripts/migration/supabase-migrations.sql`](../scripts/migration/supabase-migrations.sql)
- Aplicar **em cada** projeto Supabase de cliente ativo
- Regras: [`COMPATIBILITY.md`](COMPATIBILITY.md), seeds: [`SEEDS.md`](SEEDS.md)
- Nunca migration manual sem registro

---

## Automação futura

Especificação — **não implementada**:

[`scripts/operator/deploy/deploy-all-clients.mjs`](../scripts/operator/README.md)

```text
1. Ler deploy/clients/clients.local.json
2. Por slug: checar migrations pendentes (API Supabase)
3. Disparar Netlify build hook
4. GET smoke na URL pública
5. Gerar relatório markdown
```

---

## Manifesto de clientes

| Arquivo | Versionado | Uso |
|---------|------------|-----|
| `clients.example.json` | Sim | Formato documentação |
| `clients.local.json.example` | Sim | Template para copiar |
| `clients.local.json` | **Gitignore** | Registry operacional real |

Ver [`deploy/registry/README.md`](../deploy/registry/README.md).

---

## Riscos

### Técnicos

- Migration aplicada em 4/5 Supabase — inconsistência de schema
- Re-seed acidental — perda de dados cliente
- QA com URL hardcoded de uma implantação

### Comerciais

- Cliente A recebe feature, B não — comunicação e contrato
- Breaking change sem janela — downtime

---

## O que NÃO fazer

- Fork/cópia do repo por loja
- Branch permanente por cliente
- `if (storeName === 'X')` no código
- Multi-tenant (`store_id`) no mesmo Postgres
- Commitar secrets ou `clients.local.json`
- Deploy/migrate produção sem smoke

---

## Nova loja

Checklist: [`deploy/clients/template/go-live-checklist.md`](../deploy/clients/template/go-live-checklist.md)
