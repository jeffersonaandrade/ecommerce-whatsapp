# Visual QA — pós Landing Hero + Home editorial

**Data:** 2026-06-24  
**Escopo:** UI-7 → UI-12 (Visual Gap Closure)

---

## QA-1 — Após Landing Hero (UI-9)

| Critério | Resultado |
|----------|-----------|
| Headline sobre foto (mobile/desktop) | OK — overlay `from-ink/80`, `font-display` uppercase |
| CTA pill visível | OK — primary `bg-ink`; secondary outline claro sobre foto |
| Faixa favoritos conecta à vitrine | OK — 4 ProductCards abaixo da campanha |
| Sem gradiente decorativo multicolor | OK — overlay escuro único |
| Regressão links `/products` | OK — build + rotas estáticas |

**Veredito QA-1:** Evolução clara vs split hero UI-2 — **parece loja**, não só página.

---

## QA-2 — Após Home editorial + ProductCard (UI-11, UI-12)

| Critério | Resultado |
|----------|-----------|
| Home multi-seção (categorias, banner, destaques, mais vendidos) | OK |
| Profundidade de vitrine vs template 3 blocos | OK — 7 seções + footer |
| ProductCard editorial (1 CTA, preço `text-2xl`) | OK |
| Tipografia Inter + Barlow Condensed | OK — layout.tsx |
| Footer DS ink/mute | OK |
| PLP / PDP / Cart intactos | OK — testes 23/23, build OK |

**Veredito QA-2:** **Frontend comercial** — UI-10 micro-refinamentos **adiados** (spacing PLP/carrinho sugeridos não críticos pós Home).

---

## UI-10 condicional — decisão

| Item | Executar? | Motivo |
|------|-----------|--------|
| PLP `gap-8` | Não agora | Home já usa `gap-6/8`; PLP pode alinhar depois se QA manual pedir |
| Carrinho empty sugeridos | Não agora | Empty state UI-6 já editorial |
| Admin DS | Adiar P3 | Prioridade vitrine concluída |

---

## Próximo roadmap

```text
CSV Import (Fase 5)
  ↓
QA funcional CSV
  ↓
WhatsApp (Fase 6)
  ↓
Supabase (Fase 7)
```
