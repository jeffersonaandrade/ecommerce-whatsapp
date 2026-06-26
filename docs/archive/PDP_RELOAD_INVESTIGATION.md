# PDP Reload Investigation

**Data:** 2026-06-24  
**URL testada:** `/products/camisa-sao-paulo-2024`  
**Pergunta:** O reload (F5) na PDP deixa só o footer por bug real da app?

---

## Contexto

Relato do QA Browser V2: após F5 na PDP, a viewport mostrava apenas o footer. Code review prévio indicava que a página é Server Component síncrono (`app/products/[slug]/page.tsx`) — falha de hidratação no `ProductPurchasePanel` não esvaziaria o `<main>` inteiro.

---

## Protocolo executado

| Ambiente | Setup | 1ª visita | F5 reload | HTTP | Console / erros |
|----------|-------|-----------|-----------|------|-----------------|
| **A — dev** | `npm run dev` · `:3000` | ✅ | ✅ | `200` | Sem erros React/hidratação observados |
| **B — production** | `npm run build` + `npx next start -p 3003` | ✅ | ✅ | `200` | Sem overlay dev; SSR completo |
| **C — automação** | Cursor Browser QA · dev e prod | ✅ | ✅ | — | Snapshot + CDP pós-F5 OK |

### Checklist por ambiente

| Critério | A (dev) | B (prod) | C (auto) |
|----------|---------|----------|----------|
| `<main>` com título do produto | ✅ | ✅ | ✅ |
| Galeria visível | ✅ | ✅ | ✅ |
| Preço + promo | ✅ | ✅ | ✅ |
| Botão "Adicionar ao Carrinho" | ✅ | ✅ | ✅ |
| Footer presente mas **não sozinho** | ✅ | ✅ | ✅ |
| Network document `200` | ✅ | ✅ | — |
| Imagens Unsplash OK | ✅ | ✅ | — |

### Evidência técnica

**SSR (dev e prod):** resposta HTML inclui `<main>`, `<h1>Camisa São Paulo FC 2024</h1>`, galeria e botão "Adicionar ao Carrinho" no markup inicial — conteúdo não depende de fetch client-side para aparecer.

**Pós-F5 (automação, prod `:3003`):**

```json
{
  "h1": "Camisa São Paulo FC 2024",
  "mainEmpty": false,
  "hasCartBtn": true
}
```

**Code review:** único client boundary na PDP é `ProductPurchasePanel`; não há Suspense boundary, loop ou redirect que esvazie `<main>` no reload.

---

## Veredito

### `LIMITAÇÃO AUTOMAÇÃO`

O bug **não foi reproduzido** em dev, production-like (`next start`) nem na automação Cursor após F5. O relato QA V2 é compatível com:

1. **Timing de screenshot** — captura antes do paint completo ou durante transição de navegação.
2. **Overlay dev** (menos provável após fix `key={item.title}` no header) — badge "1 Issue" era warning Next.js, não componente da app.

**Ação:** encerrar assunto. Referenciar este doc em [`docs/UI_POLISH_PLAN.md`](UI_POLISH_PLAN.md) §7. **Nenhum fix de código** nesta sprint.

---

## Observações (fora de escopo)

- Badge "1 Issue" em `npm run dev`: indicador Next.js dev, não bug de produção.
- Fix de key duplicada no header já aplicado (`3640b10`).

---

## Referências

- [`app/products/[slug]/page.tsx`](../app/products/[slug]/page.tsx)
- [`docs/SPRINT_BUGFIX_QA_REPORT.md`](SPRINT_BUGFIX_QA_REPORT.md)
- [`docs/UI_POLISH_PLAN.md`](UI_POLISH_PLAN.md) §7
