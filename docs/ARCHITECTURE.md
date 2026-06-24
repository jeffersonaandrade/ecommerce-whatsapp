# Arquitetura — Sports Store

Template e-commerce **single-client**: catálogo (manual + CSV) + carrinho + finalização via WhatsApp na V1.

Documentos relacionados: [`DOMAIN_MODEL.md`](DOMAIN_MODEL.md), [`MODULE_ROADMAP.md`](MODULE_ROADMAP.md), [`CSV_IMPORT_SPEC.md`](CSV_IMPORT_SPEC.md), [`IMPORT_PIPELINE.md`](IMPORT_PIPELINE.md).

---

## Visão geral

| Aspecto | Decisão |
|---------|---------|
| Tipo | Loja por cliente, não SaaS |
| V1 comercial | Cadastrar produtos · importar CSV · vender via WhatsApp |
| V1 técnica | Next.js 16, TypeScript, Tailwind, mock + localStorage |
| Persistência | Fase 7 (Supabase) — depois do catálogo operacional |

---

## Módulos

| Módulo | Responsabilidade | Status |
|--------|------------------|--------|
| **Catalog** | Produtos, imagens, variações, categorias | Mock; admin Fase 4 |
| **Cart** | Carrinho local | ✅ Funcional |
| **CSV Import** | Carga em massa (módulo Catálogo) | Spec + template; pipeline [`IMPORT_PIPELINE.md`](IMPORT_PIPELINE.md) |
| **Order Completion** | Finalização do pedido (estratégias) | Documentado; WhatsApp Fase 6 |
| **Admin** | Gestão da loja | Visual parcial |
| **Settings** | Config da loja | Placeholder |
| **Orders / Checkout / Payment** | Pedidos e pagamento online | V2+ (Fases 8–9) |

---

## Camadas

```text
┌─────────────────────────────────────────┐
│  UI — app/, components/                 │
│  Server Components por padrão           │
└─────────────────┬───────────────────────┘
                  │
┌─────────────────▼───────────────────────┐
│  Domínio — types/, lib/                 │
│  Funções puras, regras de negócio       │
└─────────────────┬───────────────────────┘
                  │
┌─────────────────▼───────────────────────┐
│  Dados — mock → lib/products.ts → DB    │
│  Carrinho: localStorage (cliente)       │
└─────────────────┬───────────────────────┘
                  │
┌─────────────────▼───────────────────────┐
│  Integrações — WhatsApp (V1), gateway   │
│  e frete (V2+)                          │
└─────────────────────────────────────────┘
```

### UI (`app/`, `components/`)

- Páginas públicas, admin, carrinho.
- Sem formulários de endereço/pagamento na V1.
- Regra de negócio pesada evitada — delegar a `lib/`.

### Domínio (`types/`, `lib/`)

- Hoje: tipos em [`types/product.ts`](../types/product.ts), utilitários em `lib/`.
- Futuro: subpastas por módulo (`lib/catalog/`, `lib/order-completion/`) quando houver volume.

### Dados

| Fonte | Uso atual |
|-------|-----------|
| [`data/mock-products.ts`](../data/mock-products.ts) | Catálogo |
| [`lib/products.ts`](../lib/products.ts) | Abstração — único ponto de troca para DB |
| `localStorage` | Itens do carrinho |

### Integrações

- **V1:** deep link WhatsApp (`wa.me`) — Fase 6.
- **V2+:** gateway, frete, webhooks.

---

## IA do Admin

```text
Dashboard                    /admin
Produtos
    Lista                    /admin/products
    Novo Produto             /admin/products/new
    Importar CSV             /admin/import
Categorias                   /admin/categories
Pedidos                      /admin/orders (placeholder até V2)
Configurações                /admin/settings
```

Fase 3: skeleton de navegação. Fase 4: catálogo funcional.

---

## O que é mock hoje

- Produtos (`mock-products`)
- Pedidos admin (sem domínio `Order`)
- Checkout (placeholder)
- Settings (sem persistência)
- Import (download template apenas)

---

## O que será persistido (futuro)

| Fase | O quê |
|------|-------|
| 4–6 | Catálogo em mock/localStorage até Fase 7 |
| 7 | Produtos, imagens, settings, import jobs → Supabase |
| 8–9 | Orders, payments, shipments |

`DATABASE_PLAN.md` será criado na **Fase 7**, quando o catálogo real estabilizar requisitos.

---

## Decisões arquiteturais atuais

- **Server Components** por padrão; `'use client'` só onde necessário (carrinho).
- **Carrinho:** React Context + `localStorage` — sem Redux/Zustand.
- **Produtos:** toda leitura via [`lib/products.ts`](../lib/products.ts).
- **PurchaseIntent efêmero** na V1 — sem pedido no banco.
- **CSV:** formato planilha de carga em massa — [`CSV_IMPORT_SPEC.md`](CSV_IMPORT_SPEC.md).

---

## Decisões adiadas

- Supabase, ORM, migrations
- Parser CSV runtime
- Auth admin
- Entidade `Order`, gateway, frete no site
- `graphify update` (só com autorização)

---

## Anti-overengineering

Não construir agora:

- Marketplace, multi-tenant, ERP, filas complexas
- Abstrações genéricas sem segundo uso
- Checkout completo antes do catálogo operacional

Construir com estratégia plugável apenas onde necessário: **Order Completion**.

---

## Order Completion

### Conceito

**Finalização do pedido** substitui a ideia de “checkout único”. O modo ativo vem de `StoreSettings.completionMode`:

| Modo | Quando |
|------|--------|
| `WHATSAPP` | V1 — padrão do template |
| `CHECKOUT` | V2+ — pagamento online |
| `BOTH` | Futuro — loja escolhe |

### PurchaseIntent vs Order

- **PurchaseIntent:** oportunidade de venda; V1 = mensagem WhatsApp estruturada.
- **Order:** transação confirmada; **não existe na V1**.

### Fluxo V1

```text
Catálogo → Carrinho → Finalizar Pedido → PurchaseIntent (resumo)
  → WhatsApp da loja → Negociação manual (fora do site)
  → Loja coleta endereço, entrega, pagamento
```

O site **não participa** da negociação comercial.

### O que a V1 não coleta

Endereço, CEP, CPF, pagamento, frete — todos no WhatsApp.

### Payload da mensagem WhatsApp (Fase 6)

Por item: nome, tamanho, cor, SKU, quantidade, subtotal da linha, **link da PDP**.  
Rodapé: **total do carrinho**.

Exemplo:

```text
Olá! Gostaria de solicitar este pedido.

• Camisa Flamengo
  Tamanho: G | Cor: Vermelha | SKU: CAM-FLA-G
  Qtd: 2 | Subtotal: R$ 379,80
  https://loja.exemplo.com/products/camisa-flamengo

Total: R$ 539,70

Aguardo retorno.
```

### Canal confiável vs protótipo

| Artefato | Papel |
|----------|-------|
| Mensagem WhatsApp | Canal de produção V1 |
| `/order-intent/demo` | Protótipo UX do atendente (mock, sem link entre dispositivos) |

### Estratégias (futuro)

```text
OrderCompletionStrategy
  ├── WhatsappStrategy
  ├── CheckoutStrategy
  └── (extensível)
```

### StoreSettings (planejado)

- `whatsappPhone`, `whatsappMessageTemplate`, `completionButtonLabel`, `completionMode`
- Admin: `/admin/settings` → seção Finalização do Pedido

### Evolução

| Versão | Escopo |
|--------|--------|
| V1 | WhatsApp + demo mock |
| V1.5 | PurchaseIntent persistido → `/order-intent/[id]` |
| V2 | Order + Checkout + Pagamento |

### Proibições V1

Gateway, PIX, pedidos no banco, API de intent persistente, formulários de checkout.

---

## Proibido na Fase 3

Migrations, Supabase, parser CSV, gateway, webhooks, alteração de tipos de domínio em código.

---

## Mapa de código (Graphify)

Hubs principais: `Product`, `getAllProducts()`, `useCart()`, `resolveCartLines()`.

| Módulo | Arquivos |
|--------|----------|
| Catalog | `types/product.ts`, `lib/products.ts`, `app/products/` |
| Cart | `context/cart-context.tsx`, `lib/cart-*.ts`, `components/cart/` |
| Import | `docs/CSV_IMPORT_SPEC.md`, `app/admin/import/` |
| Admin | `app/admin/*` |

Consulta: [`graphify-out/GRAPH_REPORT.md`](../graphify-out/GRAPH_REPORT.md) — sem `graphify update` sem autorização.
