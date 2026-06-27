# Scripts utilitários

Organização por classificação: **Produto** · **Operador** · **QA** · **Legacy/Dev**.

Todos assumem execução na raiz do repositório.

## Classificação

| Classe | Propósito | Exemplos |
|--------|-----------|----------|
| **Produto** | Build/deploy da loja em produção | `deploy/prepare-netlify-build.mjs`, `branding:sync` |
| **Operador** | Onboarding de cliente, migração pontual, import scraping | `migration/dry-run-local-images.mjs`, `migration/upload-local-images-pilot.mjs`, `qa/build-scraping-import-csv.mjs` |
| **QA** | Smoke, E2E, verificação de regressão | `qa/e2e-qa-playwright.mjs`, `qa/smoke-supabase-local.mjs` |
| **Legacy/Dev** | JSON local, utilitários de desenvolvimento | `migration/migrate-json-to-supabase.mjs`, `dev/start-headroom-cursor.ps1` |

### Feature flag `ENABLE_MIGRATION_TOOLS`

Controla rotas admin de onboarding:

- `/admin/import` — wizard CSV
- `/admin/products/media` — Central de Mídia
- Cards correspondentes no dashboard admin

Implementação: [`lib/env/migration-tools.ts`](../lib/env/migration-tools.ts).

| Ambiente | Valor recomendado |
|----------|-------------------|
| Onboarding / migração UnitSports | `ENABLE_MIGRATION_TOOLS=true` |
| Produção estável pós-validação cliente | `ENABLE_MIGRATION_TOOLS=false` (ou omitir) |

**Não remover** o código — apenas desligar via env após o cliente validar imagens e catálogo.

## `operator/` (referência)

Scripts operacionais hoje em `migration/` e `qa/` — pasta reservada para consolidação futura.

| Script npm | Arquivo | Risco |
|------------|---------|-------|
| `migrate:images:dry-run` | `migration/dry-run-local-images.mjs` | Leitura — gera relatório |
| `migrate:images:pilot` | `migration/upload-local-images-pilot.mjs` | **Escrita produção** — 10 produtos |
| `migrate:images:remaining` | idem `--remaining` | **Escrita produção** |
| `migrate:images:all-safe` | idem `--all-safe` | **Escrita produção** — lote seguro |

Relatórios em `test-data/reports/LOCAL_IMAGE_*`. Lógica compartilhada: [`lib/catalog/media/local-image-migration/`](../lib/catalog/media/local-image-migration/).

## `dev/`

| Script | Uso |
|--------|-----|
| `start-headroom-cursor.ps1` | Inicia proxy Headroom para Cursor (`headroom wrap cursor`). Ver [AGENTS.md](../AGENTS.md). |

## `deploy/`

| Script | Uso |
|--------|-----|
| `prepare-netlify-build.mjs` | Prebuild Netlify — copia seed JSON/branding quando `DATA_PROVIDER` ≠ `supabase`. Gera favicon/OG a partir de `deploy/branding/logo.*`. Invocado por `npm run build:netlify`. |
| `sync-branding-logo.mjs` | Publica `deploy/branding/logo.*` no Supabase Storage e atualiza `store_settings`. `npm run branding:sync` |

## `migration/`

| Arquivo / script | Uso |
|------------------|-----|
| **`supabase-migrations.sql`** | **DDL canônico** — todas as migrations Supabase em ordem. Atualizar após cada `apply_migration` via MCP. |
| `migrate-json-to-supabase.mjs` | Migra `storage/*.json` + branding para Supabase. `npm run migrate:supabase` |
| `dry-run-local-images.mjs` | Dry-run da migração de imagens locais → Storage. `npm run migrate:images:dry-run` |
| `upload-local-images-pilot.mjs` | Upload local → bucket `products` + `products.images`. `migrate:images:pilot` (10), `migrate:images:remaining` (46), `migrate:images:all-safe` (56) |
| `generate-seed-sql.mjs` | Gera SQL de seed a partir dos JSON locais (setup manual). |

## `qa/`

| Script | Versionado | Uso |
|--------|------------|-----|
| `e2e-qa-playwright.mjs` | Sim | Runner E2E Playwright (E2E-4..E2E-9). Requer `npx playwright install chromium` e app em `localhost:3000`. |
| `smoke-supabase-local.mjs` | Sim | Smoke local Supabase (storage + CRUD básico). |
| `verify-product-crud.mjs` | Sim | Verifica create/delete de produto QA via service role. |
| `smoke-prod-netlify.mjs` | Não | Smoke produção Netlify — auxiliar local. |
| `smoke-prod-persistence-redeploy.mjs` | Não | Testa persistência após redeploy — auxiliar local. |
| `smoke-f0-prod.mjs` | Não | Smoke pós Fase 0 storefront — auxiliar local. |

Saídas de smoke local ficam em `test-data/e2e/` (gitignored quando aplicável).
