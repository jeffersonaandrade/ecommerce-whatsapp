# Graph Report - .  (2026-06-24)

## Corpus Check
- cluster-only mode — file stats not available

## Summary
- 156 nodes · 304 edges · 10 communities (8 shown, 2 thin omitted)
- Extraction: 99% EXTRACTED · 1% INFERRED · 0% AMBIGUOUS · INFERRED: 3 edges (avg confidence: 0.8)
- Token cost: 0 input · 0 output

## Graph Freshness
- Built from commit: `bbe0007a`
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

## God Nodes (most connected - your core abstractions)
1. `compilerOptions` - 16 edges
2. `Button` - 14 edges
3. `useCart()` - 10 edges
4. `resolveCartLines()` - 10 edges
5. `formatPrice()` - 10 edges
6. `getAllProducts()` - 9 edges
7. `Product` - 9 edges
8. `mockProducts` - 7 edges
9. `scripts` - 6 edges
10. `CartContent()` - 5 edges

## Surprising Connections (you probably didn't know these)
- `AdminProductsPage()` --calls--> `getAllProducts()`  [INFERRED]
  app/admin/products/page.tsx → lib/products.ts
- `ProductCardProps` --references--> `Product`  [EXTRACTED]
  components/product/product-card.tsx → types/product.ts
- `ProductPurchasePanelProps` --references--> `Product`  [EXTRACTED]
  components/product/product-purchase-panel.tsx → types/product.ts
- `AdminPage()` --calls--> `getAllProducts()`  [EXTRACTED]
  app/admin/page.tsx → lib/products.ts
- `CartTestClient()` --calls--> `useCart()`  [EXTRACTED]
  app/dev/cart-test/cart-test-client.tsx → context/cart-context.tsx

## Import Cycles
- None detected.

## Communities (10 total, 2 thin omitted)

### Community 0 - "Community 0"
Cohesion: 0.10
Nodes (19): compilerOptions, allowJs, esModuleInterop, incremental, isolatedModules, jsx, lib, module (+11 more)

### Community 1 - "Community 1"
Cohesion: 0.09
Nodes (21): dependencies, next, react, react-dom, devDependencies, tailwindcss, @tailwindcss/postcss, @types/node (+13 more)

### Community 2 - "Community 2"
Cohesion: 0.18
Nodes (9): CartContent(), CartLineItem(), CartNavLink(), metadata, metadata, useCart(), metadata, Button (+1 more)

### Community 3 - "Community 3"
Cohesion: 0.13
Nodes (20): AdminPage(), metadata, metadata, Home(), metadata, SportsHero(), categories, clubs (+12 more)

### Community 4 - "Community 4"
Cohesion: 0.36
Nodes (5): metadata, viewport, siteConfig, Footer(), Header()

### Community 5 - "Community 5"
Cohesion: 0.17
Nodes (12): colorNameToHex(), calculateDiscount(), formatPrice(), getProductBySlug(), metadata, ProductCard(), ProductCardProps, generateMetadata() (+4 more)

### Community 7 - "Community 7"
Cohesion: 0.13
Nodes (20): CartTestClient(), CartContext, CartContextValue, CartProvider(), sanitizeItems(), loadCartItems(), saveCartItems(), calculateItemCount() (+12 more)

## Knowledge Gaps
- **57 isolated node(s):** `metadata`, `metadata`, `metadata`, `metadata`, `metadata` (+52 more)
  These have ≤1 connection - possible missing edges or undocumented components.
- **2 thin communities (<3 nodes) omitted from report** — run `graphify query` to explore isolated nodes.

## Suggested Questions
_Questions this graph is uniquely positioned to answer:_

- **Why does `Button` connect `Community 2` to `Community 3`, `Community 4`, `Community 5`, `Community 7`?**
  _High betweenness centrality (0.061) - this node is a cross-community bridge._
- **Why does `useCart()` connect `Community 2` to `Community 7`?**
  _High betweenness centrality (0.017) - this node is a cross-community bridge._
- **What connects `metadata`, `metadata`, `metadata` to the rest of the system?**
  _57 weakly-connected nodes found - possible documentation gaps or missing edges._
- **Should `Community 0` be split into smaller, more focused modules?**
  _Cohesion score 0.1 - nodes in this community are weakly interconnected._
- **Should `Community 1` be split into smaller, more focused modules?**
  _Cohesion score 0.09090909090909091 - nodes in this community are weakly interconnected._
- **Should `Community 3` be split into smaller, more focused modules?**
  _Cohesion score 0.1310344827586207 - nodes in this community are weakly interconnected._
- **Should `Community 7` be split into smaller, more focused modules?**
  _Cohesion score 0.12643678160919541 - nodes in this community are weakly interconnected._