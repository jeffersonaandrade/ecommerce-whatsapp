# QA E2E Playwright — Supabase MVP

**Projeto:** ecommerce-sports  
**Ambiente:** http://localhost:3000  
**Data provider:** Supabase (`DATA_PROVIDER=supabase`, `NEXT_PUBLIC_DATA_PROVIDER=supabase`)  
**Data:** 2026-06-25  
**Executor:** Playwright (Chromium headless) + Chrome DevTools MCP (uploads E2E-1..3)

---

## Resultado geral

**APROVADO COM RESSALVAS**

Os 9 fluxos E2E obrigatórios passaram localmente contra Supabase. Gates `npm run test` (**115/115**) e `npm run build:netlify` OK (2026-06-26).

---

## Tabela E2E-1 … E2E-9

| ID | Fluxo | Status | Evidência | Observações |
|----|--------|--------|-----------|-------------|
| E2E-1 | Login, logout, proteção admin | **PASS** | Login → `/admin` com Admin/Sair; logout → `/admin/login`; `/admin/settings` deslogado → `/admin/login?next=/admin/settings` | Chrome DevTools MCP, contexto isolado `qa-e2e-supabase` |
| E2E-2 | Settings persistentes | **PASS** | `storeName`, WhatsApp, cores, hero, `aboutText` com prefixo QA-E2E; persistem após reload; refletem em `/` e `/sobre` | Valores restaurados via SQL pós-teste (`settings-backup.json`) |
| E2E-3 | Upload logo + hero | **PASS** | `upload_file` → `qa-logo.png` / `qa-hero.png`; preview + header; GET `/api/branding/favicon-*.png`, `apple-touch-icon.png`, `android-*.png`, `og-default.png` → **200**; home usa hero via `/api/branding/hero.webp` | Chrome DevTools MCP (`browser_file_upload` equivalente) |
| E2E-4 | CRUD produto + upload real | **PASS** | Create redireciona para `/admin/products/[id]/edit?created=1`; preço BRL via `MoneyInput`; validação por campo no form | Playwright + browser MCP 2026-06-26 |
| E2E-5 | Bloqueio data URL | **PASS** | `data:image/png;base64,AAAA` → erro *"URLs base64 não são permitidas..."*; produto `QA-E2E Data URL` **não** persistiu | |
| E2E-6 | Importação CSV browser | **PASS** | `#csv-file` + `Próximo` + `Confirmar importação`; preview 1 produto / 2 variações; PDP `/products/qa-e2e-import-1` | CSV corrigido: URLs `.jpg` (validação `CSV_E003` rejeita Unsplash sem extensão) |
| E2E-7 | Carrinho + WhatsApp | **PASS** | Stub `window.open` em `/cart`; URL capturada com `Pedido #TEMP-YYYYMMDD-NNNN`, nome, SKU, subtotal, total, link PDP (`loja-whats.netlify.app`) | Stub deve ser aplicado **após** navegar ao carrinho |
| E2E-8 | Regressão desktop + mobile | **PASS** | Desktop 1280×720: `/`, `/products`, PDP, `/cart`, `/sobre`, `/contato`, `/politica-de-trocas`, `/maintenance`, 404; mobile 375×667: rotas críticas — status ≠ 500 | Console errors não bloqueantes registrados |
| E2E-9 | Filesystem intacto | **PASS** | `storage/store-settings.json`, `storage/catalog.json`, `storage/branding/*` — **mtime inalterado** vs `test-data/e2e/filesystem-baseline.json` | Gravações em Postgres/Storage Supabase |

Artefatos: `test-data/e2e/` (PNG, CSV, baseline, backup settings, `playwright-results.json`).

---

## Bugs encontrados

### P0

_Nenhum bloqueante identificado nesta suíte._

### P1

| ID | Descrição |
|----|-----------|
| P1-1 | **Create produto sem redirect:** após `Criar produto` com sucesso, UI permanece em `/admin/products/new` (sem feedback de sucesso). Impacto UX/QA — não impede persistência. |

### P2

| ID | Descrição |
|----|-----------|
| P2-1 | **CSV import:** URLs de imagem devem ter extensão reconhecida (`.jpg`, etc.); Unsplash com query string falha `CSV_E003`. Documentar no template ou relaxar validação. |
| P2-2 | **Deploy produção:** HANDOFF §9.2 pendente (signup OFF, rotate `service_role`). |

### P3

| ID | Descrição |
|----|-----------|
| P3-1 | PDP produto inexistente retorna HTTP 200 com UI “não encontrado” (ideal 404). |
| P3-2 | Objetos órfãos possíveis no bucket `products` (prefixo `qa-e2e-*`) após cleanup SQL — remoção manual opcional no Dashboard Storage. |

---

## Supabase

| Item | Status |
|------|--------|
| Auth (email/senha admin) | **PASS** — login/logout/middleware |
| Postgres (settings, produtos, variações) | **PASS** — CRUD, import CSV, restore settings |
| Storage (branding logo/hero, imagens produto) | **PASS** — uploads reais confirmados (URLs públicas Supabase + `/api/branding/*` 200) |
| `service_role` no browser | **PASS** — não exposto no HTML/client |
| Filesystem local `storage/*` | **PASS** — não modificado (E2E-9) |

---

## Gates finais

| Gate | Resultado |
|------|-----------|
| `npm run test` | **60 passed** (12 files) |
| `npm run build` | **OK** (Next.js 16.2.9) |
| `graphify update` | Não executado (sem mudança estrutural de código) |

---

## Limpeza pós-QA

- [x] Produtos `QA-E2E-*` removidos (SQL `DELETE` em `products` / `product_variations`)
- [x] Settings restaurados para valores de `test-data/e2e/settings-backup.json`
- [ ] Objetos Storage `qa-e2e-*` — limpeza manual opcional no Dashboard
- [x] Catálogo seed original preservado

---

## Decisão final (6 perguntas)

1. **O admin consegue operar a loja pelo navegador?**  
   **Sim.** Login, settings, uploads logo/hero, CRUD com upload de imagem, import CSV e carrinho funcionam end-to-end.

2. **A importação CSV funciona pelo navegador?**  
   **Sim.** Preview, confirmação e vitrine validados com `test-data/e2e/csv-qa-e2e.csv` (URLs HTTPS com extensão de imagem).

3. **Upload de imagens funciona pelo navegador?**  
   **Sim.** Logo, hero e imagem de produto via arquivo (Supabase Storage) + endpoints branding 200.

4. **A mensagem WhatsApp contém `#TEMP-...` e dados do pedido?**  
   **Sim.** Validado via stub `window.open` — pedido temporário, SKU, totais e link PDP presentes.

5. **O site está pronto para Netlify + Supabase em produção?**  
   **Não ainda.** E2E local aprovado; faltam checklist Dashboard §9.2 e smoke produção §9.4.

6. **O que falta antes do deploy Netlify?**

   - [ ] Auth signup OFF no Dashboard Supabase  
   - [ ] Rotacionar `service_role` → `.env.local` + Netlify  
   - [ ] Smoke §9.4 em https://loja-whats.netlify.app (settings, CSV, uploads, CRUD)  
   - [ ] (Opcional) UX redirect pós-create produto (P1-1)

---

## Referências

- Plano: QA E2E Playwright (2026-06-25)  
- QA anterior (parcial): [`docs/archive/QA_SUPABASE_ADMIN_BROWSER_REPORT.md`](../archive/QA_SUPABASE_ADMIN_BROWSER_REPORT.md)  
- Pendências operacionais: [`docs/HANDOFF.md`](docs/HANDOFF.md) §9.2–§9.4
