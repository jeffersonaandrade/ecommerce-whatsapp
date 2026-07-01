# Auditoria de acoplamento a cliente — Multi-Cliente

**Data:** 2026-06-27  
**Escopo:** mapear referências específicas de implantação (UnitSports, `loja-whats`, etc.) vs core reutilizável.  
**Classificação:** (1) seed/default · (2) store_settings · (3) docs · (4) deploy · (5) remover · (6) operador

---

## Resumo executivo

| Veredito | Detalhe |
|----------|---------|
| Runtime | **Limpo** — sem `if (storeName === 'UnitSports')` em `app/` ou `lib/` |
| Persistência | **Alinhado** — `store_settings` + env por deploy; 1 Supabase por cliente ([`DATABASE_PLAN.md`](DATABASE_PLAN.md)) |
| Documentação | **Em atualização P1** — HANDOFF/ROADMAP alinhados a `unitsports.netlify.app`; histórico `loja-whats` preservado em releases |
| Operador | **Esperado** — scripts QA com fallback `loja-whats`; dados test-data da implantação |
| Legado | **`config/site.ts`** — categorias hardcoded como fallback JSON/footer |

---

## Tabela completa

| # | Item | Localização | Class. | Recomendação |
|---|------|-------------|--------|--------------|
| 1 | URL produção `loja-whats.netlify.app` (legado) | `docs/HANDOFF.md`, `ROADMAP.md`, QA reports | 3 + 4 | **Resolvido (P1):** URL canônica `unitsports.netlify.app` em docs principais; legado citado só em releases/histórico |
| 2 | “MVP UnitSports” / §1.1 logo | `docs/HANDOFF.md` | 3 + 4 | Renomear para “implantação de referência”; procedimento genérico em template |
| 3 | Registro migrations “produção UnitSports” | `docs/DATABASE_PLAN.md`, `scripts/migration/supabase-migrations.sql` | 3 + 6 | Rotular “implantação unitsports”; migrations são do **core** |
| 4 | Estado migração imagens UnitSports | `docs/IMPORT_PIPELINE.md`, `scripts/operator/README.md`, `CHANGELOG.md` | 3 + 6 | Mover status operacional para `deploy/clients/unitsports/notes.md` |
| 5 | Default QA `loja-whats` | `scripts/qa/test-logo-upload-prod.mjs`, `test-logo-upload-prod-debug.mjs`, `e2e-qa-playwright.mjs` | 6 | Exigir `QA_BASE_URL`; documentar dívida — não alterar nesta tarefa |
| 6 | `test@sports.com` | `deploy/netlify/store-settings.json` | 1 | Seed demo genérico — OK; referenciar em template |
| 7 | `siteUrl` fixture teste | `lib/store/restore-default-storefront.test.ts` | 1 | Fixture — manter URL exemplo |
| 8 | Categorias Camisas/Shorts/… | `config/site.ts` | 2 legado | Fallback JSON/footer; futuro: só categorias Supabase ([`COMPATIBILITY.md`](COMPATIBILITY.md)) |
| 9 | Defaults “Sports Store” | `lib/store/settings-defaults.ts` | 1 | Genérico — correto |
| 10 | Preset visual | `deploy/netlify/default-storefront-preset.json` | 1 | Genérico — correto |
| 11 | Branding logo único | `deploy/branding/logo.*` (legacy) | 4 | **Resolvido (docs):** canônico em `deploy/clients/<slug>/branding/`; legacy em [`deploy/branding/README.md`](../deploy/branding/README.md) |
| 12 | CSVs scraping UnitSports | `test-data/`, `public/templates/import-scraping-validado-ab.csv` | 6 | Dados operador/teste — não remover |
| 13 | README “single-client” | `README.md` | 3 | Atualizar intro multi-deploy |
| 14 | ARCHITECTURE “single-client” | `docs/ARCHITECTURE.md` | 3 | Reescrita parcial |
| 15 | CLIENT_SETUP mock-products | `docs/operations/CLIENT_SETUP_CHECKLIST.md` | 3 | Apontar para checklist novo |
| 16 | Package `ecommerce-sports` | `package.json` | 3 | Codinome interno — adiar rename |
| 17 | Repo GitHub `ecommerce-whatsapp` | HANDOFF | 3 | Documentar; adiar rename |
| 18 | `ENABLE_MIGRATION_TOOLS` | `lib/env/migration-tools.ts` | 6 | Flag operador/onboarding — padrão documentado |
| 19 | `DATA_PROVIDER` | `.env.local.example` | 4 | Env por deploy — correto |
| 20 | `.env.local` global na raiz | `.env.local` (raiz) | 4 + 6 | **Mitigado (docs):** env por slug em `deploy/clients/<slug>/.env.local`; `npm run env:use -- <slug>` |
| 21 | `store_settings` singleton | `lib/store/supabase-settings-repository.ts` | 2 | Config por loja — correto |
| 22 | Netlify.toml | `netlify.toml` | 4 | Compartilhado — build igual por cliente; env difere no painel |
| 23 | Sem multi-tenant | código | — | **Manter** — não introduzir `store_id` |

---

## O que NÃO é acoplamento (confirmado)

- Tabelas `products`, `categories`, `banner_slides`, `store_onboarding` — dados por Supabase do cliente
- Admin, import CSV, onboarding tour — features do core
- Migrations em `supabase/migrations/` — compartilhadas; aplicadas em cada projeto Supabase

---

## Riscos se não documentar

| Risco | Mitigação nesta entrega |
|-------|-------------------------|
| Novo dev trata UnitSports como produto inteiro | HANDOFF + ARCHITECTURE + registry |
| Re-seed sobrescreve cliente | [`SEEDS.md`](SEEDS.md) |
| Cliente A atualizado, B não | [`CORE_VERSION.md`](CORE_VERSION.md) |
| Migration quebra loja antiga | [`COMPATIBILITY.md`](COMPATIBILITY.md) |
| Secrets no manifesto | `clients.local.json` gitignored |
| Env misturada entre clientes | Env por slug + `env:use` |

---

## Próximas ações (código — fora desta tarefa)

1. QA scripts: remover default hardcoded `loja-whats`
2. Footer/categorias: 100% Supabase
3. Logos: `deploy/clients/<slug>/branding/` (decisão humana)
4. `store_features` quando houver 2+ clientes com módulos distintos
