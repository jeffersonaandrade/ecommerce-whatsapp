# Graph Report - ecommerce-sports  (2026-06-25)

## Corpus Check
- 152 files · ~37,707 words
- Verdict: corpus is large enough that graph structure adds value.

## Summary
- 666 nodes · 1566 edges · 29 communities (21 shown, 8 thin omitted)
- Extraction: 99% EXTRACTED · 1% INFERRED · 0% AMBIGUOUS · INFERRED: 13 edges (avg confidence: 0.8)
- Token cost: 0 input · 0 output

## Graph Freshness
- Built from commit: `16b796ab`
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
- [[_COMMUNITY_Community 20|Community 20]]
- [[_COMMUNITY_Community 21|Community 21]]
- [[_COMMUNITY_Community 22|Community 22]]
- [[_COMMUNITY_Community 23|Community 23]]
- [[_COMMUNITY_Community 24|Community 24]]
- [[_COMMUNITY_Community 25|Community 25]]
- [[_COMMUNITY_Community 26|Community 26]]
- [[_COMMUNITY_Community 28|Community 28]]

## God Nodes (most connected - your core abstractions)
1. `getStoreSettings()` - 34 edges
2. `getButtonClassName()` - 32 edges
3. `Product` - 26 edges
4. `getDataProvider()` - 18 edges
5. `Button` - 17 edges
6. `brandingAssetUrl()` - 17 edges
7. `requireAdmin()` - 16 edges
8. `compilerOptions` - 16 edges
9. `formatPrice()` - 15 edges
10. `getAllProducts()` - 15 edges

## Surprising Connections (you probably didn't know these)
- `AdminSettingsPage()` --calls--> `getStoreSettings()`  [EXTRACTED]
  app/admin/settings/page.tsx → lib/store/settings-repository.ts
- `generateMetadata()` --calls--> `buildPageMetadata()`  [INFERRED]
  app/products/page.tsx → lib/store/build-metadata.ts
- `SportsHeroProps` --references--> `Product`  [EXTRACTED]
  components/commerce/sports-hero.tsx → types/product.ts
- `ProductCardProps` --references--> `Product`  [EXTRACTED]
  components/product/product-card.tsx → types/product.ts
- `ProductPurchasePanelProps` --references--> `Product`  [EXTRACTED]
  components/product/product-purchase-panel.tsx → types/product.ts

## Import Cycles
- None detected.

## Communities (29 total, 8 thin omitted)

### Community 0 - "Community 0"
Cohesion: 0.10
Nodes (19): compilerOptions, allowJs, esModuleInterop, incremental, isolatedModules, jsx, lib, module (+11 more)

### Community 1 - "Community 1"
Cohesion: 0.07
Nodes (27): dependencies, framer-motion, next, react, react-dom, sharp, @supabase/ssr, @supabase/supabase-js (+19 more)

### Community 2 - "Community 2"
Cohesion: 0.07
Nodes (52): DeleteProductButton(), DeleteProductButtonProps, Icon(), size, requireAdmin(), RequireAdminResult, { mockGetUser, mockCreateClient, mockGetDataProvider }, { mockRequireAdmin } (+44 more)

### Community 3 - "Community 3"
Cohesion: 0.07
Nodes (44): AdminPage(), metadata, NavCard(), Home(), CartNavLink(), countProductsByCategory(), AdminCategoriesPage(), metadata (+36 more)

### Community 4 - "Community 4"
Cohesion: 0.08
Nodes (43): confirmImportAction(), revalidateCatalog(), checkImageUrlHead(), checkProductImageUrls(), CSV_COLUMNS, REQUIRED_HEADERS, analyzeCSV(), CsvTestReport (+35 more)

### Community 5 - "Community 5"
Cohesion: 0.12
Nodes (24): barlowCondensed, generateMetadata(), inter, RootLayout(), viewport, generateMetadata(), CartPage(), metadata (+16 more)

### Community 7 - "Community 7"
Cohesion: 0.06
Nodes (51): CartContent(), CartContentProps, CartLineItem(), CartLineItemProps, CartTestClient(), getClientCatalogCache(), setCatalogCache(), CartContext (+43 more)

### Community 10 - "Community 10"
Cohesion: 0.10
Nodes (39): CATALOG_PATH, ensureStorage(), loadCatalogFromDisk(), persistCatalog(), readFromDisk(), SEED_PATH, STORAGE_DIR, writeToDisk() (+31 more)

### Community 11 - "Community 11"
Cohesion: 0.18
Nodes (13): AdminAccessButton(), AdminLoginForm(), DemoAdminToolbar(), clearDemoAdminFlag(), DEMO_ADMIN_CREDENTIALS, hasDemoAdminSession(), notifyDemoSessionChange(), setDemoAdminFlag() (+5 more)

### Community 12 - "Community 12"
Cohesion: 0.18
Nodes (11): brandingDir, catalogPath, catalogSeed, copyDir(), copyFile(), deployDir, root, settings (+3 more)

### Community 13 - "Community 13"
Cohesion: 0.09
Nodes (42): AppearancePreview(), AppearancePreviewProps, AdminSettingsPage(), metadata, StoreSettingsForm(), StoreSettingsFormProps, revalidateStore(), updateStoreSettingsAction() (+34 more)

### Community 14 - "Community 14"
Cohesion: 0.06
Nodes (40): BM25, detect_domain(), _load_csv(), Lowercase, split, remove punctuation, filter short words, Build BM25 index from documents, Score all documents against query, Load CSV and return list of dicts, Core search function using BM25 (+32 more)

### Community 15 - "Community 15"
Cohesion: 0.15
Nodes (7): admin, baselineAfter, baselineBefore, env, results, root, touched

### Community 20 - "Community 20"
Cohesion: 0.27
Nodes (11): brandingDir, loadJson(), main(), mimeFor(), productToRow(), requireEnv(), root, storageDir (+3 more)

### Community 21 - "Community 21"
Cohesion: 0.09
Nodes (21): ALLOWED_TYPES, ImageGalleryField(), ImageGalleryFieldProps, emptyVariation(), ProductForm(), ProductFormProps, productToForm(), VariationRow (+13 more)

### Community 24 - "Community 24"
Cohesion: 0.29
Nodes (4): outPath, products, root, settings

### Community 25 - "Community 25"
Cohesion: 0.50
Nodes (3): env, root, supabase

### Community 26 - "Community 26"
Cohesion: 0.40
Nodes (4): playwright, supabase, npx, @playwright/mcp

### Community 28 - "Community 28"
Cohesion: 0.18
Nodes (5): csv, env, png, results, root

## Knowledge Gaps
- **159 isolated node(s):** `supabase`, `npx`, `@playwright/mcp`, `supabase`, `metadata` (+154 more)
  These have ≤1 connection - possible missing edges or undocumented components.
- **8 thin communities (<3 nodes) omitted from report** — run `graphify query` to explore isolated nodes.

## Suggested Questions
_Questions this graph is uniquely positioned to answer:_

- **Why does `getButtonClassName()` connect `Community 3` to `Community 4`, `Community 7`, `Community 11`, `Community 13`, `Community 21`?**
  _High betweenness centrality (0.048) - this node is a cross-community bridge._
- **Why does `Product` connect `Community 10` to `Community 3`, `Community 4`, `Community 21`, `Community 7`?**
  _High betweenness centrality (0.046) - this node is a cross-community bridge._
- **Why does `getStoreSettings()` connect `Community 5` to `Community 2`, `Community 3`, `Community 13`, `Community 7`?**
  _High betweenness centrality (0.038) - this node is a cross-community bridge._
- **Are the 2 inferred relationships involving `getButtonClassName()` (e.g. with `AdminProductsPage()` and `ProductsPage()`) actually correct?**
  _`getButtonClassName()` has 2 INFERRED edges - model-reasoned connections that need verification._
- **What connects `supabase`, `npx`, `@playwright/mcp` to the rest of the system?**
  _185 weakly-connected nodes found - possible documentation gaps or missing edges._
- **Should `Community 0` be split into smaller, more focused modules?**
  _Cohesion score 0.1 - nodes in this community are weakly interconnected._
- **Should `Community 1` be split into smaller, more focused modules?**
  _Cohesion score 0.07142857142857142 - nodes in this community are weakly interconnected._