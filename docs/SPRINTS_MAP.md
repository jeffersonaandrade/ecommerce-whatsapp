# Mapa de Sprints — Sports Store

Estado atualizado em 2026-06-26. Fonte de verdade: código no repo + migrations aplicadas em produção.

> **Regra:** em conflito entre docs e código, **código prevalece**.

---

## Visão geral

```
Fases 1–6 (Catálogo, Cart, CSV, WhatsApp) ── ✅ Concluídas
         │
Go-Live Sprints (Identidade, Hardening) ──── ✅ Concluídas em produção
         │
Sprint 1 Admin ──────────────────────────── ✅ Concluída
Sprint 2 Import ─────────────────────────── ✅ Concluída
Sprint 3 Mídia e Storefront ─────────────── ✅ Estável (migration aplicada + DT-003 resolvido)
Sprint 4A Conteúdo (Benefícios) ─────────── ✅ Estável (migration aplicada)
         │
Sprint 4B ────────────────────────────────── 📅 Planejada (ver abaixo)
Sprint 5  ────────────────────────────────── 📅 Definição pendente
```

---

## Sprints concluídas

### Sprint 1 — Admin como Sistema ✅
**Entregou:** filtros, busca, paginação, ações em lote em `/admin/products` e `/admin/categories`. `AdminListPage`, `AdminPagination`, `SearchBar`, `StatusTabs`, `BulkActionsBar`, `ProductsTable`.

### Sprint 2 — Importação Profissional ✅
**Entregou:** coluna `status` no CSV, `importBatchId`, policy de status configurável em Settings, redirect para `/admin/products?batch=X` pós-importação.

### Sprint 3 — Mídia e Storefront Visual ✅
**Entregou:**
- **Parte B:** `imagePath` em categorias, upload/remoção no form admin, cards visuais na home com fallback para botões
- **Parte C:** `banner_slides`, repositório dual-provider, admin CRUD (`/admin/banners`), `BannerCarousel` na home com auto-play 5s, pause hover/touch, retomada 8s, imagem mobile responsiva via `<picture>`

**Migration:** `sprint3_media_storefront` (MCP `20260626190619`) aplicada. Ver [`SPRINT3_STATUS.md`](SPRINT3_STATUS.md).

**DT-003 resolvido:** `/admin/banners/new` exige imagem desktop; `createBannerSlideWithDesktopAction` faz upload antes do insert; vitrine filtra slides sem `desktopImagePath`.

### Sprint 4A — Conteúdo: Benefícios ✅
**Entregou:** tabela `benefit_items`, admin CRUD em `/admin/content/benefits`, `HomeBenefits` consome dados do banco, campos `benefitsEyebrow`/`benefitsTitle` em `store_settings`.
Migration `sprint4a_benefit_items` (MCP `20260626190630`) aplicada.

---

## Sprints planejadas

### Sprint 4B — A definir

Os candidatos naturais levantados nos docs são (sem ordem de prioridade):

| Candidato | Motivação documentada | Fonte |
|-----------|----------------------|-------|
| **Footer editável + categorias dinâmicas** | Footer desalinhado com CRUD categorias | Sprint 4B backlog |
| **Menus admin** (`nav_items`) | Header/footer dinâmicos sem redeploy | `HANDOFF.md §Sprint 4+` |
| **CSV-5 histórico** | `/admin/import/history` listada no roadmap mas rota não existe | `HANDOFF.md §inconsistências` |
| **Normalização `products.category`** | Ainda string legado; categorias estão em tabela mas produtos referenciam por slug direto | `DATABASE_PLAN.md §schema` |
| **SEO** | `generateMetadata` PDP/PLP, og:image, canonical | `GO_LIVE_CHECKLIST.md Sprint 3 SEO` |

**Decisão necessária:** escolher 1–2 itens para Sprint 4B antes de iniciar.

### Sprint 5+ — Fora de escopo V1

Itens documentados como pós-1º cliente:

- Checkout online (gateway, PIX, frete)
- Entidade `Order` persistida
- Multi-tenant / SaaS
- Exportação CSV
- Histórico de pedidos

---

## O que NÃO vai entrar sem aprovação explícita

Definido em [`HANDOFF.md §2.2`](HANDOFF.md):

- Theme engine / page builder
- Marketplace
- App mobile
- Programa de pontos / cashback
- ERP / integração fiscal

---

## Referências

| Documento | O que cobre |
|-----------|------------|
| [`MODULE_ROADMAP.md`](MODULE_ROADMAP.md) | Fases macro do produto (1–9) |
| [`GO_LIVE_CHECKLIST.md`](GO_LIVE_CHECKLIST.md) | Checklist operacional para deploy com cliente |
| [`DATABASE_PLAN.md`](DATABASE_PLAN.md) | Schema, migrations aplicadas, registro de versões |
| [`SPRINT3_STATUS.md`](SPRINT3_STATUS.md) | Validação detalhada Sprint 3 (migration, TS, testes, DT) |
| [`BROWSER_TESTING_CHECKLIST.md`](BROWSER_TESTING_CHECKLIST.md) | 53 casos de teste browser (Sprint 1–3 + regressão) |
| [`HANDOFF.md`](HANDOFF.md) | Decisões arquiteturais congeladas e modelo de entrega |
