# Graph Report - ecommerce-sports  (2026-06-24)

## Corpus Check
- 99 files · ~27,581 words
- Verdict: corpus is large enough that graph structure adds value.

## Summary
- 465 nodes · 1068 edges · 17 communities (11 shown, 6 thin omitted)
- Extraction: 99% EXTRACTED · 1% INFERRED · 0% AMBIGUOUS · INFERRED: 11 edges (avg confidence: 0.8)
- Token cost: 0 input · 0 output

## Graph Freshness
- Built from commit: `52afb709`
- Run `git rev-parse HEAD` and compare to check if the graph is stale.
- Run `graphify update .` after code changes (no API cost).

## Community Hubs (Navigation)
- [[_COMMUNITY_Community 0|Community 0]]
- [[_COMMUNITY_Community 1|Community 1]]
- [[_COMMUNITY_Community 2|Community 2]]
- [[_COMMUNITY_Community 3|Community 3]]
- [[_COMMUNITY_Community 4|Community 4]]
- [[_COMMUNITY_Community 7|Community 7]]
- [[_COMMUNITY_Community 8|Community 8]]
- [[_COMMUNITY_Community 9|Community 9]]
- [[_COMMUNITY_Community 10|Community 10]]
- [[_COMMUNITY_Community 11|Community 11]]
- [[_COMMUNITY_Community 13|Community 13]]
- [[_COMMUNITY_Community 14|Community 14]]
- [[_COMMUNITY_Community 16|Community 16]]
- [[_COMMUNITY_Community 17|Community 17]]
- [[_COMMUNITY_Community 18|Community 18]]
- [[_COMMUNITY_Community 19|Community 19]]

## God Nodes (most connected - your core abstractions)
1. `getButtonClassName()` - 26 edges
2. `Product` - 24 edges
3. `getStoreSettings()` - 22 edges
4. `Button` - 17 edges
5. `compilerOptions` - 16 edges
6. `formatPrice()` - 15 edges
7. `getAllProducts()` - 15 edges
8. `buildImportPreview()` - 14 edges
9. `DesignSystemGenerator` - 11 edges
10. `useCart()` - 11 edges

## Surprising Connections (you probably didn't know these)
- `generateMetadata()` --calls--> `getStoreSettings()`  [INFERRED]
  app/products/page.tsx → lib/store/settings-repository.ts
- `SportsHeroProps` --references--> `Product`  [EXTRACTED]
  components/commerce/sports-hero.tsx → types/product.ts
- `ProductCardProps` --references--> `Product`  [EXTRACTED]
  components/product/product-card.tsx → types/product.ts
- `ProductPurchasePanelProps` --references--> `Product`  [EXTRACTED]
  components/product/product-purchase-panel.tsx → types/product.ts
- `NavCard()` --calls--> `getButtonClassName()`  [EXTRACTED]
  app/admin/page.tsx → components/ui/button.tsx

## Import Cycles
- None detected.

## Communities (17 total, 6 thin omitted)

### Community 0 - "Community 0"
Cohesion: 0.10
Nodes (19): compilerOptions, allowJs, esModuleInterop, incremental, isolatedModules, jsx, lib, module (+11 more)

### Community 1 - "Community 1"
Cohesion: 0.08
Nodes (23): dependencies, framer-motion, next, react, react-dom, sharp, devDependencies, tailwindcss (+15 more)

### Community 2 - "Community 2"
Cohesion: 0.08
Nodes (38): CartContent(), CartContentProps, CartLineItem(), CartLineItemProps, useCart(), mockPurchaseIntent, metadata, OrderIntentDemoPage() (+30 more)

### Community 3 - "Community 3"
Cohesion: 0.08
Nodes (40): AdminPage(), metadata, NavCard(), generateMetadata(), Home(), CartNavLink(), countProductsByCategory(), AdminCategoriesPage() (+32 more)

### Community 4 - "Community 4"
Cohesion: 0.08
Nodes (43): confirmImportAction(), parseImportCsvAction(), revalidateCatalog(), checkImageUrlHead(), checkProductImageUrls(), CSV_COLUMNS, REQUIRED_HEADERS, Filter (+35 more)

### Community 7 - "Community 7"
Cohesion: 0.14
Nodes (21): CartTestClient(), getClientCatalogCache(), setCatalogCache(), CartContext, CartContextValue, sanitizeItems(), loadCartItems(), saveCartItems() (+13 more)

### Community 10 - "Community 10"
Cohesion: 0.10
Nodes (30): CATALOG_PATH, ensureStorage(), loadCatalogFromDisk(), persistCatalog(), readFromDisk(), SEED_PATH, STORAGE_DIR, writeToDisk() (+22 more)

### Community 11 - "Community 11"
Cohesion: 0.12
Nodes (25): DeleteProductButton(), DeleteProductButtonProps, ImageGalleryField(), ImageGalleryFieldProps, emptyVariation(), ProductForm(), ProductFormProps, productToForm() (+17 more)

### Community 13 - "Community 13"
Cohesion: 0.06
Nodes (47): Icon(), size, barlowCondensed, generateMetadata(), inter, viewport, CartPage(), metadata (+39 more)

### Community 14 - "Community 14"
Cohesion: 0.06
Nodes (40): BM25, detect_domain(), _load_csv(), Lowercase, split, remove punctuation, filter short words, Build BM25 index from documents, Score all documents against query, Load CSV and return list of dicts, Core search function using BM25 (+32 more)

## Knowledge Gaps
- **109 isolated node(s):** `metadata`, `metadata`, `metadata`, `metadata`, `EditProductPageProps` (+104 more)
  These have ≤1 connection - possible missing edges or undocumented components.
- **6 thin communities (<3 nodes) omitted from report** — run `graphify query` to explore isolated nodes.

## Suggested Questions
_Questions this graph is uniquely positioned to answer:_

- **Why does `Product` connect `Community 7` to `Community 2`, `Community 3`, `Community 4`, `Community 10`, `Community 11`?**
  _High betweenness centrality (0.072) - this node is a cross-community bridge._
- **Why does `getButtonClassName()` connect `Community 3` to `Community 2`, `Community 4`, `Community 13`?**
  _High betweenness centrality (0.046) - this node is a cross-community bridge._
- **Why does `getStoreSettings()` connect `Community 13` to `Community 2`, `Community 3`?**
  _High betweenness centrality (0.035) - this node is a cross-community bridge._
- **Are the 2 inferred relationships involving `getButtonClassName()` (e.g. with `AdminProductsPage()` and `ProductsPage()`) actually correct?**
  _`getButtonClassName()` has 2 INFERRED edges - model-reasoned connections that need verification._
- **What connects `BM25 ranking algorithm for text search`, `Lowercase, split, remove punctuation, filter short words`, `Build BM25 index from documents` to the rest of the system?**
  _135 weakly-connected nodes found - possible documentation gaps or missing edges._
- **Should `Community 0` be split into smaller, more focused modules?**
  _Cohesion score 0.1 - nodes in this community are weakly interconnected._
- **Should `Community 1` be split into smaller, more focused modules?**
  _Cohesion score 0.08333333333333333 - nodes in this community are weakly interconnected._