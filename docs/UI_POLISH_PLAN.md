# UI Polish Plan — Sports Store

Plano da **sprint futura** de melhoria visual. Este documento não autoriza alterações imediatas — apenas define direção, escopo e triagem de QA.

**Referências:**

- **[`docs/DESIGN_SYSTEM.md`](DESIGN_SYSTEM.md)** — **fonte única de tokens**; implementar conforme DS §3–§11
- [`DESIGN-nike.md`](../DESIGN-nike.md) — análise de padrões (não cópia de marca)
- [`.cursor/skills/ui-ux-pro-max/SKILL.md`](../.cursor/skills/ui-ux-pro-max/SKILL.md) — checklists UX/indústria
- [`docs/ARCHITECTURE.md`](ARCHITECTURE.md) — não quebrar camadas de dados
- [`docs/PDP_RELOAD_INVESTIGATION.md`](PDP_RELOAD_INVESTIGATION.md) — reload PDP descartado (limitação automação)

---

## 1. Diagnóstico

O front está **funcional** (vitrine, PDP, carrinho, admin Fase 4), mas com aparência **genérica / template IA**:

| Área | Arquivo | Sintoma atual |
|------|---------|---------------|
| Hero | `components/commerce/sports-hero.tsx` | Gradientes decorativos, blobs blur, `shadow-lg` |
| ProductCard | `components/product/product-card.tsx` | `rounded-lg`, hover scale, badge vermelho decorativo |
| Button | `components/ui/button.tsx` | `rounded-lg` (não pill) |
| PLP | `app/products/page.tsx`, `app/page.tsx` | Grid funcional, sem ritmo editorial |
| Header | `components/layout/header.tsx` | Chrome SaaS padrão |

Direção desejada: **e-commerce esportivo premium**, photography-first, editorial, mobile-first — inspirado nos **princípios** de `DESIGN-nike.md`, sem copiar identidade Nike.

---

## 2. Princípios visuais (extraídos de DESIGN-nike.md)

> **Implementação:** tokens e specs detalhados em [`DESIGN_SYSTEM.md`](DESIGN_SYSTEM.md) §2–§8. Não duplicar valores aqui — consultar o DS.

Traduzidos para a Sports Store:

- **Photography-first:** a foto do produto é o card; chrome neutro em volta.
- **Layout editorial esportivo:** blocos empilhados como catálogo impresso, não landing SaaS.
- **Paleta base:** preto `#111`, branco, cinza superfície `#f5f5f5`, divisores hairline discretos.
- **Botões pill:** `rounded-full`; primário preto, secundário cinza claro.
- **Cards flat:** sem sombra pesada, raio mínimo ou zero, imagem 1:1 sobre `#f5f5f5`.
- **Cor semântica restrita:** vermelho só para promo/preço; verde para estoque/sucesso.
- **Escala 8px** e ritmo de seção (~48px).
- **Mobile-first.**

---

## 3. O que vamos adotar

- Tipografia open-source (ex.: Inter + display condensada para headlines — **não** Futura/Nike).
- Chips/pills para filtros e CTAs.
- PLP/PDP com hierarquia tipográfica forte e densidade controlada.
- Imagens full-bleed no hero editorial (quando houver campanha).
- `framer-motion` para micro-interações pontuais (ver regras abaixo).

---

## 4. O que NÃO vamos copiar

- Logos, nomes, campanhas ou layouts exatos da Nike.
- Fontes proprietárias (Nike Futura ND, Helvetica Now licensed).
- Paleta de acentos editoriais Nike (pink/teal/purple chips).
- Páginas membership / Jordan Golf como template literal.
- Motion exagerado estilo landing animada ou parallax decorativo.

---

## 5. Componentes a revisar (sprint futura)

Implementar conforme [`DESIGN_SYSTEM.md` §9](DESIGN_SYSTEM.md#9-components-spec).

| Prioridade | Alvo | Arquivos |
|------------|------|----------|
| P0 | Header | `components/layout/header.tsx`, `components/layout/footer.tsx` |
| P0 | Hero | `components/commerce/sports-hero.tsx` |
| P0 | ProductCard | `components/product/product-card.tsx` |
| P1 | ProductGrid | `app/page.tsx`, `app/products/page.tsx` |
| P1 | PDP | `app/products/[slug]/page.tsx`, `components/product/product-purchase-panel.tsx` |
| P2 | Cart | `components/cart/cart-content.tsx`, `app/cart/page.tsx` |
| P3 | Admin | `app/admin/**`, `components/admin/**` — polish leve, utilitário |

Tokens compartilhados: `components/ui/button.tsx`, `components/ui/badge.tsx`.

---

## 6. Regras de motion (framer-motion)

Conforme [`DESIGN_SYSTEM.md` §10](DESIGN_SYSTEM.md#10-motion).

- Animações **discretas** (150–250ms, ease padrão).
- Sempre respeitar `prefers-reduced-motion` via `useReducedMotion()`.
- Animar só **ações**: feedback add-to-cart, drawer/modal, hover sutil em cards.
- **Não** animar hero, títulos ou listas longas por decoração.
- Evitar parallax, stagger em grids grandes, bounce/spring exagerado.
- Server Components permanecem estáticos; wrappers `'use client'` mínimos onde motion for necessário.

---

## 7. QA Browser Report — triagem (2026-06-24)

Investigação no código (não só automação). Ver [`QA_REPORT.md`](../QA_REPORT.md) e relatório browser do Claude.

| # | Achado | Veredito | Ação |
|---|--------|----------|------|
| 1 | Renderer freeze em CTAs | Falso positivo provável | Timeouts de `Page.captureScreenshot` (CDP) após navegação; validar manualmente em Chrome |
| 2 | Imagem quebrada (Seleção Away) | **Bug real P1** | URL Unsplash `photo-1539571696357-5a69c006b310` → HTTP 404; corrigir em sprint bugfix |
| 3 | Badge "1 Issue" global | Falso positivo | Indicador Next.js dev (Turbopack/warning), não componente da app |
| 4 | Botão hero sem texto | Não confirmado | Código mostra "Explorar Produtos" (`text-black`); verificar manualmente |
| 5 | "Avaliação" círculo vazio | Bug UX P2 | Swatch cor "Branco" (`#FFF`) invisível em fundo claro — não é rating |
| 6 | Duplicação /admin/categories | Falso positivo | Uma tabela estática; artefato de viewport/automação |
| 7 | `/admin/products/create` 404 | Falso positivo | Rota correta: `/admin/products/new` |
| 8 | Categorias sem CRUD | By design | Fase 4 |
| 9 | Configurações não interativas | By design | `fieldset disabled` até Fase 6 |
| — | `<Link><Button>` | Anti-pattern P2 | HTML inválido; corrigir com `asChild` ou Link estilizado |
| — | "Coleções" sem ação | Gap UX P3 | `<button>` dead no hero |
| — | Reload PDP "só footer" | **Limitação automação** | Ver [`PDP_RELOAD_INVESTIGATION.md`](PDP_RELOAD_INVESTIGATION.md) — não reproduzido em dev/prod |

### Bugs a resolver antes/durante polish

1. **P1:** Substituir URL Unsplash quebrada (produto id 2 + seed).
2. **P2:** Swatch branco visível (borda interna ou ícone).
3. **P2:** Eliminar `<Link>` envolvendo `<Button>` nos CTAs principais.
4. **P3:** Dar destino ao botão "Coleções" ou remover.

### Falsos positivos conhecidos

- Congelamento reportado pela automação browser (CDP).
- Badge "1 Issue" em `npm run dev`.
- Rota `/admin/products/create` (não existe no projeto).
- Duplicação visual em screenshots de automação.

---

## 8. Regra de justificativa (obrigatória)

Antes de alterar **qualquer** componente visual, o assistente deve documentar cada mudança com referência ao [`DESIGN_SYSTEM.md`](DESIGN_SYSTEM.md):

```text
Border radius
  ANTES: rounded-lg
  DEPOIS: rounded-full
  Motivo: DESIGN_SYSTEM.md §9.1 Button — CTAs pill

Shadow
  ANTES: shadow-xl
  DEPOIS: border hairline + shadow-sm (se aplicável)
  Motivo: DESIGN_SYSTEM.md §8 — cards flat; exceção só sticky cart
```

**Proibido:** mudanças visuais sem citação de seção do DS. Ver também `.cursor/rules/design-system.mdc`.

---

## 9. Sprints de implementação (ordem revisada)

> **Decisão (2026-06-24):** não misturar tokens + Header na mesma sprint. Header tem efeito cascata (nav, carrinho, admin, mobile, sticky) — isolar em sprint própria **após** primitivos prontos.

Cada sprint = **escopo mínimo** + QA rápido + **1 commit local**. Não alterar páginas fora do escopo da sprint.

```text
UI-1A  Design Foundation (tokens + primitivos)     → QA → commit
UI-1B  Header                                      → QA → commit
UI-2   Hero                                        → QA → commit
UI-3   ProductCard                                 → QA → commit
UI-4   PLP (grids home + /products)                → QA → commit
UI-5   PDP (+ product-purchase-panel)              → QA → commit
UI-6   Carrinho                                    → QA → commit
UI-7   Footer                                      → QA → commit
```

### UI-1A — Design Foundation (próxima sprint)

**Escopo permitido:**

| Item | Arquivos |
|------|----------|
| Tokens CSS | `app/globals.css` (`@theme`) |
| Button | `components/ui/button.tsx` |
| Badge | `components/ui/badge.tsx` |
| Input | `components/ui/input.tsx` (criar) |
| Label | `components/ui/label.tsx` (criar) |
| Separator | `components/ui/separator.tsx` (criar) |

**Fora de escopo UI-1A:**

- ❌ Header, Footer, Hero, ProductCard
- ❌ Qualquer página (`app/**`)
- ❌ Layout (`components/layout/**`)
- ❌ Comportamento (nav, sticky, links, carrinho)

**Critério de aceite:** build + test OK; páginas visualmente **inalteradas** (primitivos existem mas telas ainda usam classes antigas até sprints posteriores).

### UI-1B — Header

**Escopo:** apenas `components/layout/header.tsx` — consome tokens e primitivos de UI-1A.

**Fora de escopo:** Footer, Hero, páginas.

### UI-2 — Hero

**Escopo:** `components/commerce/sports-hero.tsx`

### UI-3 — ProductCard

**Escopo:** `components/product/product-card.tsx`

### UI-4 — PLP

**Escopo:** `app/page.tsx`, `app/products/page.tsx` (grids e ritmo editorial)

### UI-5 — PDP

**Escopo:** `app/products/[slug]/page.tsx`, `components/product/product-purchase-panel.tsx`

### UI-6 — Carrinho

**Escopo:** `components/cart/cart-content.tsx`, `app/cart/page.tsx`

### UI-7 — Footer

**Escopo:** `components/layout/footer.tsx`

---

## 10. Sprints relacionadas (histórico)

| Sprint | Status |
|--------|--------|
| **Sprint Prep** | ✅ `framer-motion`, skill ui-ux-pro-max |
| **Sprint Bugfix QA** | ✅ Imagem 404, swatch, Link+Button, Coleções |
| **Sprint Design System** | ✅ [`DESIGN_SYSTEM.md`](DESIGN_SYSTEM.md) |
| **UI-1A → UI-6** | ✅ Foundation, Header, Hero v1, Card, PLP, PDP, Cart |
| **UI-7 → UI-12** | ✅ Footer, tipografia, Landing Hero, Home editorial, Card editorial |
| **UI-10** | ⏸ Adiado pós QA — ver [`VISUAL_QA_POST_LANDING.md`](VISUAL_QA_POST_LANDING.md) |
| **Próximo** | CSV Fase 5 (após vitrine aprovada) |

Roadmap funcional: CSV → WhatsApp → Supabase (após frontend comercial).

---

**Última atualização:** 2026-06-24 (Visual Gap Closure UI-7–UI-12)
