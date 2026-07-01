# Notas operacionais — unitsports

Ficha operacional da primeira implantação de referência. **Sem secrets** — refs sensíveis em `deploy/clients/clients.local.json` (gitignored).

---

## Identidade

| Campo | Valor |
|-------|-------|
| slug | `unitsports` |
| Nome comercial | UnitSports |
| Domínio público | https://unitsports.netlify.app |
| Netlify site | `unitsports` |
| Status | production |

---

## Supabase

| Campo | Valor |
|-------|-------|
| supabaseProjectRef | Registrar em `clients.local.json` — **não versionar** |
| Projeto | Isolado (nome operacional: `unitsports`) |

---

## Versão do core

| Campo | Valor |
|-------|-------|
| coreVersionInstalled | 1.1.0 |
| lastDeployAt | 2026-07-01 |
| lastMigrationApplied | 20260627210000_store_onboarding |

Release baseline: [`docs/releases/v1.1.0.md`](../../../docs/releases/v1.1.0.md)

---

## Migrations relevantes (resumo)

Últimas migrations aplicadas — registro completo em [`docs/DATABASE_PLAN.md`](../../../docs/DATABASE_PLAN.md):

| Version | Nome |
|---------|------|
| `20260626224221` | `import_batch_post_upsert_sku_check` |
| `20260627153700` | `banner_slide_visibility` |
| `20260627210000` | `store_onboarding` |

Schema inicial + categorias, import transacional, banners e onboarding guiado já aplicados (ver tabela completa no DATABASE_PLAN).

---

## Branding

| Campo | Valor |
|-------|-------|
| Logo canônica | [`branding/logo.jpeg`](branding/logo.jpeg) |
| Sync | `npm run branding:sync -- --client unitsports` |

**Não** copiar esta logo para outras implantações.

---

## Onboarding / migração

| Item | Status |
|------|--------|
| Import CSV | Operacional |
| Central de Mídia | 56 produtos Storage OK · 35 ambíguos pendentes (2026-06-26) |
| Tour guiado | Fase 3 — 8 passos |
| `ENABLE_MIGRATION_TOOLS` | Ligado durante onboarding — desligar após validação final |

---

## Relatórios operacionais (referência)

Links internos — não copiar conteúdo para esta ficha:

- [`test-data/reports/LOCAL_IMAGE_MIGRATION_DRY_RUN.md`](../../../test-data/reports/LOCAL_IMAGE_MIGRATION_DRY_RUN.md)
- [`test-data/reports/LOCAL_IMAGE_MIGRATION_PILOT_UPLOAD.md`](../../../test-data/reports/LOCAL_IMAGE_MIGRATION_PILOT_UPLOAD.md)
- [`test-data/reports/LOCAL_IMAGE_MIGRATION_REMAINING_UPLOAD.md`](../../../test-data/reports/LOCAL_IMAGE_MIGRATION_REMAINING_UPLOAD.md)

---

## Organização de categorias (SQL operacional)

Script **preview-only** para reparent da árvore e bulk move por heurística de nome:

- [`sql/category-organisation-initial.sql`](sql/category-organisation-initial.sql) — fase 1 (reparent + sneakers/NBA/inverno)
- [`sql/category-organisation-phase2.sql`](sql/category-organisation-phase2.sql) — fase 2 (feminina/jogador/retrô/BR/EU + resíduos → sapatos)
- [`sql/category-organisation-phase3.sql`](sql/category-organisation-phase3.sql) — fase 3 (169 restantes → subs finais)

**Execução 2026-06-24 (MCP):** Fases 1–3 aplicadas. Raiz `camisas` com **0 produtos**; subs criadas: `internacionais`, `selecao-brasileira`, `resto-do-mundo`, `arabia-saudita`, `edicoes-especiais`, `camisa-treino`.

---

## Smoke (gate v1.1.0)

Validação com **código novo** + env UnitSports + dados reais (não usar produção atual como prova do refactor).

Fluxo preferido (env em `deploy/clients/unitsports/.env.local`, sem copiar para raiz):

```bash
npm run build:client -- unitsports
npm run test:e2e:smoke:client -- unitsports
```

Compatibilidade:

```bash
npm run env:use -- unitsports
npm run build && npm start
# outro terminal:
PLAYWRIGHT_BASE_URL=https://unitsports.netlify.app npm run test:e2e:smoke
```

Casos ampliados: hero/banner, footer categorias, header branding, admin settings/comercial. Resultado em `test-data/e2e/smoke-regression-results.json`.

**MCP (pré-smoke):** `store_settings` com `logo.webp` + `hero.webp`; 5 categorias raiz visíveis; 5 banners ativos.

**Gate 2026-07-01:** build local `:3001` + smoke 18/18 PASS. **Produção** https://unitsports.netlify.app — smoke 18/18 PASS (2026-07-01).

---

## Pendências

- Validar **35** associações de imagem ambíguas com cliente
- Desligar `ENABLE_MIGRATION_TOOLS` após go-live estável
- Domínio customizado (quando contratado)

---

## Observações de suporte

Registrar aqui notas de atendimento, decisões com cliente e follow-ups — **sem dados sensíveis** (CPF, senhas, keys, tokens).

<!-- Exemplo: "2026-06-27 — Cliente validará lista de 35 SKUs ambíguos na próxima reunião." -->
