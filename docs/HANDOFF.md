# Handoff — Checkpoint pré-Fase 7

**Auditoria:** 2026-06-27  
**Fonte da verdade:** código + testes executados + Graphify  
**Repo:** https://github.com/jeffersonaandrade/ecommerce-whatsapp.git  
**Produção:** https://loja-whats.netlify.app  
**Posicionamento:** MVP funcional (não “demo”)

**UnitSports** = primeira **implantação** de referência (`deploy/clients/unitsports/`), não o nome do produto.

---

## Estratégia multi-cliente

```text
1 código (core) → vários deploys Netlify → 1 Supabase por loja
```

- **Não** multi-tenant no mesmo banco · **Não** fork por cliente · **Não** `if (storeName === 'UnitSports')`
- Config por loja: `store_settings` + env Netlify · Versão do core: [`CORE_VERSION.md`](CORE_VERSION.md)
- Novo cliente: [`MULTI_CLIENT_DEPLOYMENT.md`](MULTI_CLIENT_DEPLOYMENT.md) + [`deploy/clients/template/go-live-checklist.md`](../deploy/clients/template/go-live-checklist.md)
- Auditoria de acoplamentos: [`MULTI_CLIENT_AUDIT.md`](MULTI_CLIENT_AUDIT.md)

---

## 1. Estado atual do produto

Legenda: ✅ Implementado · 🟡 Parcial · ❌ Não implementado

| Área | Status | Evidência / observação |
|------|--------|------------------------|
| **Home** | ✅ | `app/page.tsx` — hero, chips mobile, categorias desktop, destaques deduplicados (Fase 0 `25ef567`) |
| **PLP** | ✅ | `app/products/page.tsx` — paginação server-side (24/página), filtros por categoria, metadata |
| **PDP** | ✅ | `app/products/[slug]/page.tsx` — variações, metadata, canonical; `ProductGallery` (miniaturas + setas); textos sem HTML cru (`stripHtml`) |
| **Carrinho** | ✅ | `context/cart-context.tsx` + localStorage + testes |
| **WhatsApp** | ✅ | `buildWhatsAppMessage` + `#TEMP-YYYYMMDD-NNNN` + testes |
| **CRUD Produtos** | ✅ | Admin create/edit/delete; `MoneyInput` BRL; validação por campo; ordem fotos (posição 1 = destaque); redirect pós-create → edit `?created=1`; banner visibilidade na loja |
| **Categorias** | ✅ | CRUD v1.1 (`/admin/categories`); PLP/home com slugs; select no produto; CSV `CSV_E008` |
| **Importação CSV** | ✅ | Wizard (`/admin/import`); RPC transacional `apply_product_import_batch`; revalidação SKU pós-upsert; **sem** histórico (CSV-5). Sempre disponível no admin |
| **Central de Mídia** | ✅ | `/admin/products/media` — filtros mídia server-side (`?media=`), inventário paginado, wizard upload lazy (`?tab=upload`). Migração local→Storage: **56** OK · **35** ambíguos pendentes validação cliente |
| **Branding** | ✅ | Logo/favicon/OG via Storage + `/api/branding/*`; **upload self-service de logo fora do MVP** (implantação/suporte) |
| **Hero configurável** | ✅ | 1 hero em `StoreSettings`; grid de produtos removido do hero (Fase 0) |
| **Institucional** | ✅ | `/sobre`, `/contato`, `/politica-de-trocas` via settings |
| **Login Admin** | ✅ | Demo JSON (`localStorage`) **ou** Supabase Auth + `requireAdmin()` + middleware com `app_metadata.role=admin` |
| **Persistência admin** | ✅ | Supabase em produção Netlify; JSON local para dev |
| **SEO** | ✅ | `buildPageMetadata`, canonical PLP/Home/PDP, OG, robots PDP |
| **Deploy Netlify** | ✅ | Produção Supabase integrada; smoke §9.4 + Fase 0 §9.7 PASS (2026-06-26) |
| **Testes** | ✅ | **207 passed** (47 arquivos) — executado 2026-06-27 |
| **Build** | ✅ | `npm run build` OK — 23 rotas |

### Itens explicitamente ❌ não implementados

- Banner Manager (múltiplos banners)
- Menus administráveis
- Admin shell (`app/admin/layout.tsx` + sidebar)
- Histórico import CSV (`/admin/import/history`)
- Pedidos persistidos (`/admin/orders` = placeholder)
- Checkout online / gateway
- Upload self-service de logo no admin (fora do MVP — ver §1.1)

### 1.1 Logo e identidade visual (implantação UnitSports)

**Escopo cliente (admin):** produtos, CSV, fotos de produto, hero/banner, textos e contatos em `/admin/settings`. **Sem** upload de logo pelo lojista.

**Escopo operador/suporte (implantação):** logo, favicon e imagem OG. Motivo: o pipeline Sharp gera vários derivados em Server Action serverless (Netlify) — operação rara, risco de timeout/500 em reenvio.

**Onboarding recomendado — respeitar a arte do cliente:**

- **Arquivo canônico:** substitua `deploy/branding/logo.jpeg` (ou `logo.jpg` / `logo.png` / `logo.webp`) — nome genérico fixo, pasta única por loja.
- Se o cliente enviar logo **quadrada**, publicar **quadrada** (sem forçar crop horizontal).
- Se enviar logo **horizontal**, publicar **horizontal**.
- Header usa `object-contain` + `max-w-[120px]` — a vitrine respeita a proporção do arquivo implantado.
- **Supabase (produção):** após trocar o arquivo, rode `npm run branding:sync` (carrega `.env.local` com service role) ou use **Restaurar aparência padrão** no admin.
- **JSON local / demo Netlify sem Supabase:** o prebuild gera os derivados automaticamente a partir de `deploy/branding/logo.*`.
- **Restaurar aparência padrão** (admin): ferramenta de operador; redefine logo, favicon, OG, cores, hero e textos preset a partir do preset + `deploy/branding/logo.*`.

**Código mantido (não removido):** `generate-branding.ts`, `uploadStoreLogoAction`, metadata, `/api/branding/*`.

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
| Testes | **207 passed** / 47 files (`vitest run`) |
| Build | OK (`npm run build:netlify`) |
| Último commit | `0a00394` chore(graphify) · `99860e6` ordem fotos admin · `026dab8` PDP galeria · `97fdeab` SKU pós-upsert import |
| Branch | `master` — sincronizado com `origin/master` |
| Graphify | **1410 nós · 3507 arestas · 72 comunidades** (`graphify-out/`, sync 2026-06-26, commit `99860e6`) |
| Versão `package.json` | `1.0.0` (CHANGELOG cita `1.0.1-demo` — **desalinhado**) |

### Persistência atual (filesystem)

| Dado | Arquivo / pasta |
|------|-----------------|
| Catálogo | `storage/catalog.json` (gitignored; seed em `catalog.seed.json`) |
| Settings | `storage/store-settings.json` |
| Branding | `storage/branding/` |
| Prebuild Netlify | `deploy/netlify/` + `scripts/deploy/prepare-netlify-build.mjs` |

### Documentos a manter (núcleo)

- `docs/ARCHITECTURE.md` — atualizado (Supabase + `DATA_PROVIDER`)
- `docs/DOMAIN_MODEL.md` — **precisa atualização** (Category/Banner futuros)
- `docs/DESIGN_SYSTEM.md`
- `docs/CSV_IMPORT_SPEC.md` + `docs/IMPORT_PIPELINE.md` (operacional)
- `docs/GO_LIVE_CHECKLIST.md` — checkboxes operacionais Supabase/Netlify pendentes
- `CHANGELOG.md`
- `docs/HANDOFF.md` (este documento)
- [`docs/qa/QA_E2E_PLAYWRIGHT_REPORT.md`](qa/QA_E2E_PLAYWRIGHT_REPORT.md) — evidência QA E2E Supabase (fonte atual)
- [`docs/product/PROJECT_SCOPE.md`](product/PROJECT_SCOPE.md) — escopo histórico
- [`docs/operations/CLIENT_SETUP_CHECKLIST.md`](operations/CLIENT_SETUP_CHECKLIST.md) — onboarding
- `graphify-out/` (mapa vivo)

### Documentos em `docs/archive/` (Fase 2 — 2026-06-26)

| Arquivo | Motivo |
|---------|--------|
| [`docs/archive/QA_REPORT.md`](archive/QA_REPORT.md) | QA Fase 3 — superseded |
| [`docs/archive/SPRINT_BUGFIX_QA_REPORT.md`](archive/SPRINT_BUGFIX_QA_REPORT.md) | Entrega pontual |
| [`docs/archive/PDP_RELOAD_INVESTIGATION.md`](archive/PDP_RELOAD_INVESTIGATION.md) | Investigação concluída |
| [`docs/archive/VISUAL_QA_POST_LANDING.md`](archive/VISUAL_QA_POST_LANDING.md) | Checkpoint UI pontual |
| [`docs/archive/RELEASE_NOTES_v1.0.0-demo.md`](archive/RELEASE_NOTES_v1.0.0-demo.md) | Tag antiga |
| [`docs/archive/UI_POLISH_PLAN.md`](archive/UI_POLISH_PLAN.md) | Adiado até feedback cliente |
| [`docs/archive/GO_LIVE_QA_REPORT.md`](archive/GO_LIVE_QA_REPORT.md) | Superseded por E2E |
| [`docs/archive/QA_SUPABASE_ADMIN_BROWSER_REPORT.md`](archive/QA_SUPABASE_ADMIN_BROWSER_REPORT.md) | Superseded por E2E |
| [`docs/archive/DEV_NOTES.md`](archive/DEV_NOTES.md) | Diário interno — HANDOFF é canônico |

### Documentos desatualizados (corrigir ou consolidar)

- ~~`ROADMAP.md` — Fase 7 parcialmente marcada ✅; migração Netlify pendente~~ — **sync 2026-06-27**
- ~~`docs/MODULE_ROADMAP.md` — Go Live “em andamento” sem sync~~ — **sync 2026-06-27**
- `PROJECT_SCOPE.md` → [`docs/product/PROJECT_SCOPE.md`](product/PROJECT_SCOPE.md) — escopo histórico
- `README.md` — revisar métricas de teste e comandos de migração

---

## 4. Produção (Netlify)

**URL:** https://loja-whats.netlify.app (HTTP 200 — verificado 2026-06-26)  
**Provider:** `DATA_PROVIDER=supabase` · **Último deploy validado:** commit `026dab8` (PDP galeria + strip HTML) — commits posteriores incluem ordem fotos admin (`99860e6`) e graphify (`0a00394`)

### Funciona normalmente

- Vitrine (Supabase Postgres)
- PLP, PDP, carrinho (localStorage)
- WhatsApp checkout (`#TEMP-...`)
- Login admin Supabase Auth + CRUD/settings/import/uploads
- Branding servido via `/api/branding/*` (Supabase Storage)
- Navegação por categorias (header desktop, chips mobile, filtros PLP)

### Modo JSON local (dev)

- `DATA_PROVIDER=json` — filesystem em `storage/`; admin demo sem auth real
- Não reflete produção Netlify

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
- [x] 60 testes verdes

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
- [ ] Cliente altera nome/WhatsApp sem suporte (logo/favicon: implantação — ver §1.1)
- [ ] Import CSV de catálogo real concluído
- [ ] ≥1 pedido WhatsApp `#TEMP-...` em produção
- [ ] Lista de melhorias priorizada por **uso real**

---

### Sprint 4+ — CMS (após 1º cliente, já persistido)

**Objetivo:** Evoluir vitrine administrável — cada feature nasce direto no Supabase.

**Entregue (Sprint 3/4A):**
- **Banner carrossel** — tabela `banner_slides` + Storage desktop/mobile (`/admin/banners`)
- **Benefícios editáveis** — tabela `benefit_items` + settings eyebrow/título (`/admin/content/benefits`)

**Ordem sugerida (backlog):**
1. **Footer editável** — Sprint 4B (categorias dinâmicas + links controlados)
2. **Menus admin** — tabela `nav_items`; header/footer dinâmicos
3. **Termos/Privacidade** — Sprint 4C
4. **Admin shell** — sidebar, rotas Conteúdo/Config (quando fizer sentido)

**Dependências:** Sprint 3 concluída + feedback do 1º cliente.

**Riscos:** scope creep; construir antes de validar necessidade.

**Aceite:** definido por sprint individual após feedback.

---

## 6. Mensagem comercial (validada)

> A vitrine (PLP, PDP, carrinho, WhatsApp) funciona no link público e em local com Supabase.  
> O admin **completo** validado localmente (E2E) e em **produção Netlify** com Supabase — ver [`docs/HANDOFF.md`](HANDOFF.md) §9.4.  
> **Próximo marco:** onboarding 1º cliente (Sprint 3).

---

## 7.1 Ferramentas de catálogo em lote (admin)

| Rota | Disponibilidade |
|------|-----------------|
| `/admin/import` | Sempre — importação CSV |
| `/admin/products/media` | Sempre — Central de Mídia |

Scripts operador de migração local→Storage: [`scripts/README.md`](../scripts/README.md) · [`scripts/operator/README.md`](../scripts/operator/README.md).

## 7.2 Auditorias futuras (ref. jun/2026)

**Hooks:** `useDeviceBreakpoint`, `useImageProbe`, `useDemoAdminSession`, `useSupabaseAdminSession`, `useCart` — sem duplicação crítica; investigar loading/upload em forms admin.

**Storage services:** `banner-storage`, `category-storage`, `category-image-storage`, `branding-storage`, `product-image-storage` — candidatos a extrair helpers comuns (Sprint futuro).

---

## 7. Comandos de verificação

```bash
npm run test      # 241 passed
npm run build     # produção local
npm run build:netlify  # simula prebuild deploy
npm run start     # admin gravável localmente
graphify update . # após mudanças estruturais

# Onboarding / migração de imagens (operador — requer ENABLE_MIGRATION_TOOLS=true)
npm run migrate:images:dry-run
npm run migrate:images:pilot      # 10 produtos
npm run migrate:images:remaining  # restante dos seguros
```

---

## 8. Inconsistências encontradas (código vs docs)

| Documento | Código real |
|-----------|-------------|
| ~~ROADMAP: Fase 4 “próxima”~~ | Fases 4–7 concluídas — sync 2026-06-27 |
| ARCHITECTURE: Catalog “Mock” | Repositórios JSON + Supabase via factory |
| ARCHITECTURE: Settings “Placeholder” | Admin settings funcional (JSON ou Supabase) |
| GO_LIVE: checkboxes abertos Sprints 1–3 | Código pronto; aceite operacional onboarding pendente (§9) |
| MODULE_ROADMAP: CSV-5 histórico | Rota `/admin/import/history` não existe — adiado |
| CHANGELOG 1.0.1-demo vs package 1.0.0 | Versões desalinhadas |
| HANDOFF test count | **207 passed** / 47 files (2026-06-27) |

**Regra:** em conflito, **código prevalece**.

---

## 9. Validação de pendências

**Atualizado:** 2026-06-27 · Fontes: commits `97fdeab`…`0a00394`, [`docs/qa/QA_E2E_PLAYWRIGHT_REPORT.md`](qa/QA_E2E_PLAYWRIGHT_REPORT.md), smoke produção https://loja-whats.netlify.app

### Resumo

| Ambiente | Status | Observação |
|----------|--------|------------|
| **Local Supabase** | ✅ **Aprovado** | E2E-1…E2E-9 PASS — ver §9.3 |
| **Netlify + Supabase** | ✅ **Aprovado** | Env vars + smoke §9.4 PASS (2026-06-26) |
| **Produção 1º cliente** | ❌ **Pendente** | Sprint 3 — onboarding operacional |

> **Não iniciar novas features agora.** Banner Manager, Categorias CRUD e Menus são **Sprint 4+** — não bloqueiam deploy MVP.

### 9.1 Código e testes (repo)

| Item | Status | Evidência |
|------|--------|-----------|
| Auth P0 (`requireAdmin`, middleware, RLS doc) | ✅ | commit `1eb4d43` |
| Alerta `?error=unauthorized` persistente | ✅ | commit `299c7f7` |
| Repositórios async + páginas `await` | ✅ | commit `14905a2` |
| Upload imagem produto (Storage) | ✅ | E2E-4 PASS — [`docs/qa/QA_E2E_PLAYWRIGHT_REPORT.md`](qa/QA_E2E_PLAYWRIGHT_REPORT.md) |
| QA E2E Playwright (E2E-1…E2E-9) | ✅ | commit `16b796a` |
| Testes | ✅ | `207 passed` / 47 files |
| Build | ✅ | `npm run build` OK |
| Toggle mostrar senha no login | ✅ | commit `76f5431` |

### 9.2 Supabase Dashboard (operador — manual)

- [x] **Auth → Providers → Email:** desabilitar **Enable sign ups**
- [x] Admin com `app_metadata.role=admin` (usuários seed configurados)
- [x] Rotacionar `service_role` → `.env.local` atualizado
- [x] Rotacionar/copiar `service_role` → **Netlify production**
- [x] SQL RLS + Storage admin (aplicado — ver `DATABASE_PLAN.md`)
- [x] Usuário QA temp `qa-no-admin-temp@test.local` removido

### 9.3 QA E2E local Supabase

**Relatório:** [`docs/qa/QA_E2E_PLAYWRIGHT_REPORT.md`](qa/QA_E2E_PLAYWRIGHT_REPORT.md) · **Resultado:** APROVADO COM RESSALVAS (local)

| ID | Fluxo | Status |
|----|--------|--------|
| E2E-1 | Login/logout/proteção admin | ✅ PASS |
| E2E-2 | Settings persistentes (incl. Sobre) | ✅ PASS |
| E2E-3 | Upload logo + hero + `/api/branding/*` 200 | ✅ PASS |
| E2E-4 | CRUD produto + upload Storage | ✅ PASS — create redireciona para `/admin/products/[id]/edit?created=1`; preço BRL `MoneyInput` |
| E2E-5 | Bloqueio data URL | ✅ PASS |
| E2E-6 | Import CSV browser | ✅ PASS |
| E2E-7 | Carrinho + WhatsApp `#TEMP-YYYYMMDD-NNNN` | ✅ PASS |
| E2E-8 | Regressão desktop + mobile | ✅ PASS |
| E2E-9 | Filesystem `storage/*` não tocado | ✅ PASS |

Substitui o QA parcial em [`docs/archive/QA_SUPABASE_ADMIN_BROWSER_REPORT.md`](archive/QA_SUPABASE_ADMIN_BROWSER_REPORT.md) (uploads/CSV/WhatsApp não testados naquela sessão).

### 9.4 Produção Netlify

**URL:** https://loja-whats.netlify.app · **Smoke:** 2026-06-26 (Playwright headless)

| Variável | Status |
|----------|--------|
| `DATA_PROVIDER=supabase` | ✅ confirmado no build |
| `NEXT_PUBLIC_DATA_PROVIDER` | ✅ |
| `NEXT_PUBLIC_SUPABASE_URL` | ✅ |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | ✅ |
| `SUPABASE_SERVICE_ROLE_KEY` | ✅ (não exposta no client) |

| Fluxo | Status |
|-------|--------|
| Login admin (Supabase Auth) | ✅ PASS |
| Toggle mostrar/ocultar senha (`76f5431`) | ✅ PASS |
| Logout + proteção `/admin/settings` | ✅ PASS |
| Salvar settings | ✅ PASS |
| CRUD produto | ✅ PASS |
| Import CSV → vitrine | ✅ PASS |
| Upload logo → `/api/branding/favicon-32.png` 200 | ✅ PASS |
| WhatsApp `#TEMP-...` em produção | ✅ PASS |

**Pendente manual:** ~~settings persistem após **redeploy** Netlify~~ — **PASS** (2026-06-25)

| Teste persistência pós-redeploy | Status |
|---------------------------------|--------|
| Commit vazio `d6abcc9` dispara redeploy | ✅ |
| Settings (descrição) persistem após deploy | ✅ |
| Home `/` após redeploy | ✅ |
| `/products` após redeploy | ✅ |
| Favicon `/api/branding/favicon-32.png` | ✅ 200 |
| Login admin após redeploy | ✅ |

Evidência: `test-data/e2e/prod-persistence-report.json`

### 9.7 Fase 0 storefront — deploy validado (2026-06-26)

**Commit:** `25ef567d1bd4b5c64f90f10615c72b509ed7a18e`  
**Repo:** https://github.com/jeffersonaandrade/ecommerce-whatsapp.git  
**Produção:** https://loja-whats.netlify.app  
**Deploy Netlify:** ✅ PASS (automático pós-push)

#### Entregas Fase 0

- Categorias no header desktop (Camisas, Shorts, Meias, Jaquetas, Acessórios + Ver tudo)
- Chips horizontais mobile logo após hero
- Hero sem grid de produtos embutido
- Home sem newsletter “em breve” e sem `EditorialBanner`
- Seções Destaques / Veja também sem repetir produtos
- Filtro vitrine oculta resíduos QA (`isStorefrontTestResidue`)
- Botão admin **+ Novo Produto** com contraste legível

#### Smoke produção (Playwright headless)

| Rota / fluxo | Status |
|--------------|--------|
| `/` | ✅ PASS — chips/categorias, sem “Curadoria”, sem produtos QA |
| `/products` | ✅ PASS — filtros dinâmicos |
| `/products?category=Shorts` | ✅ PASS |
| `/admin/login` | ✅ PASS |
| Login admin | ✅ PASS |
| `/admin/products` — botão + Novo Produto legível | ✅ PASS |

Script auxiliar local (não versionado): `scripts/qa/smoke-f0-prod.mjs`

#### SQL Supabase — limpeza QA (reversível)

Executado via MCP Supabase (2026-06-26):

| id | name | status após UPDATE |
|----|------|-------------------|
| `7` | Camisa Premium QA | `draft` |
| `9` | QA-E2E Importado | `draft` |

Operação reversível: `UPDATE ... SET status = 'active'` se necessário.

### 9.5 Checklist final — deploy MVP

Ordem objetiva (sem novas features):

1. [x] Signup OFF no Supabase Dashboard
2. [x] Rotacionar `service_role` (local + Netlify)
3. [x] Configurar envs Supabase na Netlify + redeploy
4. [x] Smoke §9.4 em https://loja-whats.netlify.app
5. [x] Validar em produção: login, toggle senha, CRUD, CSV, uploads, WhatsApp
6. [ ] Onboarding 1º cliente (Sprint 3)
7. [x] Restaurar aparência padrão (admin `/admin/settings`) — preset versionado, preserva storeName/contatos, sem reset de catálogo
8. [x] Fase 0 storefront — navegação por categorias + home merchandising (`25ef567`)

#### Pendências reais (pós-Fase 0)

- [ ] Onboarding 1º cliente (Sprint 3) — **validação imagens amanhã** (56 migrados + 35 ambíguos)
- [ ] Corrigir associações erradas reportadas pelo cliente (regras manuais ou ajuste de matching)
- [ ] Publicar produtos aprovados (`draft` → `active`) após validação
- [ ] Reimportar CSV 91 produtos quando cliente confirmar catálogo
- [ ] Auditoria/reorganização pós-V1 — **Fases 1–3 concluídas** (Fases 4–6 pendentes)
- [ ] Avaliar versionar script smoke produção (genérico + `package.json`) — **não** commitar `smoke-f0-prod.mjs` ainda
- [ ] Manter signup público **OFF** no Supabase Dashboard
- [ ] Revisar rotação periódica de `service_role` (já rotacionada em go-live; repetir antes de 2º cliente se necessário)
- [ ] Sync `README.md` (métricas teste + comandos migração)
- [ ] `ENABLE_MIGRATION_TOOLS=true` só durante onboarding; desligar em produção estável

### 9.6 Sprint 4+ (fora do escopo do deploy)

Não bloqueiam go-live MVP — **adiar até 1º cliente em produção**:

- Banner Manager (múltiplos banners)
- Categorias CRUD v1.1 entregue; pendente: botão rápido “Ativar na loja” na listagem
- Menus administráveis
- Admin shell / histórico CSV / pedidos persistidos

---

### 9.8 Migração de imagens UnitSports (2026-06-26)

**Contexto:** catálogo importado com URLs mitiendanube; pasta local `test-data/images/` com arquivos exportados.

| Etapa | Resultado |
|-------|-----------|
| Dry-run (`migrate:images:dry-run`) | 91 produtos → **56 seguros**, **35 ambíguos**, 0 sem imagem |
| Upload piloto (10 produtos) | 36 imagens, 0 falhas técnicas — cliente reportou associações visuais incorretas |
| Upload restante (46 seguros) | 201 imagens, 0 falhas → **56** produtos com URLs Supabase Storage |
| Pendentes | **35** produtos ainda com URLs externas (match ambíguo — revisão manual) |

**Relatórios:** `test-data/reports/LOCAL_IMAGE_MIGRATION_DRY_RUN.md`, `LOCAL_IMAGE_MIGRATION_PILOT_UPLOAD.md`, `LOCAL_IMAGE_MIGRATION_REMAINING_UPLOAD.md`

**Próximo passo:** cliente valida produto a produto; corrigir no admin ou re-associar via Central de Mídia.

---

### 9.9 Performance — consultas Supabase (2026-06-28)

**Contexto:** catálogo UnitSports ~3.400 produtos; filtros da Central de Mídia e layout admin carregavam o catálogo inteiro por request.

**Migrations (aplicar em cada Supabase via MCP `apply_migration`):**

| Versão | Nome | RPCs / efeito |
|--------|------|----------------|
| `20260628230000` | `admin_query_optimizations` | `images_has_external`, `get_media_issue_count` — onboarding sem full scan |
| `20260628240000` | `sprint_a2_media_filters` | `get_media_status_counts`, `query_admin_products_page`, `count_products_by_category`, `count_products_for_category` |

**Status implantação UnitSports:** ambas aplicadas via MCP (2026-06-28).

**Documentação:** [`docs/PERFORMANCE_AUDIT.md`](PERFORMANCE_AUDIT.md) · [`docs/PROJECT_READINESS.md`](PROJECT_READINESS.md) · DDL em [`scripts/migration/supabase-migrations.sql`](../scripts/migration/supabase-migrations.sql) · [`docs/DATABASE_PLAN.md`](DATABASE_PLAN.md).

**Migration adicional (Sprint D — PLP categoria):** `20260629120000_sprint_c_storefront_category_query` — `query_storefront_products_page`, `product_matches_storefront_category`.

**Pós-auditoria (2026-06):** API carrinho por `?ids=`; import/export/upload mídia sem `getAll()` FULL; `next/image` + cache vitrine `revalidate=60`.

**Mudanças de código (resumo):**

- Admin: RPC counts no layout/dashboard/categorias; Central de Mídia com `fields: 'list'` e filtros `?media=`
- Repositório: `hasStock` e filtros mídia via SQL; `create`/`update` sem `fetchAllProducts`; bulk `.in()` em chunks
- Vitrine: home com `getStorefrontFeatured(LIMIT)`; PLP paginada; `/api/products` retorna `ProductCartLite` (sem `long_description`)
- **PDP inalterada:** `getProductBySlug` → `getBySlug` com `select('*')` — `long_description` continua no detalhe

**Smoke test recomendado antes do commit:** admin (produtos, mídia, categorias, dashboard) + loja (home, PLP, PDP, `/api/products`).

---

*Próxima revisão deste handoff: após validação cliente (imagens) ou onboarding 1º cliente concluído.*
