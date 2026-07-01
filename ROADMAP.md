# ROADMAP - Sports Store E-commerce

Roadmap comercial: **cadastrar → importar → vender**. Detalhes por módulo: [`docs/MODULE_ROADMAP.md`](docs/MODULE_ROADMAP.md).

## Visão geral

Core **single-tenant por implantação** (1 Supabase por loja; N lojas via N deploys). V1: catálogo + carrinho + WhatsApp. Checkout online na V2.

## Fases

### Fase 1: Foundation — Concluída

- Next.js 16, TypeScript, Tailwind, mocks, vitrine, admin visual

### Fase 2: Carrinho — Concluída

- Context + localStorage, PDP com variações, testes unitários

### Fase 3: Domínio enxuto — Concluída

- [`docs/DOMAIN_MODEL.md`](docs/DOMAIN_MODEL.md)
- [`docs/ARCHITECTURE.md`](docs/ARCHITECTURE.md)
- [`docs/MODULE_ROADMAP.md`](docs/MODULE_ROADMAP.md)
- Admin skeleton, copy carrinho, `/order-intent/demo`

### Fase 4: Catálogo Admin — Concluída

- Lista, criar, editar produto
- Galeria (1–5 imagens, ordem por posição)
- Variações, SKU, estoque, categorias CRUD v1.1
- Status rascunho/ativo · upload Supabase Storage

### Fase 5: Importação CSV — Concluída

- Parser, preview, validação, RPC transacional Supabase
- Spec: [`docs/CSV_IMPORT_SPEC.md`](docs/CSV_IMPORT_SPEC.md)
- Central de Mídia pós-import · migração imagens operacional

### Fase 6: Finalização via WhatsApp — Concluída

- Mensagem estruturada (SKU, links PDP, total)
- Config telefone da loja
- Botão Finalizar Pedido ativo

### Fase 7: Supabase — Concluída (produção)

- ✅ Persistência + [`DATABASE_PLAN.md`](docs/DATABASE_PLAN.md)
- ✅ Storage de imagens (branding + products)
- ✅ Auth admin + middleware
- ✅ `DATA_PROVIDER=supabase` na Netlify — https://unitsports.netlify.app (implantação `unitsports`)
- 🟡 Onboarding 1º cliente (validação catálogo/imagens)

### Fase 8: Pedidos

- Gestão real (após operação comercial definida)

### Fase 9: Checkout Online

- Gateway, pagamento, frete no site

## Milestones

| Marco | Status |
|-------|--------|
| MVP vitrine + carrinho | ✅ Concluído |
| Domínio documentado | ✅ Concluído |
| Catálogo operacional | ✅ Concluído |
| CSV + WhatsApp | ✅ Concluído |
| Supabase produção | ✅ Ativo (onboarding cliente em andamento) |
| Sprint 4+ CMS | 📅 Após feedback 1º cliente |

## Fora do escopo

Marketplace, multi-tenant, cashback, afiliados, ERP, app mobile.

## Princípio

Primeiro o lojista consegue **cadastrar, importar e receber pedidos no WhatsApp**. Infra pesada depois.
