# QA Supabase Admin — Browser Report

**Projeto:** ecommerce-sports (ecommerce-whatsapp)  
**Ambiente:** http://localhost:3000  
**Data provider:** Supabase (`DATA_PROVIDER=supabase`)  
**Data:** 2026-06-25  
**Executor:** QA Browser (automação Cursor + validação manual parcial)

---

## Resultado geral

**APROVADO COM RESSALVAS**

Fluxos críticos de **auth**, **settings**, **CRUD produto** e **carrinho** passaram no browser. **CSV**, **uploads reais** (logo/hero/imagem) e **validação completa da mensagem WhatsApp** não puderam ser concluídos pela limitação de tooling (upload de arquivo / captura de `wa.me`).

**Não aprovado para deploy Netlify** até CSV e uploads serem testados manualmente pelo operador.

---

## Resumo por fluxo

| # | Fluxo | Status | Evidência |
|---|--------|--------|-----------|
| 0 | Pré-requisitos (`/products`, `/admin/login`) | **PASS** | Páginas 200 OK |
| 1 | Login / logout / proteção admin | **PASS** | Login Supabase → `/admin`; Admin/Sair visível; logout → `/admin/login`; `/admin/settings` deslogado → `/admin/login?next=...` |
| 2 | Settings persistentes | **PASS** (parcial) | Nome `QA-Loja Browser Teste`, cores `#2563eb`/`#dbeafe`, hero `QA Hero Linha 1/2`, WhatsApp `5511988776655` persistiram após reload; Home refletiu nome/hero. **Campo Sobre não alterado** (limitação de interação no form). |
| 3 | Upload logo + favicons/OG | **NÃO TESTADO** | Upload de arquivo não executado (input file bloqueado pela automação). Endpoints `/api/branding/*` retornaram **404** sem upload prévio. |
| 4 | Upload hero/banner | **NÃO TESTADO** | Mesmo bloqueio de upload de arquivo. |
| 5 | CRUD produto | **PASS** | Create → `/admin/products/8/edit?created=1`; listagem admin + PLP; Update nome/preço/estoque; Delete → 7 produtos; PLP sem item; PDP "Produto não encontrado". |
| 6 | Upload imagem produto | **PARCIAL** | **URL de imagem:** PASS. Botão "Upload preview" presente mas **upload real não testado**. |
| 7 | Importação CSV | **NÃO TESTADO** | Página `/admin/import` carrega; template link presente. `DOM.setFileInputFiles` **negado** pelo browser tooling — upload CSV não realizado. |
| 8 | Carrinho + WhatsApp | **PARCIAL** | Carrinho: `QA-Produto Editado`, M·Azul, R$ 139,99, subtotal/total OK. Botão "Finalizar via WhatsApp" clicável; **conteúdo da mensagem `#TEMP-...` não capturado** (abre app externo / `window.open` não inspecionável). |
| 9 | Regressão pública | **PASS** (parcial) | `/`, `/products`, `/sobre`, `/contato`, `/politica-de-trocas`, `/maintenance` → 200; rota inexistente → 404. **Mobile 375px não testado.** |
| 10 | Filesystem P1 | **PASS** | `storage/catalog.json`, `storage/store-settings.json`, `storage/branding/*` — **mtime inalterado** antes/depois dos testes. |

---

## Bugs encontrados

### P1

| ID | Descrição |
|----|-----------|
| P1-1 | **Assets branding 404** sem upload: `/api/branding/favicon-32.png` (e demais) retornam 404 em modo Supabase até logo ser enviada — esperado se nunca houve upload; validar após upload manual. |

### P2

| ID | Descrição |
|----|-----------|
| P2-1 | **WhatsApp:** impossível validar automaticamente se mensagem contém `#TEMP-YYYYMMDD-NNNN`, SKU, link PDP — requer teste manual ao clicar "Finalizar via WhatsApp". |

### P3

| ID | Descrição |
|----|-----------|
| P3-1 | **Hydration warning** no admin após delete (`app/admin/products/page.tsx`) — overlay Next.js visível; não bloqueia operação. |
| P3-2 | PDP de produto deletado retorna **HTTP 200** com UI "Produto não encontrado" (comportamento aceitável, mas ideal seria 404). |

---

## Fluxos não testados

| Fluxo | Motivo |
|-------|--------|
| Upload logo (Fluxo 3) | Automação não consegue anexar arquivo real no input |
| Upload hero (Fluxo 4) | Idem |
| Upload imagem produto via arquivo (Fluxo 6) | Idem |
| Import CSV completo (Fluxo 7) | CDP `DOM.setFileInputFiles` bloqueado |
| Mensagem WhatsApp completa (Fluxo 8) | Link abre fora do browser controlado |
| Mobile 375px (Fluxo 9) | Não executado nesta sessão |
| Campo Sobre em settings (Fluxo 2) | Stale refs / bloqueio em textarea durante automação |

---

## Supabase

| Item | Status |
|------|--------|
| Auth (email/senha) | **Usado** — login/logout OK |
| Postgres (settings, produtos) | **Usado** — persistência confirmada no browser |
| Storage (branding/produtos) | **Não validado** — uploads não testados |
| `service_role` no browser | **Não exposto** — HTML público sem secret |

---

## Filesystem

Com `DATA_PROVIDER=supabase`, **`storage/*` não foi modificado** durante os testes (timestamps idênticos ao baseline). Gravações foram para Supabase Postgres.

---

## Conclusão

1. **O admin consegue operar a loja pelo navegador?**  
   **Sim, parcialmente:** login, settings, create/update/delete produto e vitrine funcionam. Uploads e CSV ficaram pendentes.

2. **A importação CSV funciona pelo navegador?**  
   **Não verificado** nesta sessão — requer teste manual com `test-data/csv-test-valid.csv`.

3. **Upload de imagens funciona pelo navegador?**  
   **Não verificado** (logo/hero/arquivo). URL de imagem em produto **funciona**.

4. **O site está pronto para Netlify + Supabase?**  
   **Não ainda.** CRUD e settings OK; falta smoke de CSV, uploads Storage e validação WhatsApp manual.

5. **O que corrigir / completar antes do deploy?**

   - [ ] Teste manual: upload logo → confirmar `/api/branding/*` 200  
   - [ ] Teste manual: upload hero → Home  
   - [ ] Teste manual: import CSV browser  
   - [ ] Teste manual: mensagem WhatsApp completa com `#TEMP-...`  
   - [x] Segurança Admin P0 (`requireAdmin`, middleware, RLS) — commit `1eb4d43`
   - [ ] Reverter dados QA (`QA-Loja Browser Teste`, settings de teste) ou aplicar SQL de cleanup  
   - [ ] Rotacionar `service_role` se ainda não feito  

---

## Nota sobre fix Create

O bug anterior de **create silencioso** está **corrigido**: create retorna `{ ok, id }` e redireciona para `/admin/products/{id}/edit?created=1` (validado com produto `QA-Produto Completo` / id `8`).
