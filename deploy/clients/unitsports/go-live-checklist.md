# Go-live — UnitSports

Implantação de referência — status conhecido documentado em [`docs/HANDOFF.md`](../../../docs/HANDOFF.md) e [`docs/DATABASE_PLAN.md`](../../../docs/DATABASE_PLAN.md).

Template genérico: [`../template/go-live-checklist.md`](../template/go-live-checklist.md)

---

## Infraestrutura

- [x] Projeto Supabase criado (isolado — ref em `clients.local.json`, não versionado)
- [x] Migrations core aplicadas (lista completa: [`DATABASE_PLAN.md`](../../../docs/DATABASE_PLAN.md) § implantação UnitSports)
- [x] Site Netlify `unitsports` configurado
- [x] `DATA_PROVIDER=supabase` em produção
- [x] URL pública https://unitsports.netlify.app
- [ ] Domínio customizado (futuro)

## Branding

- [x] Logo canônica em [`branding/logo.jpeg`](branding/logo.jpeg)
- [x] Favicon e OG gerados e publicados no Storage (implantação operador)
- [x] Nome, WhatsApp e contatos em `/admin/settings`
- Sync: hoje via [`deploy/branding/`](../../branding/) (legacy) + `npm run branding:sync`; futuro: `npm run branding:sync -- --client unitsports`

## Catálogo e conteúdo

- [x] Import CSV utilizado
- [x] Categorias configuradas (CRUD v1.1)
- [x] Banners desktop e mobile ativos

## Imagens

- [x] Migração local → Storage: **56** produtos com URLs Supabase Storage
- [ ] **35** associações ambíguas pendentes validação manual com cliente
- Relatório dry-run (referência operacional): [`test-data/reports/LOCAL_IMAGE_MIGRATION_DRY_RUN.md`](../../../test-data/reports/LOCAL_IMAGE_MIGRATION_DRY_RUN.md)

## Onboarding

- [x] Tour guiado Fase 3 concluído (8 passos — settings → import → mídia → categorias → banners → review)
- [ ] Desligar `ENABLE_MIGRATION_TOOLS` após validação final do catálogo/imagens

## Validação

- [x] Smoke produção 2026-06-26 ([`HANDOFF.md`](../../../docs/HANDOFF.md) §9.4)
- [x] `coreVersionInstalled` registrado em `notes.md` (1.0.0)

---

## Pendências conhecidas

1. Validar 35 imagens ambíguas com cliente
2. Desligar ferramentas de migração (`ENABLE_MIGRATION_TOOLS=false`) após go-live estável
3. Domínio próprio quando contratado
