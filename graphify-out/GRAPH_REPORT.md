# Graph Report - ecommerce-sports  (2026-06-27)

## Corpus Check
- 353 files · ~109,328 words
- Verdict: corpus is large enough that graph structure adds value.

## Summary
- 1614 nodes · 4146 edges · 83 communities (72 shown, 11 thin omitted)
- Extraction: 99% EXTRACTED · 1% INFERRED · 0% AMBIGUOUS · INFERRED: 38 edges (avg confidence: 0.8)
- Token cost: 0 input · 0 output

## Graph Freshness
- Built from commit: `e22807db`
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
- [[_COMMUNITY_Community 72|Community 72]]
- [[_COMMUNITY_Community 73|Community 73]]
- [[_COMMUNITY_Community 74|Community 74]]
- [[_COMMUNITY_Community 75|Community 75]]
- [[_COMMUNITY_Community 76|Community 76]]
- [[_COMMUNITY_Community 77|Community 77]]
- [[_COMMUNITY_Community 78|Community 78]]
- [[_COMMUNITY_Community 79|Community 79]]
- [[_COMMUNITY_Community 80|Community 80]]
- [[_COMMUNITY_Community 81|Community 81]]
- [[_COMMUNITY_Community 82|Community 82]]

## God Nodes (most connected - your core abstractions)
1. `getButtonClassName()` - 58 edges
2. `requireAdmin()` - 51 edges
3. `getDataProvider()` - 46 edges
4. `getStoreSettings()` - 45 edges
5. `Product` - 36 edges
6. `Category` - 27 edges
7. `createAdminClient()` - 24 edges
8. `getProductRepository()` - 23 edges
9. `Button` - 21 edges
10. `generateCategorySlug()` - 21 edges

## Surprising Connections (you probably didn't know these)
- `NewBenefitPage()` --calls--> `getDataProvider()`  [INFERRED]
  app/admin/content/benefits/new/page.tsx → lib/data/provider.ts
- `generateMetadata()` --calls--> `getBannerRepository()`  [INFERRED]
  app/admin/banners/[id]/page.tsx → lib/banners/get-banner-repository.ts
- `AdminEditCategoryPage()` --calls--> `getAllProductsAdmin()`  [INFERRED]
  app/admin/categories/[id]/edit/page.tsx → lib/products.ts
- `generateMetadata()` --calls--> `getBenefitItemById()`  [INFERRED]
  app/admin/content/benefits/[id]/page.tsx → lib/benefits/index.ts
- `EditBenefitPage()` --calls--> `getDataProvider()`  [INFERRED]
  app/admin/content/benefits/[id]/page.tsx → lib/data/provider.ts

## Import Cycles
- None detected.

## Communities (83 total, 11 thin omitted)

### Community 0 - "Community 0"
Cohesion: 0.10
Nodes (19): compilerOptions, allowJs, esModuleInterop, incremental, isolatedModules, jsx, lib, module (+11 more)

### Community 1 - "Community 1"
Cohesion: 0.05
Nodes (43): dependencies, clsx, driver.js, framer-motion, headroom-ai, lucide-react, next, react (+35 more)

### Community 2 - "Community 2"
Cohesion: 0.20
Nodes (15): Icon(), size, GET(), MIME, brandingFileExists(), readBrandingFile(), readBrandingFileBuffer(), resolveExistingBrandingPath() (+7 more)

### Community 3 - "Community 3"
Cohesion: 0.13
Nodes (13): BulkActionsBar(), DeleteProductButton(), DeleteProductButtonProps, FilterBar(), FilterBarProps, ProductsTable(), ProductsTableProps, metadata (+5 more)

### Community 4 - "Community 4"
Cohesion: 0.06
Nodes (54): confirmImportAction(), logImportParse(), parseImportCsvAction(), revalidateCatalog(), validateProductImageUrlsLocal(), CSV_COLUMNS, REQUIRED_HEADERS, Filter (+46 more)

### Community 5 - "Community 5"
Cohesion: 0.14
Nodes (21): barlowCondensed, generateMetadata(), inter, RootLayout(), viewport, generateMetadata(), ContatoPage(), generateMetadata() (+13 more)

### Community 7 - "Community 7"
Cohesion: 0.15
Nodes (19): CartTestClient(), getClientCatalogCache(), setCatalogCache(), CartContext, CartContextValue, sanitizeItems(), loadCartItems(), saveCartItems() (+11 more)

### Community 8 - "Community 8"
Cohesion: 0.33
Nodes (5): nextConfig, supabaseProductsPattern, buildContentSecurityPolicy(), SECURITY_HEADERS, supabaseHost()

### Community 10 - "Community 10"
Cohesion: 0.14
Nodes (25): buildProduct(), jsonProductRepository, nextProductId(), ProductInput, ProductRepository, assignVariationIds(), deriveShortDescription(), slugifyUnique() (+17 more)

### Community 11 - "Community 11"
Cohesion: 0.18
Nodes (13): AdminAccessButton(), AdminLoginForm(), DemoAdminToolbar(), clearDemoAdminFlag(), DEMO_ADMIN_CREDENTIALS, hasDemoAdminSession(), notifyDemoSessionChange(), setDemoAdminFlag() (+5 more)

### Community 12 - "Community 12"
Cohesion: 0.20
Nodes (15): classifyProductImagesInitial(), extractProductsStoragePath(), isProductsStorageUrl(), matchesMediaFilter(), normalizeSupabaseBaseUrl(), resolveMediaStatus(), MediaProductRow(), MediaProductRowProps (+7 more)

### Community 13 - "Community 13"
Cohesion: 0.23
Nodes (14): HEADER_BRAND_DISPLAY_VALUES, HeaderBrandRender, isValidHeaderBrandDisplay(), normalizeHeaderBrandDisplay(), jsonSettingsRepository, mergeStoreSettings(), normalizeColor(), StoreSettingsRepository (+6 more)

### Community 14 - "Community 14"
Cohesion: 0.06
Nodes (40): BM25, detect_domain(), _load_csv(), Lowercase, split, remove punctuation, filter short words, Build BM25 index from documents, Score all documents against query, Load CSV and return list of dicts, Core search function using BM25 (+32 more)

### Community 15 - "Community 15"
Cohesion: 0.19
Nodes (13): BenefitRepository, DEFAULT_BENEFIT_ITEMS, getActiveBenefitItems(), resolveStorefrontBenefits(), StorefrontBenefitsSection, activeItem, benefitInputToRow(), BenefitItemRow (+5 more)

### Community 20 - "Community 20"
Cohesion: 0.05
Nodes (64): AdminReorderButtons(), AdminReorderButtonsProps, AdminToggleSwitch(), AdminToggleSwitchProps, BannerSlideForm(), BannerSlideFormProps, ReorderBannerButtons(), ReorderBenefitButtons() (+56 more)

### Community 21 - "Community 21"
Cohesion: 0.31
Nodes (3): StatusPage(), StatusPageProps, metadata

### Community 23 - "Community 23"
Cohesion: 0.10
Nodes (39): canonicalImportSlug(), csvToRecords(), generateSlug(), COLOR_ALIASES, COLOR_PATTERN, extractCanonicalColors(), hasColorConflict(), normalizeProductName() (+31 more)

### Community 24 - "Community 24"
Cohesion: 0.16
Nodes (21): AdminPage(), metadata, NavCard(), Home(), categories, clubs, mockProducts, getStorefrontCategories() (+13 more)

### Community 25 - "Community 25"
Cohesion: 0.22
Nodes (14): VariationInput, deriveShortFromHtml(), stripHtml(), applyImport(), ApplyImportOptions, mergeVariations(), resolveStatus(), toProductInput() (+6 more)

### Community 26 - "Community 26"
Cohesion: 0.08
Nodes (26): buildLegacyMeta(), byScrapedSlug, csv, getVariationSize(), HEADERS, IMAGES_ROOT, importLines, isPersonalizationValue() (+18 more)

### Community 28 - "Community 28"
Cohesion: 0.12
Nodes (17): AdminPageHeader(), AdminPageHeaderProps, BenefitForm(), BenefitFormProps, metadata, generateMetadata(), metadata, NotFound() (+9 more)

### Community 29 - "Community 29"
Cohesion: 0.06
Nodes (74): AdminListPage(), AdminListPageProps, CategoryForm(), CategoryFormProps, categoryToForm(), SearchBar(), SearchBarProps, StatusTabs() (+66 more)

### Community 30 - "Community 30"
Cohesion: 0.42
Nodes (8): BRANDING_ALIASES, BRANDING_ICON_FILES, brandingAssetUrl(), brandingAssetUrlVersioned(), absoluteOgUrl(), buildPageMetadata(), buildRootMetadata(), versionedIcons()

### Community 31 - "Community 31"
Cohesion: 0.09
Nodes (22): buildLegacyPriceIndex(), byScrapedSlug, headers, importLines, isPersonalizationValue(), leafCategory(), LEGACY, legacyPriceIndex (+14 more)

### Community 32 - "Community 32"
Cohesion: 0.15
Nodes (21): buildHeaderLogoWebp(), FAVICON_SIZES, generateBrandingAssets(), resizeContainedSquare(), brandingDir, copyDir(), copyFile(), deployDir (+13 more)

### Community 33 - "Community 33"
Cohesion: 0.28
Nodes (15): BulkActionsBarProps, requireAdmin(), { mockRequireAdmin }, bulkDeleteProductsAction(), bulkSetProductCategoryAction(), bulkSetProductStatusAction(), createProductAction(), deleteProductAction() (+7 more)

### Community 34 - "Community 34"
Cohesion: 0.12
Nodes (21): AdminEmptyState(), AdminEmptyStateProps, AdminPagination(), AdminPaginationProps, CartNavLink(), CheckoutPage(), metadata, CategoryChips() (+13 more)

### Community 35 - "Community 35"
Cohesion: 0.10
Nodes (15): candidates, excludedAfterVisualReview, firstUrlUsage, importBySlug, importOrder, importRows, inventoryByFirstUrl, inventoryRows (+7 more)

### Community 36 - "Community 36"
Cohesion: 0.05
Nodes (74): AdminLayout(), useAdminOnboarding(), ActionResult, completeOnboardingIfReadyAction(), completeTourAction(), markFirstSaleStepAction(), markStorefrontReviewedAction(), persist() (+66 more)

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
Cohesion: 0.26
Nodes (13): StoreSettingsFormProps, getStoreSettingsAction(), restoreDefaultStorefrontAction(), revalidateStore(), updateStoreSettingsAction(), uploadHeroImageAction(), uploadStoreLogoAction(), readDefaultStorefrontHeroBuffer() (+5 more)

### Community 41 - "Community 41"
Cohesion: 0.15
Nodes (24): categoryProductsHref(), hasStorefrontCategoryImages(), isCategoryFilterActive(), isStorefrontCategory(), isStorefrontTestResidue(), PRODUCTS_HREF_PRESERVED_PARAMS, productsPageHref(), resolveCategoryHeading() (+16 more)

### Community 42 - "Community 42"
Cohesion: 0.10
Nodes (35): AdminTourDriver(), AdminTourDriverProps, buildDriverSteps(), clearTourResume(), createTourController(), DEFAULT_WAIT_FOR_TARGET, getNavigationContext(), hasNextOnSameRoute() (+27 more)

### Community 43 - "Community 43"
Cohesion: 0.18
Nodes (8): BannerCarousel(), HomeHero(), HomeHeroProps, fallback, SportsHero(), SportsHeroContent, SportsHeroProps, useDeviceBreakpoint()

### Community 44 - "Community 44"
Cohesion: 0.18
Nodes (15): CartContent(), CartContentProps, CartLineItem(), CartLineItemProps, CartPage(), metadata, useCart(), CartLine (+7 more)

### Community 45 - "Community 45"
Cohesion: 0.14
Nodes (14): BenefitsSectionForm(), BenefitsSectionFormProps, getAllBenefitItems(), AdminBenefitsPage(), metadata, cn(), Alert, AlertProps (+6 more)

### Community 46 - "Community 46"
Cohesion: 0.19
Nodes (13): emptyVariation(), ProductForm(), ProductFormProps, productToForm(), VariationRow, visibilityBannerClass(), ProductFormPayload, defaultCategorySlug() (+5 more)

### Community 47 - "Community 47"
Cohesion: 0.21
Nodes (12): resolveCategoryDisplayName(), calculateDiscount(), formatPrice(), getProductBySlug(), ProductCard(), ProductGallery(), ProductGalleryProps, ProductImage() (+4 more)

### Community 48 - "Community 48"
Cohesion: 0.29
Nodes (9): RequireAdminResult, assertSupabaseEnv(), DataProvider, isSupabaseConfigured(), getSupabaseAnonKey(), getSupabaseUrl(), hasPublicSupabaseKey(), readPublicSupabaseKey() (+1 more)

### Community 49 - "Community 49"
Cohesion: 0.15
Nodes (7): admin, baselineAfter, baselineBefore, env, results, root, touched

### Community 50 - "Community 50"
Cohesion: 0.17
Nodes (11): BRANDING_LOGO_FILENAMES, BRANDING_SOURCE_DIR, readBrandingLogoSourceBuffer(), resolveBrandingLogoSourcePath(), root, DefaultStorefrontVisualPreset, getDefaultStorefrontVisualPreset(), presetDir (+3 more)

### Community 51 - "Community 51"
Cohesion: 0.16
Nodes (13): MediaCenter(), MediaCenterProps, Tab, FILTERS, MediaFilters(), MediaFiltersProps, BulkImageItem, ImageProbeMap (+5 more)

### Community 52 - "Community 52"
Cohesion: 0.20
Nodes (13): ClientUploadResult, extFromFile(), uploadProductImageClient(), UploadQueueRunnerOptions, validateClientUploadFile(), ALLOWED_IMAGE_MIME_TYPES, AllowedImageMime, isAllowedImageExtension() (+5 more)

### Community 53 - "Community 53"
Cohesion: 0.27
Nodes (11): brandingDir, loadJson(), main(), mimeFor(), productToRow(), requireEnv(), root, storageDir (+3 more)

### Community 54 - "Community 54"
Cohesion: 0.17
Nodes (14): { mockRequireAdmin, mockGetStoreSettings, mockUpdateStoreSettings, mockSaveHero, mockGenerateBranding }, getSettingsRepository(), createDefaultStoreSettings(), isValidHexColor(), BRANDING_DIR, DEFAULT_SETTINGS, ensureStorage(), loadStoreSettingsFromDisk() (+6 more)

### Community 55 - "Community 55"
Cohesion: 0.18
Nodes (5): csv, env, png, results, root

### Community 56 - "Community 56"
Cohesion: 0.31
Nodes (7): MoneyInput, MoneyInputHandle, MoneyInputProps, BRL_DISPLAY, formatBrlMoneyInput(), parseBrlMoney(), reaisToCentsDigits()

### Community 57 - "Community 57"
Cohesion: 0.22
Nodes (11): AssociationError, AssociationResult, buildExpectedFilename(), buildMediaMapCsvRows(), findProductByKey(), matchFilesToProducts(), parseAssociationFilename(), ParsedAssociationFilename (+3 more)

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
Cohesion: 0.38
Nodes (5): ImageGalleryField(), ImageGalleryFieldProps, moveImageToPosition(), uploadProductImageAction, UploadProgress

### Community 63 - "Community 63"
Cohesion: 0.37
Nodes (10): createBenefitItemAction(), deleteBenefitItemAction(), ensureSupabase(), reorderBenefitItemAction(), revalidateBenefits(), updateBenefitItemAction(), updateBenefitsSectionAction(), validateBenefitCreateCount() (+2 more)

### Community 64 - "Community 64"
Cohesion: 0.21
Nodes (16): bannerFilename(), deleteBannerImage(), writeBannerImage(), uploadProductImageAction(), categoryImageFilename(), CONTENT_TYPES, deleteCategoryImage(), writeCategoryImage() (+8 more)

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

### Community 72 - "Community 72"
Cohesion: 0.23
Nodes (6): pickHomeProductSections(), mockRepository, ProductCardProps, Cart, Product, ProductVariation

### Community 73 - "Community 73"
Cohesion: 0.36
Nodes (9): bulkSetProductImagesAction(), revalidateMediaPaths(), setProductImagesAction(), { mockRequireAdmin, mockRepo }, isForbiddenImageUrl(), isValidProductStoragePath(), mergeImages(), normalizeImageInputs() (+1 more)

### Community 74 - "Community 74"
Cohesion: 0.31
Nodes (8): metadata, EditProductPage(), EditProductPageProps, generateMetadata(), getAllCategoriesAdmin(), getCategoriesAdmin(), getProductByIdAdmin(), AdminNewProductPage()

### Community 75 - "Community 75"
Cohesion: 0.31
Nodes (7): findDefaultVariation(), resolveVariationBySelection(), colorNameToHex(), colorSwatchBorderClass(), LIGHT_SWATCH_HEX, ProductPurchasePanel(), ProductPurchasePanelProps

### Community 76 - "Community 76"
Cohesion: 0.39
Nodes (7): HeaderBrandMark(), HeaderBrandMarkProps, headerBrandPreviewClasses(), AppearancePreview(), AppearancePreviewProps, resolveHeaderBrandRender(), HeaderBrandDisplay

### Community 77 - "Community 77"
Cohesion: 0.25
Nodes (6): runUploadQueue(), AssociationMatch, MediaUploadWizard(), MediaUploadWizardProps, ProductUploadState, UploadReportRow

### Community 78 - "Community 78"
Cohesion: 0.50
Nodes (4): getActiveBannerSlides(), AdminSettingsPage(), metadata, StoreSettingsForm()

## Knowledge Gaps
- **399 isolated node(s):** `mapRows`, `inventoryRows`, `importRows`, `importBySlug`, `importOrder` (+394 more)
  These have ≤1 connection - possible missing edges or undocumented components.
- **11 thin communities (<3 nodes) omitted from report** — run `graphify query` to explore isolated nodes.

## Suggested Questions
_Questions this graph is uniquely positioned to answer:_

- **Why does `getButtonClassName()` connect `Community 34` to `Community 33`, `Community 3`, `Community 4`, `Community 36`, `Community 40`, `Community 41`, `Community 11`, `Community 44`, `Community 45`, `Community 43`, `Community 77`, `Community 78`, `Community 20`, `Community 21`, `Community 24`, `Community 29`?**
  _High betweenness centrality (0.056) - this node is a cross-community bridge._
- **Why does `getStoreSettings()` connect `Community 5` to `Community 2`, `Community 34`, `Community 4`, `Community 36`, `Community 40`, `Community 41`, `Community 44`, `Community 45`, `Community 78`, `Community 15`, `Community 47`, `Community 20`, `Community 54`, `Community 24`, `Community 28`?**
  _High betweenness centrality (0.043) - this node is a cross-community bridge._
- **Why does `Product` connect `Community 72` to `Community 3`, `Community 4`, `Community 36`, `Community 7`, `Community 10`, `Community 43`, `Community 75`, `Community 46`, `Community 47`, `Community 24`, `Community 25`, `Community 58`?**
  _High betweenness centrality (0.031) - this node is a cross-community bridge._
- **Are the 2 inferred relationships involving `getButtonClassName()` (e.g. with `AdminProductsPage()` and `ProductsPage()`) actually correct?**
  _`getButtonClassName()` has 2 INFERRED edges - model-reasoned connections that need verification._
- **Are the 2 inferred relationships involving `getDataProvider()` (e.g. with `EditBenefitPage()` and `NewBenefitPage()`) actually correct?**
  _`getDataProvider()` has 2 INFERRED edges - model-reasoned connections that need verification._
- **What connects `mapRows`, `inventoryRows`, `importRows` to the rest of the system?**
  _425 weakly-connected nodes found - possible documentation gaps or missing edges._
- **Should `Community 0` be split into smaller, more focused modules?**
  _Cohesion score 0.1 - nodes in this community are weakly interconnected._