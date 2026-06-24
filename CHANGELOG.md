# Changelog

Formato baseado em entradas por fase/sessão. Não remover decisões ou versões anteriores.

## [Unreleased]

_(Fase 4 — Catálogo Admin em andamento)_

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
