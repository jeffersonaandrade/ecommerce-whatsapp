# Graph Report - ecommerce-sports  (2026-06-25)

## Corpus Check
- 120 files · ~31,334 words
- Verdict: corpus is large enough that graph structure adds value.

## Summary
- 542 nodes · 1250 edges · 20 communities (14 shown, 6 thin omitted)
- Extraction: 99% EXTRACTED · 1% INFERRED · 0% AMBIGUOUS · INFERRED: 13 edges (avg confidence: 0.8)
- Token cost: 0 input · 0 output

## Graph Freshness
- Built from commit: `a79739e0`
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
- [[_COMMUNITY_Community 12|Community 12]]
- [[_COMMUNITY_Community 13|Community 13]]
- [[_COMMUNITY_Community 14|Community 14]]
- [[_COMMUNITY_Community 15|Community 15]]
- [[_COMMUNITY_Community 16|Community 16]]
- [[_COMMUNITY_Community 17|Community 17]]
- [[_COMMUNITY_Community 18|Community 18]]
- [[_COMMUNITY_Community 19|Community 19]]

## God Nodes (most connected - your core abstractions)
1. `getStoreSettings()` - 33 edges
2. `getButtonClassName()` - 32 edges
3. `Product` - 24 edges
4. `Button` - 17 edges
5. `brandingAssetUrl()` - 17 edges
6. `compilerOptions` - 16 edges
7. `formatPrice()` - 15 edges
8. `getAllProducts()` - 15 edges
9. `buildImportPreview()` - 14 edges
10. `DesignSystemGenerator` - 11 edges

## Surprising Connections (you probably didn't know these)
- `NavCard()` --calls--> `getButtonClassName()`  [EXTRACTED]
  app/admin/page.tsx → components/ui/button.tsx
- `AdminProductsPage()` --calls--> `getButtonClassName()`  [INFERRED]
  app/admin/products/page.tsx → components/ui/button.tsx
- `AdminSettingsPage()` --calls--> `getStoreSettings()`  [EXTRACTED]
  app/admin/settings/page.tsx → lib/store/settings-repository.ts
- `generateMetadata()` --calls--> `buildPageMetadata()`  [INFERRED]
  app/products/page.tsx → lib/store/build-metadata.ts
- `generateMetadata()` --calls--> `getStoreSettings()`  [INFERRED]
  app/products/page.tsx → lib/store/settings-repository.ts

## Import Cycles
- None detected.

## Communities (20 total, 6 thin omitted)

### Community 0 - "Community 0"
Cohesion: 0.10
Nodes (19): compilerOptions, allowJs, esModuleInterop, incremental, isolatedModules, jsx, lib, module (+11 more)

### Community 1 - "Community 1"
Cohesion: 0.08
Nodes (24): dependencies, framer-motion, next, react, react-dom, sharp, devDependencies, tailwindcss (+16 more)

### Community 2 - "Community 2"
Cohesion: 0.12
Nodes (19): SportsHero(), SportsHeroContent, SportsHeroProps, colorNameToHex(), colorSwatchBorderClass(), LIGHT_SWATCH_HEX, calculateDiscount(), getProductBySlug() (+11 more)

### Community 3 - "Community 3"
Cohesion: 0.10
Nodes (31): DemoLogoutButton(), AdminPage(), metadata, NavCard(), Home(), countProductsByCategory(), AdminCategoriesPage(), metadata (+23 more)

### Community 4 - "Community 4"
Cohesion: 0.08
Nodes (43): confirmImportAction(), parseImportCsvAction(), revalidateCatalog(), checkImageUrlHead(), checkProductImageUrls(), CSV_COLUMNS, REQUIRED_HEADERS, Filter (+35 more)

### Community 5 - "Community 5"
Cohesion: 0.12
Nodes (24): barlowCondensed, generateMetadata(), inter, RootLayout(), viewport, generateMetadata(), CartPage(), HomeCategories() (+16 more)

### Community 7 - "Community 7"
Cohesion: 0.08
Nodes (38): CartContent(), CartContentProps, CartLineItem(), CartLineItemProps, CartTestClient(), getClientCatalogCache(), setCatalogCache(), CartContext (+30 more)

### Community 10 - "Community 10"
Cohesion: 0.07
Nodes (52): DeleteProductButton(), DeleteProductButtonProps, ImageGalleryField(), emptyVariation(), ProductForm(), ProductFormProps, productToForm(), VariationRow (+44 more)

### Community 11 - "Community 11"
Cohesion: 0.07
Nodes (27): AdminAccessButton(), AdminLoginForm(), clearDemoAdminFlag(), DEMO_ADMIN_CREDENTIALS, hasDemoAdminSession(), setDemoAdminFlag(), ImageGalleryFieldProps, NotFound() (+19 more)

### Community 12 - "Community 12"
Cohesion: 0.18
Nodes (11): brandingDir, catalogPath, catalogSeed, copyDir(), copyFile(), deployDir, root, settings (+3 more)

### Community 13 - "Community 13"
Cohesion: 0.08
Nodes (47): Icon(), size, GET(), MIME, AppearancePreview(), AppearancePreviewProps, AdminSettingsPage(), metadata (+39 more)

### Community 14 - "Community 14"
Cohesion: 0.06
Nodes (40): BM25, detect_domain(), _load_csv(), Lowercase, split, remove punctuation, filter short words, Build BM25 index from documents, Score all documents against query, Load CSV and return list of dicts, Core search function using BM25 (+32 more)

### Community 15 - "Community 15"
Cohesion: 0.33
Nodes (5): fileBuffer, fs, path, saveHeroImage(), sharp

## Knowledge Gaps
- **128 isolated node(s):** `metadata`, `metadata`, `metadata`, `metadata`, `metadata` (+123 more)
  These have ≤1 connection - possible missing edges or undocumented components.
- **6 thin communities (<3 nodes) omitted from report** — run `graphify query` to explore isolated nodes.

## Suggested Questions
_Questions this graph is uniquely positioned to answer:_

- **Why does `getButtonClassName()` connect `Community 11` to `Community 2`, `Community 3`, `Community 4`, `Community 5`, `Community 7`, `Community 13`?**
  _High betweenness centrality (0.065) - this node is a cross-community bridge._
- **Why does `Product` connect `Community 10` to `Community 2`, `Community 3`, `Community 4`, `Community 7`?**
  _High betweenness centrality (0.065) - this node is a cross-community bridge._
- **Why does `getStoreSettings()` connect `Community 5` to `Community 11`, `Community 2`, `Community 3`, `Community 13`?**
  _High betweenness centrality (0.050) - this node is a cross-community bridge._
- **Are the 2 inferred relationships involving `getButtonClassName()` (e.g. with `AdminProductsPage()` and `ProductsPage()`) actually correct?**
  _`getButtonClassName()` has 2 INFERRED edges - model-reasoned connections that need verification._
- **What connects `BM25 ranking algorithm for text search`, `Lowercase, split, remove punctuation, filter short words`, `Build BM25 index from documents` to the rest of the system?**
  _154 weakly-connected nodes found - possible documentation gaps or missing edges._
- **Should `Community 0` be split into smaller, more focused modules?**
  _Cohesion score 0.1 - nodes in this community are weakly interconnected._
- **Should `Community 1` be split into smaller, more focused modules?**
  _Cohesion score 0.08 - nodes in this community are weakly interconnected._