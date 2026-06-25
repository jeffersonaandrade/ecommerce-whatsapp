# Handoff — Checkpoint pré-Fase 7

**Auditoria:** 2026-06-26  
**Fonte da verdade:** código + testes executados + Graphify  
**Repo:** https://github.com/jeffersonaandrade/ecommerce-whatsapp.git  
**Produção:** https://loja-whats.netlify.app  
**Posicionamento:** MVP funcional (não “demo”)

---

## 1. Estado atual do produto

Legenda: ✅ Implementado · 🟡 Parcial · ❌ Não implementado

| Área | Status | Evidência / observação |
|------|--------|------------------------|
| **Home** | ✅ | `app/page.tsx` — hero, categorias, destaques, banner editorial |
| **PLP** | ✅ | `app/products/page.tsx` — filtros, paginação, metadata |
| **PDP** | ✅ | `app/products/[slug]/page.tsx` — variações, metadata, canonical |
| **Carrinho** | ✅ | `context/cart-context.tsx` + localStorage + testes |
| **WhatsApp** | ✅ | `buildWhatsAppMessage` + `#TEMP-YYYYMMDD-NNNN` + testes |
| **CRUD Produtos** | ✅ | Admin create/edit/delete + `JsonProductRepository` |
| **Categorias** | 🟡 | Admin **somente leitura** (derivadas); filtros da vitrine usam `config/site.ts` estático |
| **Importação CSV** | ✅ | Wizard completo (`/admin/import`); **sem** histórico (CSV-5) |
| **Branding** | ✅ | Logo → favicon/OG (sharp); API `/api/branding/*` |
| **Hero configurável** | 🟡 | 1 hero em `StoreSettings`; `EditorialBanner` **hardcoded** |
| **Institucional** | ✅ | `/sobre`, `/contato`, `/politica-de-trocas` via settings |
| **Login Admin** | ✅ | Demo JSON (`localStorage`) **ou** Supabase Auth + `requireAdmin()` + middleware com `app_metadata.role=admin` |
| **Persistência admin** | 🟡 | JSON local OK; Netlify demo falha (500). Supabase resolve em produção |
| **SEO** | ✅ | `buildPageMetadata`, canonical PLP/Home/PDP, OG, robots PDP |
| **Deploy Netlify** | 🟡 | Vitrine OK; **admin que grava disco falha** (500) |
| **Testes** | ✅ | **50 passed** (9 arquivos) — executado 2026-06-26 |
| **Build** | ✅ | `npm run build` OK — 23 rotas |

### Itens explicitamente ❌ não implementados

- Banner Manager (múltiplos banners)
- Categorias CRUD
- Menus administráveis
- Admin shell (`app/admin/layout.tsx` + sidebar)
- Histórico import CSV (`/admin/import/history`)
- Pedidos persistidos (`/admin/orders` = placeholder)
- Checkout online / gateway

---

## 2. Roadmap — direção estratégica (atualizada 2026-06-26)

### Decisão de prioridade

**Persistência antes de CMS.** O maior problema do projeto não é falta de Banner Manager — é que toda gravação admin depende de filesystem descartável. Construir features de CMS em JSON (`banner.json`, `categories.json`) antes do Supabase = **trabalho duplicado** (implementar → migrar → remover JSON → retestar).

### Sequência aprovada

```
MVP apresentado → Cliente aprovou
        ↓
Sprint 1: Supabase + Storage + Auth + DATABASE_PLAN
        ↓
Sprint 2: Migrar domínios JSON existentes (Products, Settings, Branding, CSV)
        ↓
Sprint 3: Deploy definitivo + 1º cliente em produção
        ↓
Corrigir problemas reais de uso
        ↓
Sprint 4+: Banner Manager → Categorias CRUD → Menus (já persistidos)
        ↓
Segundo cliente → só então pensar em V2
```

### O que NÃO muda

| Afirmação | Veredito |
|-----------|----------|
| V1 comercial pronta (local) | **Sim** — cadastrar → CSV → WhatsApp funciona |
| Maior gap = Supabase + Auth + Storage | **Sim** — confirmado QA Netlify (save → 500) |
| CMS (banners/menus/categorias) antes de persistência | **Não** — adiado até pós-1º cliente |

### Modelo de entrega

- **Single-tenant:** cada cliente = deploy próprio + Supabase dedicado
- **Não** multi-tenant SaaS nesta fase

---

## 2.1 Arquitetura congelada

Decisões que **NÃO devem ser reabertas** sem aprovação explícita do dono do negócio:

- **Single-tenant** por cliente (deploy + Supabase dedicado)
- **Checkout via WhatsApp** na V1 (`PurchaseIntent`, não `Order`)
- **Sem gateway / PIX / checkout online** na V1
- **Sem pedidos persistidos** na V1
- **Graphify** como mapa vivo do projeto (reduz docs redundantes)
- **Repository Pattern** — `getProductRepository()`, factories por domínio
- **StoreSettings centralizados** (singleton por loja)
- **Design System atual** (`docs/DESIGN_SYSTEM.md`) — sem UI polish até feedback de uso real
- **Layout fixo, conteúdo dinâmico** — anti–page-builder
- **Next.js 16 + TypeScript + Tailwind** — sem trocar stack
- **Catálogo manual + CSV** como entradas complementares

---

## 2.2 O que NÃO construir

Sem aprovação explícita, **não implementar**:

- Programa de fidelidade / cashback
- Wishlist / favoritos
- Avaliações de produtos
- Checkout online / gateway / PIX
- Cupons de desconto
- Estoque avançado (reserva, multi-depósito, alertas)
- ERP / integração fiscal
- Multi-tenant / signup self-service
- Dashboard financeiro / relatórios de vendas
- Marketplace
- App mobile nativo
- IA / recomendação automática
- Histórico CSV (CSV-5) — até pós-1º cliente
- Admin shell elaborado — até pós-persistência (ajustes mínimos OK)

**Risco a evitar:** adicionar feature porque “fica bonito” nesta fase. O MVP já convenceu; falta **operacionalizar**.

---

## 3. Auditoria técnica

| Item | Valor atual |
|------|-------------|
| Testes | **50 passed** / 9 files (`vitest run`) |
| Build | OK (`next build`, Next.js 16.2.9) |
| Último commit | `4809e35` — chore(repo): remove manual test artifacts (2026-06-25) |
| Branch | `master` sync com `origin/master` |
| Graphify | **542 nós · 1250 arestas · 20 comunidades** (`graphify-out/`) |
| Versão `package.json` | `1.0.0` (CHANGELOG cita `1.0.1-demo` — **desalinhado**) |

### Persistência atual (filesystem)

| Dado | Arquivo / pasta |
|------|-----------------|
| Catálogo | `storage/catalog.json` (gitignored; seed em `catalog.seed.json`) |
| Settings | `storage/store-settings.json` |
| Branding | `storage/branding/` |
| Prebuild Netlify | `deploy/netlify/` + `scripts/prepare-netlify-build.mjs` |

### Documentos a manter (núcleo)

- `docs/ARCHITECTURE.md` — **precisa atualização** (diz “Mock”, “Settings placeholder”)
- `docs/DOMAIN_MODEL.md` — **precisa atualização** (Category/Banner futuros)
- `docs/DESIGN_SYSTEM.md`
- `docs/CSV_IMPORT_SPEC.md` + `docs/IMPORT_PIPELINE.md` (operacional)
- `docs/GO_LIVE_CHECKLIST.md` — **precisa atualização** (checkboxes desatualizados)
- `CHANGELOG.md`
- `docs/HANDOFF.md` (este documento)
- `graphify-out/` (mapa vivo)

### Documentos candidatos a `docs/archive/`

| Arquivo | Motivo |
|---------|--------|
| `docs/QA_REPORT.md` | QA Fase 3 — superseded |
| `docs/SPRINT_BUGFIX_QA_REPORT.md` | Entrega pontual |
| `docs/PDP_RELOAD_INVESTIGATION.md` | Investigação concluída |
| `docs/VISUAL_QA_POST_LANDING.md` | Checkpoint UI pontual |
| `docs/RELEASE_NOTES_v1.0.0-demo.md` | Tag antiga |
| `docs/UI_POLISH_PLAN.md` | Adiado até feedback cliente |

### Documentos desatualizados (corrigir ou consolidar)

- `ROADMAP.md` — ainda diz “Fase 4 próxima” (Fases 4–6 já no código)
- `docs/MODULE_ROADMAP.md` — diz Fases 4–6 ✅ mas Go Live “em andamento” sem sync
- `PROJECT_SCOPE.md` — versão 0.2.0, lista placeholders já implementados
- `docs/ARCHITECTURE.md` — tabela de módulos desatualizada

---

## 4. Produção (Netlify)

**URL:** https://loja-whats.netlify.app (HTTP 200 — verificado 2026-06-26)

### Funciona normalmente

- Vitrine (produtos do prebuild/seed)
- PLP, PDP, carrinho (localStorage)
- WhatsApp checkout (`#TEMP-...`)
- Login demo (flag browser)
- Leitura admin (listar produtos, ver settings)
- Branding servido via `/api/branding/*` (assets do build)

### Depende de filesystem (não funciona em serverless)

- Salvar settings (`persistStoreSettings` → `fs.writeFileSync`)
- Import CSV confirm (`persistCatalog`)
- CRUD produtos (create/update/delete)
- Upload logo / hero (`storage/branding/`)

**Comportamento observado:** salvar settings → **HTTP 500** (não falha silenciosa).

### Obrigatório migrar para Supabase

| Domínio | Tabela / bucket sugerido |
|---------|--------------------------|
| Produtos + variações | Postgres |
| Store settings | Postgres (singleton) |
| Categorias (futuro CRUD) | Postgres |
| Menus / banners (futuro) | Postgres |
| Imagens upload | Supabase Storage |
| Auth admin | Supabase Auth |

---

## 5. Roadmap — sprints (persistência primeiro)

> **Regra:** nenhuma feature CMS nova em JSON. Novos domínios nascem direto no Supabase.

### Sprint 1 — Supabase foundation

**Objetivo:** Infra de persistência pronta — Postgres, Storage, Auth — sem migrar domínios ainda.

**Itens:**
- Criar `docs/DATABASE_PLAN.md` (schema, RLS, buckets, env vars)
- Projeto Supabase de referência (dev/staging)
- Migrations: `products`, `product_variations`, `store_settings`
- Supabase Storage: buckets `branding`, `products`
- Supabase Auth: email/senha, usuário admin seed
- `@supabase/supabase-js` + clients server/browser
- Factory `DATA_PROVIDER=json|supabase` (default json em dev)
- Esqueleto `SupabaseProductRepository`, `SupabaseStoreSettingsRepository`

**Dependências:** nenhuma.

**Riscos:** schema incompleto obriga remigration; RLS mal configurado expõe dados.

**Aceite (código):**
- [x] `DATABASE_PLAN.md` aprovado
- [x] SQL documentado (copy-paste Dashboard)
- [x] Factory `DATA_PROVIDER` + clients Supabase
- [x] Repositórios Supabase implementados
- [x] `npm run test` + `npm run build` verdes com `DATA_PROVIDER=json`

**Aceite (manual — operador):**
- [ ] SQL executado no projeto Supabase dev
- [ ] Upload teste em Storage funciona
- [ ] Login Auth funciona no Dashboard

---

### Sprint 2 — Migrar JSON existente

**Objetivo:** Tudo que hoje grava em `storage/` passa a usar Supabase. Zero regressão no fluxo comercial.

**Itens:**
- `SupabaseProductRepository` completo — substituir `JsonProductRepository` em produção
- Settings → Postgres (singleton `store_settings`)
- Branding/logo/hero → Supabase Storage (substituir `storage/branding/`)
- CSV import → grava via repository Supabase
- Script `migrate-json-to-supabase.mjs` (seed → prod)
- `middleware.ts` protege `/admin/*` (exceto login)
- Remover credenciais demo hardcoded; login Auth real
- Ajustar `generate-branding.ts` para Storage
- Testes de integração com Supabase (ou mocks)

**Dependências:** Sprint 1.

**Riscos:** Netlify env vars; home estática (`○ /`) com cache de branding; cold start.

**Aceite (código):**
- [x] Repositórios Supabase completos + mappers
- [x] Branding → Storage + `generate-branding.ts`
- [x] `migrate-json-to-supabase.mjs`
- [x] `middleware.ts` + login Supabase Auth
- [x] `prepare-netlify-build.mjs` com skip JSON em supabase
- [x] 50 testes verdes

**Aceite (produção — operador):**
- [ ] Salvar settings funciona em https://loja-whats.netlify.app
- [ ] CSV import persiste e aparece na vitrine
- [ ] Upload logo/hero persiste após redeploy
- [ ] CRUD produtos persiste
- [x] Admin protegido por Auth (`requireAdmin` + middleware + RLS documentado)

---

### Sprint 3 — Deploy definitivo + 1º cliente

**Objetivo:** Cliente real operando em produção; corrigir fricções de uso — **não** adicionar CMS.

**Itens:**
- Checklist provisionamento single-tenant (Supabase + Netlify + env)
- Onboarding 1º cliente: identidade, CSV, WhatsApp
- Monitorar: save settings, import, upload, pedido `#TEMP-...`
- Documentar fricções reais → backlog pós-cliente
- Sync docs desatualizados (ARCHITECTURE, ROADMAP, GO_LIVE)
- Arquivar docs pontuais em `docs/archive/`

**Dependências:** Sprint 2.

**Riscos:** cliente bloqueado por bug de produção; suporte manual excessivo.

**Aceite (docs/código):**
- [x] Checklist provisionamento em `DATABASE_PLAN.md` + `GO_LIVE_CHECKLIST.md`
- [x] Onboarding 1º cliente documentado
- [x] Sync `ARCHITECTURE.md`, `ROADMAP.md`, `HANDOFF.md`

**Aceite (operacional — 1º cliente):**
- [ ] Cliente altera logo/nome/WhatsApp sem suporte
- [ ] Import CSV de catálogo real concluído
- [ ] ≥1 pedido WhatsApp `#TEMP-...` em produção
- [ ] Lista de melhorias priorizada por **uso real**

---

### Sprint 4+ — CMS (após 1º cliente, já persistido)

**Objetivo:** Evoluir vitrine administrável — cada feature nasce direto no Supabase.

**Ordem sugerida:**
1. **Banner Manager** — tabela `banners` + Storage desktop/mobile
2. **Categorias CRUD** — tabela `categories`; migrar `Product.category` string
3. **Menus admin** — tabela `nav_items`; header/footer dinâmicos
4. **Admin shell** — sidebar, rotas Conteúdo/Config (quando fizer sentido)

**Dependências:** Sprint 3 concluída + feedback do 1º cliente.

**Riscos:** scope creep; construir antes de validar necessidade.

**Aceite:** definido por sprint individual após feedback.

---

## 6. Mensagem comercial (validada)

> A loja online (vitrine, carrinho, WhatsApp) funciona no link público.  
> O painel admin completo em produção depende da **Fase 7 (banco de dados)**.  
> Hoje o admin opera integralmente em **instalação local ou VPS com disco**.

---

## 7. Comandos de verificação

```bash
npm run test      # 50 passed
npm run build     # produção local
npm run build:netlify  # simula prebuild deploy
npm run start     # admin gravável localmente
graphify update . # após mudanças estruturais
```

---

## 8. Inconsistências encontradas (código vs docs)

| Documento | Código real |
|-----------|-------------|
| ROADMAP: Fase 4 “próxima” | Fases 4–6 implementadas |
| ARCHITECTURE: Catalog “Mock” | `JsonProductRepository` operacional |
| ARCHITECTURE: Settings “Placeholder” | Admin settings funcional |
| GO_LIVE: checkboxes abertos Sprints 1–3 | Features largamente implementadas |
| MODULE_ROADMAP: CSV-5 histórico | Rota `/admin/import/history` não existe |
| CHANGELOG 1.0.1-demo vs package 1.0.0 | Versões desalinhadas |

**Regra:** em conflito, **código prevalece**.

---

*Próxima revisão deste handoff: após onboarding 1º cliente em produção com Supabase.*
