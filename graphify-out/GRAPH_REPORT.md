# Graph Report - ecommerce-sports  (2026-06-24)

## Corpus Check
- 111 files · ~29,860 words
- Verdict: corpus is large enough that graph structure adds value.

## Summary
- 502 nodes · 1162 edges · 18 communities (12 shown, 6 thin omitted)
- Extraction: 99% EXTRACTED · 1% INFERRED · 0% AMBIGUOUS · INFERRED: 13 edges (avg confidence: 0.8)
- Token cost: 0 input · 0 output

## Graph Freshness
- Built from commit: `5f73dcfd`
- Run `git rev-parse HEAD` and compare to check if the graph is stale.
- Run `graphify update .` after code changes (no API cost).

## Community Hubs (Navigation)
- [[_COMMUNITY_Community 0|Community 0]]
- [[_COMMUNITY_Community 1|Community 1]]
- [[_COMMUNITY_Community 2|Community 2]]
- [[_COMMUNITY_Community 3|Community 3]]
- [[_COMMUNITY_Community 4|Community 4]]
- [[_COMMUNITY_Community 5|Community 5]]
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
1. `getStoreSettings()` - 33 edges
2. `getButtonClassName()` - 30 edges
3. `Product` - 24 edges
4. `Button` - 17 edges
5. `compilerOptions` - 16 edges
6. `formatPrice()` - 15 edges
7. `getAllProducts()` - 15 edges
8. `buildImportPreview()` - 14 edges
9. `brandingAssetUrl()` - 14 edges
10. `DesignSystemGenerator` - 11 edges

## Surprising Connections (you probably didn't know these)
- `AdminSettingsPage()` --calls--> `getStoreSettings()`  [EXTRACTED]
  app/admin/settings/page.tsx → lib/store/settings-repository.ts
- `CartPage()` --calls--> `getStoreSettings()`  [EXTRACTED]
  app/cart/page.tsx → lib/store/settings-repository.ts
- `generateMetadata()` --calls--> `getStoreSettings()`  [INFERRED]
  app/products/page.tsx → lib/store/settings-repository.ts
- `SportsHeroProps` --references--> `Product`  [EXTRACTED]
  components/commerce/sports-hero.tsx → types/product.ts
- `ProductCardProps` --references--> `Product`  [EXTRACTED]
  components/product/product-card.tsx → types/product.ts

## Import Cycles
- None detected.

## Communities (18 total, 6 thin omitted)

### Community 0 - "Community 0"
Cohesion: 0.10
Nodes (19): compilerOptions, allowJs, esModuleInterop, incremental, isolatedModules, jsx, lib, module (+11 more)

### Community 1 - "Community 1"
Cohesion: 0.08
Nodes (23): dependencies, framer-motion, next, react, react-dom, sharp, devDependencies, tailwindcss (+15 more)

### Community 2 - "Community 2"
Cohesion: 0.08
Nodes (25): DeleteProductButton(), DeleteProductButtonProps, countProductsByCategory(), AdminCategoriesPage(), metadata, metadata, OrderIntentDemoPage(), colorNameToHex() (+17 more)

### Community 3 - "Community 3"
Cohesion: 0.07
Nodes (44): AdminLoginForm(), AdminPage(), metadata, NavCard(), generateMetadata(), Home(), CartNavLink(), CheckoutPage() (+36 more)

### Community 4 - "Community 4"
Cohesion: 0.07
Nodes (50): confirmImportAction(), parseImportCsvAction(), revalidateCatalog(), applyImport(), mergeVariations(), checkImageUrlHead(), checkProductImageUrls(), CSV_COLUMNS (+42 more)

### Community 5 - "Community 5"
Cohesion: 0.15
Nodes (21): barlowCondensed, generateMetadata(), inter, RootLayout(), viewport, ContatoPage(), generateMetadata(), socialHref() (+13 more)

### Community 7 - "Community 7"
Cohesion: 0.08
Nodes (39): CartContent(), CartContentProps, CartLineItem(), CartLineItemProps, CartPage(), metadata, CartTestClient(), getClientCatalogCache() (+31 more)

### Community 10 - "Community 10"
Cohesion: 0.08
Nodes (43): ImageGalleryField(), ImageGalleryFieldProps, emptyVariation(), ProductForm(), ProductFormProps, productToForm(), VariationRow, createProductAction() (+35 more)

### Community 11 - "Community 11"
Cohesion: 0.24
Nodes (5): NotFound(), CartTestPage(), StatusPage(), StatusPageProps, metadata

### Community 13 - "Community 13"
Cohesion: 0.08
Nodes (41): Icon(), size, SportsHero(), SportsHeroContent, SportsHeroProps, GET(), MIME, AppearancePreview() (+33 more)

### Community 14 - "Community 14"
Cohesion: 0.06
Nodes (40): BM25, detect_domain(), _load_csv(), Lowercase, split, remove punctuation, filter short words, Build BM25 index from documents, Score all documents against query, Load CSV and return list of dicts, Core search function using BM25 (+32 more)

## Knowledge Gaps
- **114 isolated node(s):** `metadata`, `metadata`, `metadata`, `metadata`, `metadata` (+109 more)
  These have ≤1 connection - possible missing edges or undocumented components.
- **6 thin communities (<3 nodes) omitted from report** — run `graphify query` to explore isolated nodes.

## Suggested Questions
_Questions this graph is uniquely positioned to answer:_

- **Why does `Product` connect `Community 10` to `Community 2`, `Community 3`, `Community 4`, `Community 7`, `Community 13`?**
  _High betweenness centrality (0.072) - this node is a cross-community bridge._
- **Why does `getButtonClassName()` connect `Community 3` to `Community 2`, `Community 4`, `Community 7`, `Community 11`, `Community 13`?**
  _High betweenness centrality (0.064) - this node is a cross-community bridge._
- **Why does `getStoreSettings()` connect `Community 5` to `Community 2`, `Community 3`, `Community 13`, `Community 7`?**
  _High betweenness centrality (0.063) - this node is a cross-community bridge._
- **Are the 2 inferred relationships involving `getButtonClassName()` (e.g. with `AdminProductsPage()` and `ProductsPage()`) actually correct?**
  _`getButtonClassName()` has 2 INFERRED edges - model-reasoned connections that need verification._
- **What connects `BM25 ranking algorithm for text search`, `Lowercase, split, remove punctuation, filter short words`, `Build BM25 index from documents` to the rest of the system?**
  _140 weakly-connected nodes found - possible documentation gaps or missing edges._
- **Should `Community 0` be split into smaller, more focused modules?**
  _Cohesion score 0.1 - nodes in this community are weakly interconnected._
- **Should `Community 1` be split into smaller, more focused modules?**
  _Cohesion score 0.08333333333333333 - nodes in this community are weakly interconnected._