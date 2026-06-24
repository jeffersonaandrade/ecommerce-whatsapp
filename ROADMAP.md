# ROADMAP - Sports Store E-commerce

Roadmap comercial: **cadastrar → importar → vender**. Detalhes por módulo: [`docs/MODULE_ROADMAP.md`](docs/MODULE_ROADMAP.md).

## Visão geral

Template single-client: catálogo + carrinho + WhatsApp na V1. Checkout online na V2.

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

### Fase 4: Catálogo Admin — Próxima

- Lista, criar, editar produto
- Galeria (1–5 imagens, principal)
- Variações, SKU, estoque, categorias
- Status rascunho/ativo

### Fase 5: Importação CSV

- Parser, preview, validação, importação
- Spec: [`docs/CSV_IMPORT_SPEC.md`](docs/CSV_IMPORT_SPEC.md)

### Fase 6: Finalização via WhatsApp

- Mensagem estruturada (SKU, links PDP, total)
- Config telefone da loja
- Botão Finalizar Pedido ativo

### Fase 7: Supabase

- Persistência + `DATABASE_PLAN`
- Storage de imagens

### Fase 8: Pedidos

- Gestão real (após operação comercial definida)

### Fase 9: Checkout Online

- Gateway, pagamento, frete no site

## Milestones

| Marco | Status |
|-------|--------|
| MVP vitrine + carrinho | Concluído |
| Domínio documentado | Concluído |
| Catálogo operacional | Próximo |
| CSV + WhatsApp | Planejado |
| Supabase | Após catálogo |

## Fora do escopo

Marketplace, multi-tenant, cashback, afiliados, ERP, app mobile.

## Princípio

Primeiro o lojista consegue **cadastrar, importar e receber pedidos no WhatsApp**. Infra pesada depois.
