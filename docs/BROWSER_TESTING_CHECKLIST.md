# Browser Testing Checklist

Tudo que foi implementado e precisa ser validado manualmente no browser.  
Executar com `npm run build && npx next start` (ou `npm run dev` para iteração rápida).  
`DATA_PROVIDER=json` para testes locais; `DATA_PROVIDER=supabase` exige migration aplicada (ver `SPRINT3_STATUS.md`).

---

## Como usar

- ✅ = passou  
- ❌ = falhou (anotar o comportamento observado)  
- ⏭️ = pulado (justificar)

Ambiente recomendado: Chrome DevTools aberto na aba Network (para confirmar uploads) e Console (para erros JS).

### Validação local 2026-06-26 (`localhost:3003`, `DATA_PROVIDER=supabase`)

| Área | Resultado | Notas |
|------|-----------|-------|
| Regressão R.1, R.6, R.15 | ✅ | Home, admin dashboard, cards Banners/Conteúdo |
| Sprint 1 — produtos (lista/filtros) | ✅ | 10 produtos, tabs status, busca, categoria |
| Sprint 1 — categorias (lista) | ✅ | 6 categorias, tabs visíveis |
| Sprint 2 — import (UI) | ✅ | Wizard carrega, policy draft visível |
| Sprint 2 — import (fluxo CSV) | ⏭️ | Upload de arquivo não automatizado via MCP browser |
| Sprint 3 — categorias (upload imagem) | ⏭️ | Idem — requer file picker manual |
| Sprint 3 — banners new (DT-003) | ✅ | Botão "Criar slide" desabilitado sem desktop; seção obrigatória visível |
| Sprint 3 — carrossel vitrine | ✅ | 0 slides → SportsHero; benefícios na home |
| Sprint 4A — benefícios admin | ✅ | 3 seeds, reorder/toggle/edit links, cabeçalho eyebrow/título |

---

## Sprint 1 — Admin como Sistema (filtros · busca · paginação · ações em lote)

### Produtos — filtros e busca

| # | Ação | Resultado esperado | Status |
|---|------|--------------------|--------|
| 1.1 | Abrir `/admin/products` | Tabela com max 25 produtos, indicadores de status com contadores | ✅ |
| 1.2 | Digitar "camisa" no campo de busca | Tabela filtra por nome em tempo real (debounce ~300ms), URL muda para `?q=camisa` | |
| 1.3 | Clicar na tab "Rascunho (N)" | URL muda para `?status=draft`, tabela mostra só rascunhos | |
| 1.4 | Clicar na tab "Todos" | Filtro de status some da URL, todos os produtos voltam | |
| 1.5 | Selecionar uma categoria no filtro | URL inclui `?category=futebol` (ou slug correspondente), tabela filtra | |
| 1.6 | Combinar busca + status + categoria | URL tem `?q=...&status=...&category=...`, tabela filtra pelos três simultaneamente | |
| 1.7 | Mudar tamanho de página para 50 | URL inclui `?size=50`, tabela exibe até 50 produtos | |
| 1.8 | Clicar "Próxima →" na paginação | URL inclui `?page=2`, tabela muda de página; filtros preservados na URL | |
| 1.9 | Recarregar a página com filtros na URL | Filtros são restaurados da URL; tabela filtra corretamente sem interação | |

### Produtos — ações em lote

| # | Ação | Resultado esperado | Status |
|---|------|--------------------|--------|
| 1.10 | Clicar no checkbox de 1 produto | Barra sticky aparece na parte inferior: "1 produto(s) selecionado(s)" | |
| 1.11 | Marcar checkbox do header | Todos os produtos da página atual selecionados; contagem atualiza | |
| 1.12 | Com produtos selecionados, clicar "Ativar" | Produtos mudam para status `active`; barra desaparece; tabela atualiza | |
| 1.13 | Selecionar produtos e clicar "Desativar" | Produtos mudam para `draft`; tabela atualiza | |
| 1.14 | Selecionar produtos e clicar "Excluir" | Caixa de confirmação do browser aparece; ao confirmar, produtos removidos | |
| 1.15 | Trocar de página com seleção ativa | Seleção é limpa ao mudar de página | |

### Categorias — filtros

| # | Ação | Resultado esperado | Status |
|---|------|--------------------|--------|
| 1.16 | Abrir `/admin/categories` | Lista de categorias com indicadores "Visíveis / Ocultas" | ✅ |
| 1.17 | Digitar na busca de categorias | Lista filtra por nome | |
| 1.18 | Clicar na tab "Ocultas" | Mostra só categorias com `visible: false` | |

---

## Sprint 2 — Importação Profissional (CSV com status · batchId · redirect)

### Fluxo de importação

| # | Ação | Resultado esperado | Status |
|---|------|--------------------|--------|
| 2.1 | Abrir `/admin/import`, fazer upload de CSV **sem** coluna `status` com policy `draft` | Preview mostra N novos + breakdown "N como Rascunho" | ⏭️ upload manual |
| 2.2 | Confirmar importação | Redirect automático para `/admin/products?batch=<uuid>` | |
| 2.3 | Na página de produtos com `?batch=X` | Banner "Mostrando produtos da importação" visível; tabela mostra apenas os produtos do lote | |
| 2.4 | `BulkActionsBar` visível na página de batch | Selecionar todos → "Ativar" ativa o lote inteiro | |
| 2.5 | Importar CSV **com** coluna `status` com valores `active`/`draft` | Produtos respeitam status da coluna CSV; preview mostra breakdown correto | |
| 2.6 | Importar CSV com valor de status inválido (ex: `publicado`) | Warning aparece no preview para a linha; produto usa policy como fallback | |
| 2.7 | Ir em `/admin/settings` → seção Importação → mudar policy para "Ativar automaticamente" | Salvar OK; próxima importação sem coluna status → produtos entram como `active` | |

---

## Sprint 3 — Mídia e Storefront Visual

### Parte B — Imagem de categoria

| # | Ação | Resultado esperado | Status |
|---|------|--------------------|--------|
| 3.1 | Abrir `/admin/categories` → editar uma categoria | Seção "Imagem" visível abaixo do formulário principal (apenas em modo edição) | |
| 3.2 | Selecionar arquivo PNG/JPG/WebP ≤ 2 MB e clicar "Enviar imagem" | Loading; mensagem de sucesso; preview da imagem aparece sem recarregar página | |
| 3.3 | Tentar enviar arquivo > 2 MB | Mensagem de erro "Imagem deve ter no máximo 2 MB" | |
| 3.4 | Tentar enviar arquivo com extensão .pdf ou .gif | Mensagem de erro "Formato aceito: PNG, JPG ou WebP" | |
| 3.5 | Com imagem salva, clicar "Remover imagem" | Preview desaparece; mensagem de sucesso | |
| 3.6 | Abrir a vitrine `/` com pelo menos 1 categoria com imagem | Seção de categorias exibe **cards visuais** com imagem de fundo + nome sobreposto com gradiente | |
| 3.7 | Hover em um card de categoria | Imagem faz leve zoom (`scale-105`), cursor pointer | |
| 3.8 | Clicar em um card de categoria | Navega para `/products?category=<slug>` | |
| 3.9 | Remover todas as imagens de categoria | Seção de categorias na home volta ao **grid de botões** (fallback) | |
| 3.10 | Categoria sem imagem quando há outras com imagem | Card exibe fundo neutro (sem quebra de layout) + nome | |

### Parte C — Banner carrossel (admin)

| # | Ação | Resultado esperado | Status |
|---|------|--------------------|--------|
| 3.11 | Abrir `/admin/banners` | Página lista slides (vazia inicialmente); botão "+ Novo slide" | ✅ |
| 3.12 | Clicar "+ Novo slide" → formulário `/admin/banners/new` | Campos metadata + **imagem desktop obrigatória**; botão criar desabilitado sem arquivo | ✅ |
| 3.13 | Preencher só "Texto do botão" sem "Link do botão" e salvar | Erro de validação: "Preencha título e link do CTA juntos ou deixe ambos vazios" | ⏭️ |
| 3.14 | Selecionar imagem desktop + salvar | Slide criado com `desktopImagePath`; redirect para `/admin/banners/[id]` | ⏭️ upload manual |
| 3.15 | Clicar "Editar" em um slide | Página `/admin/banners/[id]` com formulário preenchido + seção de imagens | |
| 3.16 | Fazer upload de imagem desktop (PNG/JPG/WebP ≤ 5 MB) | Preview da imagem aparece; mensagem "Imagem desktop enviada" | |
| 3.17 | Fazer upload de imagem mobile (opcional) | Preview aparece; botão "Remover" aparece ao lado do "Enviar mobile" | |
| 3.18 | Clicar "Remover" na imagem mobile | Preview desaparece; mensagem de sucesso | |
| 3.19 | Tentar enviar imagem de banner > 5 MB | Erro "Imagem deve ter no máximo 5 MB" | |
| 3.20 | Alterar título/subtítulo/ordem/ativo e clicar "Salvar" | Dados atualizados; sem redirect (permanece na tela de edição) | |
| 3.21 | Clicar "Excluir slide" (primeiro clique) | Botão muda para vermelho "Confirmar exclusão" (proteção contra clique acidental) | |
| 3.22 | Clicar "Confirmar exclusão" | Slide excluído; redirect para `/admin/banners` | |

### Parte C — Reordenação e toggle ativo

| # | Ação | Resultado esperado | Status |
|---|------|--------------------|--------|
| 3.23 | Na lista `/admin/banners` com 2+ slides, clicar ▲ em um slide | `sort_order` do slide diminui ~15; lista recarrega com nova ordem | |
| 3.24 | Clicar ▼ em um slide | `sort_order` aumenta ~15; lista recarrega | |
| 3.25 | Clicar no toggle de um slide ativo | Slide passa a `active: false`; toggle muda para cinza | |
| 3.26 | Clicar no toggle de um slide inativo | Slide passa a `active: true`; toggle muda para verde | |

### Parte C — Carrossel na vitrine

| # | Ação | Resultado esperado | Status |
|---|------|--------------------|--------|
| 3.27 | Com 0 slides ativos, abrir `/` | `<SportsHero>` exibido normalmente (sem carrossel) | ✅ |
| 3.28 | Ativar 1 slide com imagem desktop, abrir `/` | `<BannerCarousel>` substitui o `<SportsHero>`; sem setas ou dots (slide único) | |
| 3.29 | Ativar 2+ slides, abrir `/` | Carrossel com setas prev/next e dots na parte inferior | |
| 3.30 | Aguardar 5 segundos sem interação | Slide avança automaticamente para o próximo | |
| 3.31 | Passar mouse sobre o carrossel | Auto-play pausa (não avança) | |
| 3.32 | Tirar mouse do carrossel | Auto-play retoma após ~0 s (comportamento imediato no `onMouseLeave`) | |
| 3.33 | Clicar em seta ou dot para mudar slide manualmente | Auto-play pausa; retoma automaticamente após ~8 segundos | |
| 3.34 | Slide com título + subtítulo | Texto sobreposto na parte inferior do slide com gradiente | |
| 3.35 | Slide com CTA label + href | Botão de CTA renderizado; clicar navega para o href | |
| 3.36 | Slide sem título/subtítulo/CTA | Nenhum overlay de texto; apenas imagem | |
| 3.37 | Slide com imagem mobile cadastrada — redimensionar browser para ≤ 768px | Imagem mobile exibida (via `<picture><source media="(max-width: 768px)">`) | |
| 3.38 | Slide sem imagem mobile — mobile viewport | Imagem desktop exibida como fallback | |

---

## Checklist de regressão — funcionalidades anteriores

Validar que as sprints anteriores não foram quebradas pelas mudanças do Sprint 3.

| # | Funcionalidade | URL | Status |
|---|----------------|-----|--------|
| R.1 | Home carrega sem erro de JS | `/` | ✅ |
| R.2 | PLP lista produtos | `/products` | |
| R.3 | PDP abre, imagens carregam | `/products/<slug>` | |
| R.4 | Carrinho abre, adicionar produto | `/cart` | |
| R.5 | Botão WhatsApp gera link correto | `/cart` → Finalizar | |
| R.6 | Admin dashboard carrega | `/admin` | ✅ |
| R.7 | CRUD produto — criar produto manual | `/admin/products/new` | |
| R.8 | CRUD produto — editar produto | `/admin/products/<id>/edit` | |
| R.9 | CRUD categoria — criar categoria | `/admin/categories/new` | |
| R.10 | CRUD categoria — editar categoria | `/admin/categories/<id>/edit` | |
| R.11 | Upload imagem de produto | `/admin/products/<id>/edit` | |
| R.12 | Import CSV — wizard completo | `/admin/import` | |
| R.13 | Settings — salvar WhatsApp/URL | `/admin/settings` | |
| R.14 | Settings — upload hero | `/admin/settings` | |
| R.15 | Admin dashboard exibe card "Banners" (novo) | `/admin` | ✅ |

---

## Ordem de execução recomendada

1. **Regressão** (R.1–R.15) — confirmar que nada quebrou  
2. **Sprint 1** (1.1–1.18) — filtros, busca, paginação, bulk actions  
3. **Sprint 2** (2.1–2.7) — importação com status e batch  
4. **Sprint 3 Parte B** (3.1–3.10) — imagem de categoria  
5. **Sprint 3 Parte C admin** (3.11–3.26) — CRUD banners  
6. **Sprint 3 Parte C vitrine** (3.27–3.38) — carrossel na home  
7. **Sprint 4A** (4.1–4.8) — benefícios editáveis

---

## Sprint 4A — Benefícios editáveis

| # | Ação | Resultado esperado | Status |
|---|------|--------------------|--------|
| 4.1 | Abrir `/admin/content/benefits` | Lista com seeds default; formulário eyebrow/título | ✅ |
| 4.2 | Editar eyebrow/título e salvar | Cabeçalho atualizado na home | ⏭️ |
| 4.3 | Criar benefício (até 6) | Novo card na lista | ⏭️ |
| 4.4 | Editar título/descrição | Persiste no Supabase | ⏭️ |
| 4.5 | Toggle ativo/inativo | Vitrine reflete (ou fallback se zero ativos) | ⏭️ |
| 4.6 | Reordenar ▲▼ | `sort_order` muda | ⏭️ |
| 4.7 | Home com benefícios ativos | Seção "Benefícios" com cards do banco | ✅ |
| 4.8 | Desativar todos | Fallback para 3 cards padrão | ⏭️ |

---

## Pré-requisitos para Sprint 3 com Supabase

Antes de executar os testes 3.x com `DATA_PROVIDER=supabase`:

- [x] Migration `20260626200000_sprint3_media_storefront` aplicada (MCP `20260626190619`)
- [x] `categories.image_path` confirmada via SQL
- [x] `banner_slides` table confirmada via SQL
- [x] Bucket `branding` ativo (já existe de sprints anteriores)

---

## Bugs encontrados

| # | Sprint | Passo | Comportamento observado | Prioridade |
|---|--------|-------|------------------------|-----------|
| | | | | |

*(preencher durante execução)*
