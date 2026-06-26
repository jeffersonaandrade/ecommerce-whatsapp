# Graph Report - ecommerce-sports  (2026-06-26)

## Corpus Check
- 307 files · ~99,832 words
- Verdict: corpus is large enough that graph structure adds value.

## Summary
- 1410 nodes · 3507 edges · 72 communities (65 shown, 7 thin omitted)
- Extraction: 99% EXTRACTED · 1% INFERRED · 0% AMBIGUOUS · INFERRED: 38 edges (avg confidence: 0.8)
- Token cost: 0 input · 0 output

## Graph Freshness
- Built from commit: `99860e65`
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
- [[_COMMUNITY_Community 29|Community 29]]
- [[_COMMUNITY_Community 30|Community 30]]
- [[_COMMUNITY_Community 31|Community 31]]
- [[_COMMUNITY_Community 32|Community 32]]
- [[_COMMUNITY_Community 33|Community 33]]
- [[_COMMUNITY_Community 34|Community 34]]
- [[_COMMUNITY_Community 35|Community 35]]
- [[_COMMUNITY_Community 36|Community 36]]
- [[_COMMUNITY_Community 37|Community 37]]
- [[_COMMUNITY_Community 38|Community 38]]
- [[_COMMUNITY_Community 39|Community 39]]
- [[_COMMUNITY_Community 40|Community 40]]
- [[_COMMUNITY_Community 41|Community 41]]
- [[_COMMUNITY_Community 42|Community 42]]
- [[_COMMUNITY_Community 43|Community 43]]
- [[_COMMUNITY_Community 44|Community 44]]
- [[_COMMUNITY_Community 45|Community 45]]
- [[_COMMUNITY_Community 46|Community 46]]
- [[_COMMUNITY_Community 47|Community 47]]
- [[_COMMUNITY_Community 48|Community 48]]
- [[_COMMUNITY_Community 49|Community 49]]
- [[_COMMUNITY_Community 50|Community 50]]
- [[_COMMUNITY_Community 51|Community 51]]
- [[_COMMUNITY_Community 52|Community 52]]
- [[_COMMUNITY_Community 53|Community 53]]
- [[_COMMUNITY_Community 54|Community 54]]
- [[_COMMUNITY_Community 55|Community 55]]
- [[_COMMUNITY_Community 56|Community 56]]
- [[_COMMUNITY_Community 57|Community 57]]
- [[_COMMUNITY_Community 58|Community 58]]
- [[_COMMUNITY_Community 59|Community 59]]
- [[_COMMUNITY_Community 60|Community 60]]
- [[_COMMUNITY_Community 61|Community 61]]
- [[_COMMUNITY_Community 62|Community 62]]
- [[_COMMUNITY_Community 63|Community 63]]
- [[_COMMUNITY_Community 64|Community 64]]
- [[_COMMUNITY_Community 65|Community 65]]
- [[_COMMUNITY_Community 66|Community 66]]
- [[_COMMUNITY_Community 67|Community 67]]
- [[_COMMUNITY_Community 68|Community 68]]
- [[_COMMUNITY_Community 69|Community 69]]
- [[_COMMUNITY_Community 70|Community 70]]

## God Nodes (most connected - your core abstractions)
1. `getButtonClassName()` - 47 edges
2. `requireAdmin()` - 46 edges
3. `getDataProvider()` - 44 edges
4. `getStoreSettings()` - 43 edges
5. `Product` - 34 edges
6. `Category` - 25 edges
7. `getProductRepository()` - 23 edges
8. `createAdminClient()` - 23 edges
9. `Button` - 21 edges
10. `generateCategorySlug()` - 21 edges

## Surprising Connections (you probably didn't know these)
- `generateMetadata()` --calls--> `getBannerRepository()`  [INFERRED]
  app/admin/banners/[id]/page.tsx → lib/banners/get-banner-repository.ts
- `AdminEditCategoryPage()` --calls--> `getAllProductsAdmin()`  [INFERRED]
  app/admin/categories/[id]/edit/page.tsx → lib/products.ts
- `generateMetadata()` --calls--> `getBenefitItemById()`  [INFERRED]
  app/admin/content/benefits/[id]/page.tsx → lib/benefits/index.ts
- `NewBenefitPage()` --calls--> `getDataProvider()`  [INFERRED]
  app/admin/content/benefits/new/page.tsx → lib/data/provider.ts
- `AdminProductsPage()` --calls--> `getButtonClassName()`  [INFERRED]
  app/admin/products/page.tsx → components/ui/button.tsx

## Import Cycles
- None detected.

## Communities (72 total, 7 thin omitted)

### Community 0 - "Community 0"
Cohesion: 0.10
Nodes (19): compilerOptions, allowJs, esModuleInterop, incremental, isolatedModules, jsx, lib, module (+11 more)

### Community 1 - "Community 1"
Cohesion: 0.05
Nodes (42): dependencies, clsx, framer-motion, headroom-ai, lucide-react, next, react, react-dom (+34 more)

### Community 2 - "Community 2"
Cohesion: 0.17
Nodes (20): Icon(), size, categoryImageFilename(), CONTENT_TYPES, deleteCategoryImage(), writeCategoryImage(), GET(), MIME (+12 more)

### Community 3 - "Community 3"
Cohesion: 0.09
Nodes (24): AdminListPage(), AdminListPageProps, AdminPagination(), AdminPaginationProps, FilterBar(), FilterBarProps, SearchBar(), SearchBarProps (+16 more)

### Community 4 - "Community 4"
Cohesion: 0.13
Nodes (24): CSV_COLUMNS, REQUIRED_HEADERS, importCategories, TEMPLATE_PATH, findConflictingProductRows(), groupRowsBySlug(), mapVariationAttributes(), parseCategory() (+16 more)

### Community 5 - "Community 5"
Cohesion: 0.25
Nodes (13): generateMetadata(), ContatoPage(), generateMetadata(), socialHref(), buildInstitutionalMetadata(), InstitutionalPage(), InstitutionalPageProps, generateMetadata() (+5 more)

### Community 7 - "Community 7"
Cohesion: 0.06
Nodes (55): ProductsTable(), ProductsTableProps, CartContent(), CartContentProps, CartLineItem(), CartLineItemProps, CartTestClient(), CartTestPage() (+47 more)

### Community 8 - "Community 8"
Cohesion: 0.33
Nodes (5): nextConfig, supabaseProductsPattern, buildContentSecurityPolicy(), SECURITY_HEADERS, supabaseHost()

### Community 10 - "Community 10"
Cohesion: 0.17
Nodes (19): buildProduct(), jsonProductRepository, nextProductId(), ProductInput, ProductRepository, assignVariationIds(), slugifyUnique(), ProductRow (+11 more)

### Community 11 - "Community 11"
Cohesion: 0.18
Nodes (13): AdminAccessButton(), AdminLoginForm(), DemoAdminToolbar(), clearDemoAdminFlag(), DEMO_ADMIN_CREDENTIALS, hasDemoAdminSession(), notifyDemoSessionChange(), setDemoAdminFlag() (+5 more)

### Community 12 - "Community 12"
Cohesion: 0.05
Nodes (63): bulkSetProductImagesAction(), exportMediaMapCsvAction(), revalidateMediaPaths(), setProductImagesAction(), classifyProductImagesInitial(), extractProductsStoragePath(), isProductsStorageUrl(), matchesMediaFilter() (+55 more)

### Community 13 - "Community 13"
Cohesion: 0.20
Nodes (14): { mockRequireAdmin, mockGetStoreSettings, mockUpdateStoreSettings, mockSaveHero, mockGenerateBranding }, getSettingsRepository(), jsonSettingsRepository, createDefaultStoreSettings(), isValidHexColor(), mergeStoreSettings(), normalizeColor(), StoreSettingsRepository (+6 more)

### Community 14 - "Community 14"
Cohesion: 0.06
Nodes (40): BM25, detect_domain(), _load_csv(), Lowercase, split, remove punctuation, filter short words, Build BM25 index from documents, Score all documents against query, Load CSV and return list of dicts, Core search function using BM25 (+32 more)

### Community 15 - "Community 15"
Cohesion: 0.06
Nodes (54): BenefitForm(), BenefitFormProps, BenefitsSectionForm(), BenefitsSectionFormProps, ReorderBenefitButtons(), ToggleBenefitActiveButton(), generateMetadata(), metadata (+46 more)

### Community 20 - "Community 20"
Cohesion: 0.07
Nodes (51): BannerSlideForm(), BannerSlideFormProps, ReorderBannerButtons(), ToggleBannerActiveButton(), generateMetadata(), metadata, requireAdmin(), createBannerSlideAction() (+43 more)

### Community 21 - "Community 21"
Cohesion: 0.31
Nodes (3): StatusPage(), StatusPageProps, metadata

### Community 23 - "Community 23"
Cohesion: 0.11
Nodes (36): COLOR_ALIASES, COLOR_PATTERN, extractCanonicalColors(), hasColorConflict(), normalizeProductName(), normalizeRelativePath(), splitPipeList(), buildNameIndex() (+28 more)

### Community 24 - "Community 24"
Cohesion: 0.12
Nodes (25): AdminPage(), metadata, metadata, NotFound(), categories, clubs, mockProducts, EditProductPage() (+17 more)

### Community 25 - "Community 25"
Cohesion: 0.14
Nodes (22): VariationInput, deriveShortDescription(), deriveShortFromHtml(), stripHtml(), baseProduct, validInput, applyImport(), ApplyImportOptions (+14 more)

### Community 26 - "Community 26"
Cohesion: 0.08
Nodes (26): buildLegacyMeta(), byScrapedSlug, csv, getVariationSize(), HEADERS, IMAGES_ROOT, importLines, isPersonalizationValue() (+18 more)

### Community 28 - "Community 28"
Cohesion: 0.17
Nodes (21): CategoryForm(), CategoryFormProps, categoryToForm(), metadata, CategoryFormPayload, createCategoryAction(), deleteCategoryAction(), removeCategoryImageAction() (+13 more)

### Community 29 - "Community 29"
Cohesion: 0.23
Nodes (19): CategoryRepository, CategoryValidationError, generateCategorySlug(), isStorefrontCategoryEntity(), isValidCategorySlug(), normalizeCategorySlug(), productMatchesCategoryFilter(), resolveCategoryParam() (+11 more)

### Community 30 - "Community 30"
Cohesion: 0.17
Nodes (19): HeaderBrandMark(), HeaderBrandMarkProps, headerBrandPreviewClasses(), AppearancePreview(), AppearancePreviewProps, BRANDING_ALIASES, BRANDING_ICON_FILES, brandingAssetUrl() (+11 more)

### Community 31 - "Community 31"
Cohesion: 0.09
Nodes (22): buildLegacyPriceIndex(), byScrapedSlug, headers, importLines, isPersonalizationValue(), leafCategory(), LEGACY, legacyPriceIndex (+14 more)

### Community 32 - "Community 32"
Cohesion: 0.15
Nodes (21): buildHeaderLogoWebp(), FAVICON_SIZES, generateBrandingAssets(), resizeContainedSquare(), brandingDir, copyDir(), copyFile(), deployDir (+13 more)

### Community 33 - "Community 33"
Cohesion: 0.18
Nodes (17): BulkActionsBar(), BulkActionsBarProps, DeleteProductButton(), DeleteProductButtonProps, { mockRequireAdmin }, bulkDeleteProductsAction(), bulkSetProductCategoryAction(), bulkSetProductStatusAction() (+9 more)

### Community 34 - "Community 34"
Cohesion: 0.17
Nodes (14): NavCard(), CartNavLink(), CartPage(), metadata, CheckoutPage(), metadata, AdminImportPage(), metadata (+6 more)

### Community 35 - "Community 35"
Cohesion: 0.10
Nodes (15): candidates, excludedAfterVisualReview, firstUrlUsage, importBySlug, importOrder, importRows, inventoryByFirstUrl, inventoryRows (+7 more)

### Community 36 - "Community 36"
Cohesion: 0.19
Nodes (14): CATEGORIES_PATH, ensureStorage(), loadCategoriesFromDisk(), persistCategories(), readFromDisk(), STORAGE_DIR, writeToDisk(), buildCategory() (+6 more)

### Community 37 - "Community 37"
Cohesion: 0.15
Nodes (15): csvE2e, csvValid, env, hero, login(), png, record(), report (+7 more)

### Community 38 - "Community 38"
Cohesion: 0.12
Nodes (14): admin, buildHeaderLogoWebp(), containBright, coverBright, env, failed, generateBrandingLikeServer(), logoPath (+6 more)

### Community 39 - "Community 39"
Cohesion: 0.16
Nodes (16): args, argv, buildStoragePath(), dryRunPath, main(), mdReportPath, mimeFor(), publicUrl() (+8 more)

### Community 40 - "Community 40"
Cohesion: 0.25
Nodes (14): StoreSettingsFormProps, getStoreSettingsAction(), restoreDefaultStorefrontAction(), revalidateStore(), updateStoreSettingsAction(), uploadHeroImageAction(), uploadStoreLogoAction(), readDefaultStorefrontHeroBuffer() (+6 more)

### Community 41 - "Community 41"
Cohesion: 0.20
Nodes (11): categoryProductsHref(), isStorefrontCategory(), isStorefrontTestResidue(), PRODUCTS_HREF_PRESERVED_PARAMS, resolveStorefrontCategories(), sampleCategories, getStorefrontVisibility(), StorefrontVisibility (+3 more)

### Community 42 - "Community 42"
Cohesion: 0.23
Nodes (11): categoryImageUrl(), hasStorefrontCategoryImages(), cardRing(), CategoryAllCard(), CategoryAllCardProps, CategoryCardImage(), CategoryVisualCard(), CategoryVisualCardProps (+3 more)

### Community 43 - "Community 43"
Cohesion: 0.22
Nodes (9): Home(), resolveStorefrontCategoryList(), BannerCarousel(), SportsHero(), SportsHeroContent, SportsHeroProps, getFeaturedProducts(), pickHomeProductSections() (+1 more)

### Community 44 - "Community 44"
Cohesion: 0.21
Nodes (9): canonicalImportSlug(), prepareImportBatch(), applySupabaseImport(), ApplySupabaseImportOptions, buildRpcPayload(), ImportRpcResult, ImportApplyResult, ParsedProduct (+1 more)

### Community 45 - "Community 45"
Cohesion: 0.20
Nodes (11): Filter, ImportPreviewTable(), ImportPreviewTableProps, STATUS_LABEL, ImportWizard(), ImportWizardProps, POLICY_LABEL, WizardStep (+3 more)

### Community 46 - "Community 46"
Cohesion: 0.26
Nodes (11): emptyVariation(), ProductForm(), ProductFormProps, productToForm(), VariationRow, visibilityBannerClass(), defaultCategorySlug(), isKnownCategoryValue() (+3 more)

### Community 47 - "Community 47"
Cohesion: 0.27
Nodes (11): isCategoryFilterActive(), productsPageHref(), resolveCategoryHeading(), ProductsCategoryChips(), ProductsCategoryChipsProps, ProductsCategoryFilter(), fallbackCategoriesFromSiteConfig(), getStorefrontCategories() (+3 more)

### Community 48 - "Community 48"
Cohesion: 0.24
Nodes (8): RequireAdminResult, { mockGetUser, mockCreateClient, mockGetDataProvider }, getBrandingAssetPublicUrl(), getBrandingPublicUrl(), getSupabaseAnonKey(), getSupabaseUrl(), readPublicSupabaseKey(), createServerSupabaseClient()

### Community 49 - "Community 49"
Cohesion: 0.15
Nodes (7): admin, baselineAfter, baselineBefore, env, results, root, touched

### Community 50 - "Community 50"
Cohesion: 0.19
Nodes (10): BRANDING_LOGO_FILENAMES, BRANDING_SOURCE_DIR, readBrandingLogoSourceBuffer(), resolveBrandingLogoSourcePath(), root, DefaultStorefrontVisualPreset, getDefaultStorefrontVisualPreset(), presetDir (+2 more)

### Community 51 - "Community 51"
Cohesion: 0.35
Nodes (9): confirmImportAction(), logImportParse(), parseImportCsvAction(), revalidateCatalog(), countUniqueImageUrls(), formatImportSizeLimit(), buildImportPreview(), validateCatalogSkus() (+1 more)

### Community 52 - "Community 52"
Cohesion: 0.33
Nodes (8): getCategoryBySlug(), CategoryFilters, CategoryQuery, CategoryQueryResult, ProductFilters, ProductQueryResult, ProductSort, QueryPagination

### Community 53 - "Community 53"
Cohesion: 0.27
Nodes (11): brandingDir, loadJson(), main(), mimeFor(), productToRow(), requireEnv(), root, storageDir (+3 more)

### Community 54 - "Community 54"
Cohesion: 0.23
Nodes (11): BRANDING_DIR, DEFAULT_SETTINGS, ensureStorage(), getBrandingFilePath(), loadStoreSettingsFromDisk(), persistStoreSettings(), readFromDisk(), SEED_PATH (+3 more)

### Community 55 - "Community 55"
Cohesion: 0.18
Nodes (5): csv, env, png, results, root

### Community 56 - "Community 56"
Cohesion: 0.31
Nodes (7): MoneyInput, MoneyInputHandle, MoneyInputProps, BRL_DISPLAY, formatBrlMoneyInput(), parseBrlMoney(), reaisToCentsDigits()

### Community 57 - "Community 57"
Cohesion: 0.24
Nodes (8): barlowCondensed, generateMetadata(), inter, RootLayout(), viewport, CartProvider(), Footer(), socialHref()

### Community 58 - "Community 58"
Cohesion: 0.29
Nodes (8): CATALOG_PATH, ensureStorage(), loadCatalogFromDisk(), persistCatalog(), readFromDisk(), SEED_PATH, STORAGE_DIR, writeToDisk()

### Community 59 - "Community 59"
Cohesion: 0.29
Nodes (7): errorsToFieldMap(), formatProductValidationError(), MESSAGE_FIELD_HINTS, normalizeProductErrors(), PRODUCT_FIELD_LABELS, productFieldLabel(), ProductValidationError

### Community 60 - "Community 60"
Cohesion: 0.31
Nodes (8): loadEnv(), loginAdmin(), main(), outDir, record(), report, reportPath, root

### Community 61 - "Community 61"
Cohesion: 0.31
Nodes (7): checkSecurityHeaders(), env, record(), report, root, smokeAdmin(), smokePublic()

### Community 62 - "Community 62"
Cohesion: 0.32
Nodes (6): ALLOWED_TYPES, ImageGalleryField(), ImageGalleryFieldProps, moveImageToPosition(), uploadProductImageAction, UploadProgress

### Community 63 - "Community 63"
Cohesion: 0.39
Nodes (4): validateProductImageUrlsLocal(), ImportIssue, isAllowedImportImageUrl(), PRIVATE_HOST_PATTERNS

### Community 64 - "Community 64"
Cohesion: 0.38
Nodes (5): mimeToExt(), uploadProductImageAction(), buildProductImageFilename(), CONTENT_TYPES, writeProductImage()

### Community 65 - "Community 65"
Cohesion: 0.29
Nodes (4): outPath, products, root, settings

### Community 66 - "Community 66"
Cohesion: 0.33
Nodes (5): categories, mockCreateProductAction, mockPush, mockRefresh, mockUpdateProductAction

### Community 67 - "Community 67"
Cohesion: 0.33
Nodes (3): env, logoPath, root

### Community 68 - "Community 68"
Cohesion: 0.33
Nodes (4): allResponses, env, logoPath, root

### Community 69 - "Community 69"
Cohesion: 0.50
Nodes (3): env, root, supabase

## Knowledge Gaps
- **372 isolated node(s):** `mapRows`, `inventoryRows`, `importRows`, `importBySlug`, `importOrder` (+367 more)
  These have ≤1 connection - possible missing edges or undocumented components.
- **7 thin communities (<3 nodes) omitted from report** — run `graphify query` to explore isolated nodes.

## Suggested Questions
_Questions this graph is uniquely positioned to answer:_

- **Why does `getButtonClassName()` connect `Community 34` to `Community 33`, `Community 3`, `Community 7`, `Community 40`, `Community 41`, `Community 42`, `Community 11`, `Community 43`, `Community 45`, `Community 12`, `Community 47`, `Community 15`, `Community 20`, `Community 21`, `Community 24`?**
  _High betweenness centrality (0.047) - this node is a cross-community bridge._
- **Why does `requireAdmin()` connect `Community 20` to `Community 64`, `Community 33`, `Community 40`, `Community 12`, `Community 15`, `Community 48`, `Community 51`, `Community 28`?**
  _High betweenness centrality (0.044) - this node is a cross-community bridge._
- **Why does `getStoreSettings()` connect `Community 5` to `Community 2`, `Community 34`, `Community 7`, `Community 40`, `Community 43`, `Community 13`, `Community 15`, `Community 47`, `Community 51`, `Community 20`, `Community 54`, `Community 57`?**
  _High betweenness centrality (0.025) - this node is a cross-community bridge._
- **Are the 2 inferred relationships involving `getButtonClassName()` (e.g. with `AdminProductsPage()` and `ProductsPage()`) actually correct?**
  _`getButtonClassName()` has 2 INFERRED edges - model-reasoned connections that need verification._
- **Are the 2 inferred relationships involving `getDataProvider()` (e.g. with `EditBenefitPage()` and `NewBenefitPage()`) actually correct?**
  _`getDataProvider()` has 2 INFERRED edges - model-reasoned connections that need verification._
- **What connects `mapRows`, `inventoryRows`, `importRows` to the rest of the system?**
  _398 weakly-connected nodes found - possible documentation gaps or missing edges._
- **Should `Community 0` be split into smaller, more focused modules?**
  _Cohesion score 0.1 - nodes in this community are weakly interconnected._