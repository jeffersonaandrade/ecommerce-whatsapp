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

## 8. Sprints relacionadas

| Sprint | Escopo |
|--------|--------|
| **Sprint Prep (concluída)** | `framer-motion`, skill ui-ux-pro-max, este doc — sem alterar UI |
| **Sprint Bugfix QA** (sugerida) | Imagem 404, swatch, Link+Button, Coleções |
| **Sprint Design System** (concluída) | [`DESIGN_SYSTEM.md`](DESIGN_SYSTEM.md) — documentação only |
| **Sprint UI Polish** (futura) | Redesign conforme DS §12 + seções 2–6 deste doc |

Roadmap funcional (CSV Fase 5) permanece independente; UI polish inicia após DS aprovado.

---

**Última atualização:** 2026-06-24 (Design System foundation)
