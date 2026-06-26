# Sprint Bugfix QA — Relatório de entrega

**Data:** 2026-06-24  
**Objetivo:** Corrigir bugs reais do Browser QA — sem redesign, CSV ou refatoração ampla.

---

## Correções aplicadas

### P1 — Imagem quebrada (Seleção Brasileira Away)

- **Causa:** URL Unsplash `photo-1539571696357-5a69c006b310` retorna HTTP 404.
- **Fix:** Substituída por `photo-1612872087720-bb876e2e67d1` (validada HTTP 200).
- **Arquivos:** `data/mock-products.ts`, `storage/catalog.seed.json`
- **Runtime dev:** `storage/catalog.json` atualizado localmente (gitignored) para refletir imediatamente no `npm run dev`.

### P2 — Swatch branco invisível

- **Causa:** Cor `#FFFFFF` com borda cinza clara em fundo branco — interpretado erroneamente como “rating vazio” no QA.
- **Fix:** `colorSwatchBorderClass()` em `lib/colors.ts` — borda/ring reforçados para cores claras.
- **Arquivo:** `components/product/product-card.tsx`

### P2 — HTML inválido (`<Link><Button>` / `<a><Button>`)

- **Fix:** Export `getButtonClassName()` em `components/ui/button.tsx`; links de navegação usam `<Link className={...}>` com as mesmas classes visuais.
- **Arquivos alterados:**
  - `components/product/product-card.tsx`
  - `components/commerce/sports-hero.tsx`
  - `components/layout/header.tsx`
  - `components/cart/cart-content.tsx`
  - `components/cart/cart-nav-link.tsx`
  - `app/checkout/page.tsx`
  - `app/admin/products/page.tsx`
  - `app/admin/page.tsx` (NavCard)
  - `app/admin/import/page.tsx`

### P3 — CTA "Coleções" morto

- **Fix:** `<Link href="/products">` com mesmas classes do botão anterior.
- **Arquivo:** `components/commerce/sports-hero.tsx`

---

## Investigação — Renderer Freeze (sem correção nesta sprint)

| Pergunta | Resposta |
|----------|----------|
| Existe bug real de loop/congelamento? | **Não** — `cart-context` hidrata uma vez; handlers são síncronos simples. |
| Existe loop infinito React? | **Não** identificado no código. |
| Erro React / console? | **Sim (dev):** warning/erro no Header — `key={item.href}` duplicado (`#` para Sobre e Contato) em `components/layout/header.tsx:21`. |
| Erro Network? | **Não** no fluxo carrinho; imagem 404 era asset Unsplash (corrigida). |
| Limitação da automação Browser? | **Sim** — overlay Next.js Dev Tools (“1 Issue”) intercepta cliques; CDP `captureScreenshot` após navegação gera timeout. |

### Evidência manual (Cursor Browser, localhost:3000)

- `/products` carrega normalmente.
- PDP `/products/camisa-sao-paulo-2024` carrega.
- **Adicionar ao Carrinho** → feedback “Adicionado!”, badge “🛒 Carrinho 1” — **sem congelamento**.
- Clique em “Escolher opções” **bloqueado** pelo overlay de issues do Next.js dev — não por freeze da app.

### Recomendação pós-sprint (fora do escopo desta entrega)

- Corrigir `key` duplicado no Header (`key={item.title}` ou hrefs únicos) — elimina badge “1 Issue” em dev.
- Revalidação Browser QA pelo Claude após deploy local.

---

## O que NÃO foi alterado (conforme escopo)

- Hero visual (gradientes, blobs, layout)
- ProductCard layout/spacing além do swatch
- Tipografia, paleta global, radius, shadows
- Motion / framer-motion
- CSV, arquitetura, admin forms

---

## Validação

```text
npm run test  → 23 passed
npm run build → OK
```

---

## Critérios de aceite

| Critério | Status |
|----------|--------|
| Imagem quebrada resolvida | OK |
| Swatch branco visível | OK |
| HTML válido (sem Link+Button) | OK |
| CTA Coleções funcional | OK |
| Build OK | OK |
| Testes OK | OK |
| Sem alteração visual estrutural | OK |
| Sem feature nova | OK |

---

**Próximo passo sugerido:** Claude Browser QA → `DESIGN_SYSTEM.md` → Sprint UI Polish.
