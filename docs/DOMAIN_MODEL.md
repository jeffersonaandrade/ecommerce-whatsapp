# Modelo de Domínio — Sports Store

Documento núcleo do domínio. Referências: [`ARCHITECTURE.md`](ARCHITECTURE.md), [`MODULE_ROADMAP.md`](MODULE_ROADMAP.md), [`CSV_IMPORT_SPEC.md`](CSV_IMPORT_SPEC.md).

## ADRs fixas

1. **V1 gera `PurchaseIntent`, não `Order`.** O sistema cria oportunidade de venda, não pedido persistido.
2. **V1 não coleta no site:** endereço, CEP, CPF, pagamento, frete — negociados no WhatsApp.
3. **Catálogo manual + CSV** são entradas complementares e ambos fazem parte do MVP operacional.
4. **`ProductImage.origin`:** `UPLOAD` (admin) | `URL` (CSV).
5. Loja **single-client**, não SaaS, não multi-tenant.

---

## Visão por fase

| Conceito | V1 | V1.5 (opcional) | V2+ |
|----------|----|-----------------|-----|
| PurchaseIntent | Mensagem WhatsApp + demo mock | `/order-intent/[id]` persistido | Evolui para Order no CHECKOUT |
| Order | **Não existe** | **Não existe** | Checkout online + banco |
| Product / Catálogo | Mock + admin (Fase 4) | — | Supabase (Fase 7) |

---

## Product

**Responsabilidade:** item vendável no catálogo, com preço base e variações.

| Campo | V1 | Depois |
|-------|----|--------|
| `id`, `slug`, `name` | Sim | — |
| `shortDescription`, `longDescription` | Sim | SEO |
| `category` | string | `categoryId` + hierarquia |
| `club` / marca | `club?` opcional | entidade `Brand` |
| `price`, `promotionalPrice` | Sim | preço por variação (opcional) |
| `images` | `string[]` hoje | `ProductImage[]` |
| `variations` | Sim | — |
| `status` | `active` \| `draft` \| `unavailable` | — |

**Regras:**
- Slug único, kebab-case.
- `promotionalPrice` < `price` quando preenchido.
- Produto ativo só aparece na vitrine (`getAllProducts` filtra `active`).

**Entrada no catálogo:**
- **Manual (Fase 4):** admin → novo produto → galeria → variações.
- **CSV (Fase 5):** agrupamento por Identificador URL — ver [`CSV_IMPORT_SPEC.md`](CSV_IMPORT_SPEC.md).

---

## ProductImage

**Responsabilidade:** imagem da galeria do produto (até **5** por produto).

| Campo | Descrição |
|-------|-----------|
| `url` | URL exibida (externa ou storage próprio) |
| `sortOrder` | Ordem na galeria |
| `isPrimary` | Imagem principal (PDP, cards) |
| `origin` | `UPLOAD` \| `URL` |

| Origem | Quando |
|--------|--------|
| `UPLOAD` | Cadastro manual no admin |
| `URL` | Coluna `image_urls` do CSV |

**Regras:** máximo 5 imagens; exatamente uma `isPrimary`; na Fase 7+ ambas as origens convergem para URL do storage próprio.

**Gap atual:** [`types/product.ts`](../types/product.ts) usa `images: string[]` — evoluir para `ProductImage[]` na Fase 4.

---

## ProductVariation

**Responsabilidade:** combinação vendável (tamanho, cor, etc.) com estoque e SKU.

| Campo | V1 | Depois |
|-------|----|--------|
| `id`, `sku` | Sim | — |
| `size`, `color` | Opcionais | mais atributos |
| `stock` | Sim | — |
| `price` | Herda do produto | opcional por variação |

**Regras:** SKU único no catálogo; estoque ≥ 0; carrinho valida estoque na PDP.

---

## Category

**Responsabilidade:** organização do catálogo.

| V1 | Depois |
|----|--------|
| string em `Product.category` | tabela `categories`, hierarquia (`Camisas > Seleções`) |

Admin: `/admin/categories` (placeholder Fase 3; gestão na Fase 4+).

---

## Brand

**Responsabilidade:** marca ou clube esportivo.

| V1 | Depois |
|----|--------|
| campo `club?` em Product | tabela `brands`; CSV coluna Marca |

---

## Cart / CartItem

**Responsabilidade:** seleção temporária do cliente antes da finalização.

| Campo | Descrição |
|-------|-----------|
| `productId`, `variationId`, `quantity` | Referência à variação |

**Regras:** persistido em `localStorage` (cliente); `subtotal` derivado via `resolveCartLines()`; não é pedido.

**Implementação:** [`context/cart-context.tsx`](../context/cart-context.tsx), [`lib/cart-storage.ts`](../lib/cart-storage.ts).

---

## PurchaseIntent

**Responsabilidade:** intenção de compra estruturada — **não é pedido**.

| Campo (por linha) | Descrição |
|-------------------|-----------|
| `productName`, `slug`, `productUrl` | Produto + link PDP |
| `size`, `color`, `sku` | Variação |
| `quantity`, `lineSubtotal` | Quantidade e subtotal da linha |
| `cartTotal` | Total agregado |

**Relacionamentos:** derivado de `Cart` → consumido por `WhatsappStrategy` (Fase 6).

**V1:**
- Canal confiável = **mensagem WhatsApp** (texto com links).
- Protótipo UX: `/order-intent/demo` (mock, não link persistente).
- **Sem persistência**, sem banco.

**V1.5/V2:** persistir → `/order-intent/[id]` para visão do atendente.

**Distinção de Order:** PurchaseIntent = lead qualificado; Order = transação confirmada com checkout (V2+).

---

## Order / OrderItem

**Responsabilidade (futura):** pedido confirmado após checkout online.

| V1 | V2+ |
|----|-----|
| **Entidade não existe** | `orders`, `order_items` no banco |
| `/admin/orders` = placeholder visual | gestão real de pedidos |

---

## Customer / Address

| V1 | V2+ |
|----|-----|
| Coleta **fora do site** (WhatsApp) | cadastro + endereços no checkout |
| — | V1.5 opcional: nome/telefone na mensagem |

---

## Payment / Shipping

| V1 | V2+ |
|----|-----|
| Negociação manual no WhatsApp | gateway + frete integrados |

Fora do escopo V1: Stripe, PIX, Mercado Pago, cálculo de frete no site.

---

## ImportJob / ImportRow / ImportError

**Responsabilidade:** processamento de carga CSV em massa.

| Entidade | Papel |
|----------|-------|
| `ImportJob` | arquivo, totais, status da importação |
| `ImportRow` | linha parseada (pré-produto/variação) |
| `ImportError` | erro por linha (`CSV_E001`–`CSV_E007`) |

**V1:** spec + template — ver [`CSV_IMPORT_SPEC.md`](CSV_IMPORT_SPEC.md).  
**Fase 5:** parser, preview, confirmação.

---

## StoreSettings

**Responsabilidade:** configuração da loja (singleton).

| Campo | Uso |
|-------|-----|
| `completionMode` | `WHATSAPP` \| `CHECKOUT` \| `BOTH` |
| `whatsappPhone` | Número da loja (ex. `5581999999999`) |
| `whatsappMessageTemplate` | Prefixo da mensagem |
| `completionButtonLabel` | Texto do botão (ex. "Finalizar Pedido") |

**V1:** documentado; persistência na Fase 7. Valores futuros em [`config/site.ts`](../config/site.ts).

---

## Order Completion (conceito)

Estratégia plugável — não é entidade persistida na V1.

```text
StoreSettings.completionMode → OrderCompletionStrategy
  ├── WhatsappStrategy   (V1 — padrão do template)
  ├── CheckoutStrategy   (V2+)
  └── (extensível)
```

Detalhes do fluxo WhatsApp: seção **Order Completion** em [`ARCHITECTURE.md`](ARCHITECTURE.md).

---

## Gap: `types/product.ts` → modelo alvo

| Hoje | Alvo |
|------|------|
| `images: string[]` | `ProductImage[]` com `origin` |
| `category: string` | `Category` (opcional FK) |
| `club?: string` | `Brand` (opcional FK) |
| Sem `PurchaseIntent` | tipo/conceito na Fase 6 |
| Sem `Import*` | tipos na Fase 5 |
| Sem `StoreSettings` | tipo na Fase 6/7 |

**Não alterar `types/product.ts` na Fase 3** — evolução incremental nas fases de implementação.

---

## Dúvidas abertas

- Limpar carrinho após abrir WhatsApp ou manter itens?
- V1.5: coletar nome/telefone antes do WhatsApp?
- `club` vs `Brand`: manter ambos para loja esportiva ou unificar?
- Categorias flat vs hierárquicas na primeira versão com banco?
- Persistir `PurchaseIntent` como lead (V1.5) ou só na mensagem WhatsApp?
