# DEV NOTES - Sports Store E-commerce

## 🚀 Status do Projeto

**Versão:** 0.4.0 (`package.json` alinhado ao CHANGELOG)
**Status:** ✅ Fases 1–4 concluídas · Sprint 0 encerrada
**Última validação:** 2026-06-24

### Estado atual (pós Sprint 0)

| Área | Status |
|------|--------|
| Vitrine + PDP | ✅ `lib/products.ts` → `storage/catalog.json` |
| Carrinho | ✅ Context + localStorage + `/api/products` |
| Admin catálogo | ✅ CRUD, galeria, variações, categorias derivadas |
| Domínio / ADRs | ✅ `docs/DOMAIN_MODEL.md`, `ARCHITECTURE.md` |
| CSV import | ⏳ Spec + template; upload na Fase 5 |
| Supabase | ⏳ Fase 7 |
| Graphify | ✅ Atualizado (239 nós · 512 arestas) |

## ✅ O que foi Implementado (Fase 1)

### Saneamento da Fundação (Sprint Inicial)
- [x] Camada abstrata de produtos (lib/products.ts)
- [x] Utilitários de cores (lib/colors.ts)
- [x] ProductCard como Server Component
- [x] Imagens corrigidas e validadas
- [x] Botão "Carrinho em breve" desabilitado
- [x] Contraste do hero button melhorado
- [x] Todas as importações usando lib/products.ts

### Estrutura
- [x] Projeto Next.js 16 com TypeScript
- [x] Tailwind CSS configurado
- [x] Estrutura de pastas limpa
- [x] Sistema de tipos TypeScript completo

### Componentes
- [x] Componentes UI básicos (Button, Badge) - Server Components
- [x] ProductCard com imagens e variações - Server Component
- [x] SportsHero com CTA e categorias
- [x] Header e Footer responsivos
- [x] Componentes sem dependências externas desnecessárias

### Páginas Públicas
- [x] Home com hero e produtos destacados
- [x] Listagem de produtos com filtros
- [x] Detalhe de produto com variações
- [x] Carrinho (placeholder - não funcional)
- [x] Checkout (placeholder - não funcional)

### Área Admin
- [x] Dashboard com estatísticas
- [x] Listagem de produtos
- [x] Visualização de pedidos (vazio)

### Dados & Config
- [x] 6 produtos mockados com variações
- [x] Sistema de categorias
- [x] Preços e promoções
- [x] Configuração centralizada

### Documentação
- [x] README.md com instruções
- [x] PROJECT_SCOPE.md detalhado
- [x] ROADMAP.md com fases
- [x] CLIENT_SETUP_CHECKLIST.md
- [x] DEV_NOTES.md (este arquivo)

## 🔧 Arquitetura Pós-Saneamento

### Camadas de Dados (Fase 4)

```
Admin UI → Server Actions → ProductRepository → storage/catalog.json
Vitrine  → lib/products.ts (server-only)     → JsonProductRepository
Carrinho → lib/products-client.ts            → /api/products (cache)
```

**Seed:** `storage/catalog.seed.json` · **Runtime:** `storage/catalog.json` (gitignored)

**Benefícios:**
- Páginas independentes da origem de dados
- Troca para Supabase (Fase 7) só no repositório
- Type-safe em todos os níveis

### Componentes Atualizados
- **ProductCard**: Server Component (sem 'use client')
- **SportsHero**: Server Component
- **Button, Badge**: Server Components
- **Header, Footer**: Server Components

### Utilitários Organizados
- \lib/formatters.ts\ - Preço, datas, slugs
- \lib/colors.ts\ - Mapeamento de cores
- \lib/products.ts\ - Acesso a produtos

## 📊 Problemas Corrigidos

| Problema | Status | Solução |
|----------|--------|---------|
| Imagem quebrada Seleção | ✅ Fixo | URL Unsplash validada |
| Contraste button hero | ✅ Fixo | Melhorado shadow e hover |
| Botão "Adicionar" enganoso | ✅ Fixo | Desabilitado com mensagem |
| Lógica colorToHex inline | ✅ Fixo | Movido para lib/colors.ts |
| ProductCard 'use client' desnecessário | ✅ Fixo | Convertido para Server Component |
| Importação direta de mockProducts | ✅ Fixo | Via lib/products.ts |

## 📋 O que ainda NÃO está implementado (por design)

- ❌ Importação CSV (upload) — Fase 5
- ❌ Finalização via WhatsApp — Fase 6
- ❌ Supabase / persistência remota — Fase 7
- ❌ Pedidos reais (`Order`) — Fase 8
- ❌ Checkout online — Fase 9 / V2
- ❌ Pagamento, frete, CPF/CEP no site — fora da V1
- ❌ Autenticação admin
- ❌ Email/notificações

## 🔍 Validação Obrigatória

**Build:**
\\\ash
npm run build  # ✅ Deve passar
\\\

**Rotas Testadas:**
- [x] GET / (Home) - Hero + produtos
- [x] GET /products (Listagem) - Grid responsivo
- [x] GET /products/camisa-sao-paulo-2024 (Detalhe) - Variações visíveis
- [x] GET /admin (Dashboard) - Stats mostradas
- [x] GET /admin/products (Gestão) - Tabela preenchida

**Imagens:**
- [x] Unsplash (todas funcionam)
- [x] Local cache via Next.js Image

**Botões:**
- [x] "Explorar Produtos" funciona
- [x] "Ver detalhes" funciona
- [x] "Carrinho em breve" desabilitado com título
- [x] Admin links funcionam

## 🔄 Próxima Etapa (Fase 5 — Importação CSV)

1. Parser CSV conforme `docs/CSV_IMPORT_SPEC.md`
2. Upload em `/admin/import`
3. Validação e merge no `ProductRepository`

Catálogo Admin (Fase 4) — concluído: `ProductRepository` JSON, CRUD admin, galeria, variações, categorias derivadas.

Carrinho (Fase 2) — concluído: Context, localStorage, testes em `lib/cart-*.test.ts`.

## 📥 Importação CSV (V1 — spec only)

- Especificação: [`docs/CSV_IMPORT_SPEC.md`](docs/CSV_IMPORT_SPEC.md) — formato planilha de carga em massa + coluna opcional `image_urls`
- Template: [`public/templates/importacao-produtos-exemplo.csv`](public/templates/importacao-produtos-exemplo.csv)
- Admin: `/admin/import` — download do template; **upload não implementado**

## 🏗️ Arquitetura (Fase 3)

- [`docs/DOMAIN_MODEL.md`](docs/DOMAIN_MODEL.md) — entidades e ADRs
- [`docs/ARCHITECTURE.md`](docs/ARCHITECTURE.md) — camadas, módulos, Order Completion
- [`docs/MODULE_ROADMAP.md`](docs/MODULE_ROADMAP.md) — fases 4–9 (catálogo primeiro)

**ADRs:** PurchaseIntent ≠ Order na V1 · Catálogo manual + CSV · ProductImage `UPLOAD|URL` · WhatsApp = canal confiável.

**Rotas novas:** `/admin/settings`, `/admin/products/new`, `/admin/categories`, `/order-intent/demo` (protótipo).

**Próximo:** Fase 5 — Importação CSV.

**Persistência catálogo (Fase 4):** `lib/catalog/*` → `storage/catalog.json` (dev); Supabase na Fase 7.

**Graphify:** mapa em `graphify-out/` — última geração Sprint 0 (2026-06-24).

## UI Polish — preparação (Sprint Prep)

Preparação para sprint futura de melhoria visual. **Nenhuma tela foi alterada nesta etapa.**

| Item | Status |
|------|--------|
| `framer-motion` | Instalado em `package.json` — uso na sprint de polish (sem imports ativos ainda) |
| Skill **ui-ux-pro-max** | `.cursor/skills/ui-ux-pro-max/` — referência design/UX para o assistente |
| [`DESIGN-nike.md`](DESIGN-nike.md) | Referência analítica de direção visual — **sem cópia de marca ou layout Nike** |
| Plano detalhado | [`docs/UI_POLISH_PLAN.md`](docs/UI_POLISH_PLAN.md) |

### QA Browser Report — triagem 2026-06-24

Relatório browser (Claude) classificado no plano de UI. Resumo:

- **Bug real P1:** imagem Unsplash 404 no produto "Seleção Brasileira Away" — corrigir na sprint bugfix.
- **Bugs UX P2/P3:** swatch branco invisível, `<Link><Button>`, botão "Coleções" sem ação.
- **Falsos positivos:** "renderer freeze" (timeout CDP), badge "1 Issue" (Next dev), rota `/admin/products/create`, duplicação em categorias.
- **By design:** categorias sem CRUD, settings com `fieldset disabled`.

Matriz completa: [`docs/UI_POLISH_PLAN.md` §7](docs/UI_POLISH_PLAN.md).

> Validar freeze e hero manualmente em Chrome antes de tratar como P0.

## Registro de sessões

Ao finalizar cada fase/tarefa, atualizar **CHANGELOG.md** e esta seção (não apagar ADRs anteriores).

### 2026-06-24 — Fase 3: Domínio enxuto

| Campo | Detalhe |
|-------|---------|
| Arquivos | Ver [CHANGELOG.md](CHANGELOG.md) § 0.3.0 |
| Resumo | Docs DOMAIN_MODEL, ARCHITECTURE, MODULE_ROADMAP; admin skeleton; PurchaseIntent demo |
| Rotas | `/admin/settings`, `/admin/products/new`, `/admin/categories`, `/order-intent/demo`, `/cart`, `/checkout` |
| Comandos | `npm run build`, `npm run test` |
| Build/test | OK · 14 testes |
| Graphify | Não atualizado |

### 2026-06-24 — Fase 4: Catálogo Admin

| Campo | Detalhe |
|-------|---------|
| Arquivos | Ver [CHANGELOG.md](CHANGELOG.md) § 0.4.0 |
| Resumo | ProductRepository JSON, CRUD admin, galeria, variações, categorias derivadas |
| Rotas | `/admin/products`, `/admin/products/new`, `/admin/products/[id]/edit`, `/admin/categories`, `/api/products` |
| Comandos | `npm run build`, `npm run test` |
| Build/test | OK · 23 testes |
| Graphify | Não atualizado (sugerir mapa `lib/catalog/*`) |

### 2026-06-24 — Sprint 0: Cleanup

| Campo | Detalhe |
|-------|---------|
| Arquivos | `package.json`, `DEV_NOTES.md`, `CHANGELOG.md`, `GRAPHIFY_MAP.md`, `graphify-out/*` |
| Resumo | Encerramento sprint Fases 3–4: versão 0.4.0, docs sincronizados, Graphify regenerado |
| Comandos | `npm run build`, `npm run test`, `graphify update .` |
| Build/test | OK · 23 testes |
| Graphify | OK · 239 nós · 512 arestas · commit `7c6521d` |

### 2026-06-24 — Sprint Prep: UI Polish Setup

| Campo | Detalhe |
|-------|---------|
| Arquivos | `package.json`, `package-lock.json`, `.cursor/skills/ui-ux-pro-max/**`, `DEV_NOTES.md`, `docs/UI_POLISH_PLAN.md` |
| Resumo | framer-motion + skill ui-ux-pro-max; plano UI polish; triagem QA Browser |
| UI alterada | **Nenhuma** (components/app intactos) |
| Comandos | `npm install framer-motion`, `npx uipro-cli init --ai cursor`, `npm run build`, `npm run test` |
| Build/test | OK · 23 testes |
| Graphify | Não atualizado |

## 🛠️ Troubleshooting

### Build falha com erros de tipos
\\\ash
npx tsc --noEmit
\\\

### Imagens ainda quebradas
- Verificar next.config.ts
- Confirmar remotePatterns para images.unsplash.com
- Testar URL no navegador isoladamente

### ProductCard não renderiza
- Confirmar que é server component (sem 'use client')
- Verificar que colorNameToHex existe em lib/colors.ts
- Verificar imports

## 📝 Notas Importantes

1. **Catálogo dev:** `storage/catalog.json` via `ProductRepository`
2. **Quando trocar para Supabase (Fase 7):**
   - Implementar `SupabaseProductRepository`
   - Manter `lib/products.ts` como fachada
3. **Server Components:** Preferir sempre que possível
4. **Imagens:** Sempre validar URLs antes de commitar
5. **Botões:** Nunca deixar estado enganoso (sempre claro se funciona)

## 🧪 Testando Localmente

\\\ash
npm run dev
# Em outro terminal
curl http://localhost:3000/
curl http://localhost:3000/products
curl http://localhost:3000/admin
\\\

---

**Última atualização:** 2026-06-24 (Sprint Prep UI)
**Status:** Prep UI concluído · próxima: Fase 5 (CSV) ou sprint bugfix QA / UI polish
