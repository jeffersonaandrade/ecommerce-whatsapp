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
- Produto **ativo** só aparece na vitrine (`getAllProducts` filtra `active`).
- Cadastro manual: preço em **number** (reais); UI aceita BRL (`129,90` / `R$ 129,90`) via `MoneyInput` — não persistir string formatada.
- **Publicar na loja:** editar produto → `status = active` → **Salvar alterações** (não há tela separada de publicação).
- Novo produto manual nasce em `draft` por padrão; redirect pós-create para edit com `?created=1`.

**Entrada no catálogo:**
- **Manual:** admin → novo produto → validação (nome, preço, descrição, ≥1 imagem, variação/SKU) → revisão → ativar.
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

**Responsabilidade:** organização do catálogo em árvore (**máx. 4 níveis visuais**, `depth` 0–3). Não é árvore ilimitada.

| Campo | Descrição |
|-------|-----------|
| `parentId` | FK opcional para categoria pai (`null` = raiz) |
| `depth` | 0–3 (tipo → liga → linha → time/clube) |
| `path` | Caminho materializado (`camisas/brasileiro/retro/santa-cruz`) |
| `slug` | **Único global** no MVP (limitação documentada) |

**Modelo sugerido (cliente):**

| Nível | `depth` | Exemplos |
|-------|---------|----------|
| Tipo de produto | 0 | Camisas, Chuteiras, Conjuntos, Shorts |
| Liga / região | 1 | Brasileiro, Europeu, NBA, Seleções |
| Linha / variante | 2 | Retrô, Versão Jogador, Feminina, Kit infantil, Manga Longa |
| Time / clube | 3 | Santa Cruz, Sport, Real Madrid, Brasil |

`Product.categoryId` referencia o nó escolhido (folha recomendada); `Product.category` (slug) permanece sincronizado para compatibilidade com RPCs legados e import CSV.

**Vitrine:** `/products?category={slug}` lista produtos do nó **e descendentes**. Nó oculto (`visible = false`) oculta subárvore. **Mobile:** drill-down por nível (`CategoryTreeNav`), não lista plana de todos os nós.

**Admin:** `/admin/categories` — CRUD em árvore (lista indentada, select de pai). Formulário de produto e ação em lote usam tree picker. **Clube/time** (`Product.club`) é campo separado (legado; preferir folha na árvore).

**Import CSV:** inalterado — sem path hierárquico, sem auto-criação de categorias; hierarquia organizada pelo admin após import (mover em lote + publicar).

**Rollout folha:** Fase 1 (MVP) permite produto em raiz/intermediário; Fase 2 aviso no admin; Fase 3 bloqueio de publicação em não-folha.

**Depreciação `products.category` (slug legado):**

| Fase | Comportamento |
|------|----------------|
| v1 (atual) | `category_id` + `category` sincronizados; import CSV grava slug |
| v2 | `category` somente leitura; escrita apenas em `category_id` |
| v3 | Remover coluna `category` após migração completa |

**Busca PLP (roadmap):** `?q=` deve considerar nome do produto, categoria folha e breadcrumbs (ex.: busca `Santa` encontra camisa em `Camisas › Brasileiro › Retrô › Santa Cruz`).

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
| `addons?` | Ex.: `personalization: { name, number, notes? }` |

**Regras:** persistido em `localStorage` v2; totais via `lib/pricing/computeTotals()`; não é pedido.

**Implementação:** [`context/cart-context.tsx`](../context/cart-context.tsx), [`lib/cart-storage.ts`](../lib/cart-storage.ts).

---

## PurchaseIntent

**Responsabilidade:** intenção de compra estruturada — **não é pedido**.

| Campo (por linha) | Descrição |
|-------------------|-----------|
| `productName`, `slug`, `productUrl` | Produto + link PDP |
| `size`, `color`, `sku` | Variação |
| `quantity`, `lineMerchandiseTotal` | Quantidade e subtotal da linha |
| `addons?` | Personalização por item |
| `merchandiseSubtotal`, `commercialDiscount`, `cartTotal` | Totais com desconto comercial |

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

**Responsabilidade:** identidade e configuração da loja (singleton).

Persistência V1: `storage/store-settings.json` + assets em `storage/branding/`. Admin: `/admin/settings`.

**Anti–page-builder (V1):** o admin permite trocar **conteúdo e identidade** (logo, cores, banner, textos institucionais, contato). Layout estrutural permanece fixo — sem drag-and-drop, blocos livres ou edição de CSS.

| Campo | Uso |
|-------|-----|
| `storeName` | Header, title, footer |
| `description` | Footer, meta description |
| `siteUrl` | Links PDP no WhatsApp, canonical (SEO) |
| `whatsappPhone` | wa.me |
| `whatsappMessagePrefix` | Prefixo opcional da mensagem |
| `email`, `instagram`, `facebook`, `phone` | Footer / contato |
| `logoPath`, `ogImagePath` | Branding; favicon/OG gerados da logo (sharp) |
| `primaryColor`, `secondaryColor` | Botões primários e superfícies (CSS vars) |
| `heroImagePath`, `heroHeadline`, `heroHeadlineLine2`, `heroSubheadline`, `heroCtaLabel`, `heroCtaHref` | Hero da home |
| `aboutText` | `/sobre` |
| `address`, `cityState`, `businessHours` | `/contato` |
| `exchangePolicyText` | `/politica-de-trocas` |

**Fora de escopo V1:** theme engine completo · page builder · `completionMode` editável (WhatsApp fixo).

Supabase Storage na Fase 7.

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
| Sem `StoreSettings` | ✅ `types/store-settings.ts` + JSON local |

**Não alterar `types/product.ts` na Fase 3** — evolução incremental nas fases de implementação.

---

## Dúvidas abertas

- Limpar carrinho após abrir WhatsApp ou manter itens?
- V1.5: coletar nome/telefone antes do WhatsApp?
- `club` vs `Brand`: manter ambos para loja esportiva ou unificar?
- Categorias flat vs hierárquicas na primeira versão com banco?
- Persistir `PurchaseIntent` como lead (V1.5) ou só na mensagem WhatsApp?
