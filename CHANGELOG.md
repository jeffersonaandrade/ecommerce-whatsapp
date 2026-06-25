# Changelog

Formato baseado em entradas por fase/sessão. Não remover decisões ou versões anteriores.

## [Unreleased]

_(Fase 7 — Supabase / Auth)_

---

## [1.0.1-demo] — 2026-06-25 — Demo cliente (login visual + Netlify)

### Resumo

Login demonstrativo com fluxo **Entrar** no header, flag visual `demo-admin-session`, fallback de branding, prebuild Netlify e mapa Graphify atualizado. Sem auth real nem proteção de rotas.

### Entregas

- `AdminAccessButton` — Entrar / Admin + Sair (hydration-safe)
- `/admin/login` — credenciais demo, redirect para `/admin`
- `resolveExistingBrandingPath` — evita logo/hero quebrados quando arquivo ausente
- `deploy/netlify/` + `build:netlify` + `netlify.toml`
- Docs: login demo, deploy Netlify, limitações serverless

### Comandos

- `npm run test` — 48 passed
- `npm run build:netlify` — OK
- `graphify update .` — OK

### Tag

- `v1.0.1-demo` (local)

---

## [1.0.0-demo] — 2026-06-24 — Demo Polish (Template Freeze)

### Resumo

Polish pré-demo: cores configuráveis, conteúdo da loja (hero + institucional), páginas de erro, login admin com toast placeholder. Sem page builder — layout fixo, conteúdo dinâmico.

### Entregas

- `StoreSettings`: `primaryColor`, `secondaryColor`, campos hero e institucionais
- Admin `/admin/settings` — seções Cores e Conteúdo da Loja + upload banner hero
- Páginas `/sobre`, `/contato`, `/politica-de-trocas`
- `StatusPage` — 404, 500, `/maintenance`
- `/admin/login` — toast *"Autenticação será disponibilizada na próxima versão."*
- Docs: categorias derivadas (CRUD futuro), anti–page-builder em `DOMAIN_MODEL.md`

### Comandos

- `npm run test` — 39 passed
- `npm run build` — OK
- `graphify update .` — OK

### Tag

- `v1.0.0-demo` (local, após commits)

---

## Sprint 0 — Cleanup — 2026-06-24

Encerramento administrativo da sprint anterior (Fases 3–4). Sem alteração de código de produto ou UI.

### Arquivos alterados

- `package.json` — versão alinhada a `0.4.0` (CHANGELOG)
- `DEV_NOTES.md` — estado atual sincronizado, registro Sprint 0
- `CHANGELOG.md` — esta entrada
- `GRAPHIFY_MAP.md` — árvore e métricas atualizadas
- `graphify-out/GRAPH_REPORT.md`, `graphify-out/graph.json`, `graphify-out/graph.html` — regenerados

### Resumo

- Versão do projeto corrigida (`0.1.0` → `0.4.0`).
- Documentação de desenvolvimento alinhada ao estado real pós Fase 4.
- Mapa Graphify atualizado (`lib/catalog/*`, rotas admin, API `/api/products`).

### Comandos executados

- `npm run build`
- `npm run test`
- `graphify update .`

### Resultado build/test

- Build: OK
- Testes: 23 passed (vitest)

### Graphify

- Atualizado: **239 nós · 512 arestas · 14 comunidades** (commit `7c6521d`)

---

## [0.4.0] — 2026-06-24 — Fase 4: Catálogo Admin

### Arquivos criados

- `lib/catalog/product-repository.ts` — interface `ProductRepository`
- `lib/catalog/json-product-repository.ts` — persistência JSON (server-only)
- `lib/catalog/catalog-storage.ts` — read/write `storage/catalog.json`
- `lib/catalog/client-catalog-cache.ts` — cache para carrinho no cliente
- `lib/catalog/product-utils.ts` — slug, validação, categorias derivadas
- `lib/catalog/product-utils.test.ts` — testes de utilitários (9 casos)
- `lib/catalog/actions.ts` — Server Actions create/update/delete
- `lib/products-client.ts` — `getProductById` no browser
- `app/api/products/route.ts` — API para hidratar catálogo no carrinho
- `app/admin/products/[id]/edit/page.tsx` — edição de produto
- `components/admin/product-form.tsx` — formulário criar/editar
- `components/admin/image-gallery-field.tsx` — galeria URL + upload preview
- `components/admin/delete-product-button.tsx`
- `storage/.gitkeep`
- `storage/catalog.seed.json` — seed inicial (mock migrado)

### Arquivos alterados

- `lib/products.ts` — fachada server-only via repositório JSON
- `lib/cart-utils.ts`, `lib/cart-utils.test.ts` — `products-client`
- `context/cart-context.tsx` — hidrata catálogo via `/api/products`
- `app/admin/products/page.tsx` — lista todos status, editar/deletar
- `app/admin/products/new/page.tsx` — formulário funcional
- `app/admin/categories/page.tsx` — listagem derivada do catálogo
- `app/admin/page.tsx` — contadores total vs ativos
- `.gitignore` — `storage/catalog.json`

### Resumo

- `ProductRepository` + `JsonProductRepository` → `storage/catalog.json` (gitignored).
- CRUD admin: criar, editar, deletar; galeria 1–5 (URL + data URL em dev); variações com SKU único.
- Status `draft` | `active` | `unavailable` — vitrine só `active`; admin vê todos.
- Categorias derivadas do catálogo (sem CRUD separado na v4.0).

### Rotas impactadas

- `/admin/products`, `/admin/products/new`, `/admin/products/[id]/edit`
- `/admin/categories`, `/admin` (stats)
- `/api/products`
- `/`, `/products`, `/products/[slug]` (leitura via JSON)

### Comandos executados

- `npm run build`
- `npm run test`

### Resultado build/test

- Build: OK
- Testes: 23 passed (vitest)

### Graphify

- Não atualizado — sugerir atualização (`lib/catalog/*`, rotas admin) com autorização do usuário.

---

## [0.3.0] — 2026-06-24 — Fase 3: Domínio enxuto

### Arquivos criados

- `docs/DOMAIN_MODEL.md`
- `docs/ARCHITECTURE.md`
- `docs/MODULE_ROADMAP.md`
- `data/mock-purchase-intent.ts`
- `app/order-intent/demo/page.tsx`
- `app/admin/settings/page.tsx`
- `app/admin/products/new/page.tsx`
- `app/admin/categories/page.tsx`
- `CHANGELOG.md`

### Arquivos alterados

- `app/admin/page.tsx` — IA Produtos (Lista / Novo / Importar) + Loja
- `components/cart/cart-content.tsx` — botão "Finalizar Pedido"
- `app/checkout/page.tsx` — copy finalização (sem checkout online)
- `PROJECT_SCOPE.md`
- `ROADMAP.md`
- `DEV_NOTES.md`

### Resumo

- ADRs documentadas: PurchaseIntent ≠ Order na V1; catálogo manual + CSV; ProductImage `UPLOAD|URL`; WhatsApp como canal confiável na V1.
- Documentação núcleo (domínio, arquitetura, roadmap comercial fases 4–9).
- Admin skeleton, protótipo `/order-intent/demo` para UX do atendente.
- `DATABASE_PLAN` adiado para Fase 7.

### Rotas impactadas

- `/admin` (dashboard reorganizado)
- `/admin/settings`
- `/admin/products/new`
- `/admin/categories`
- `/order-intent/demo`
- `/cart` (copy)
- `/checkout` (copy)

### Comandos executados

- `npm run build`
- `npm run test`

### Resultado build/test

- Build: OK
- Testes: 14 passed (vitest)

### Graphify

- Não atualizado — aguardar autorização do usuário.
