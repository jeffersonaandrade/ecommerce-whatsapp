# Scripts utilitários

Organização pós-auditoria (Fase 3). Todos assumem execução na raiz do repositório.

## `deploy/`

| Script | Uso |
|--------|-----|
| `prepare-netlify-build.mjs` | Prebuild Netlify — copia seed JSON/branding quando `DATA_PROVIDER` ≠ `supabase`. Gera favicon/OG a partir de `deploy/branding/logo.*`. Invocado por `npm run build:netlify`. |
| `sync-branding-logo.mjs` | Publica `deploy/branding/logo.*` no Supabase Storage e atualiza `store_settings`. `npm run branding:sync` |

## `migration/`

| Script | Uso |
|--------|-----|
| `migrate-json-to-supabase.mjs` | Migra `storage/*.json` + branding para Supabase. `npm run migrate:supabase` |
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
