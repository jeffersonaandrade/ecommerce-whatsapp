# Graph Report - ecommerce-sports  (2026-06-29)

## Corpus Check
- 430 files · ~136,971 words
- Verdict: corpus is large enough that graph structure adds value.

## Summary
- 1976 nodes · 5339 edges · 87 communities (77 shown, 10 thin omitted)
- Extraction: 99% EXTRACTED · 1% INFERRED · 0% AMBIGUOUS · INFERRED: 48 edges (avg confidence: 0.8)
- Token cost: 0 input · 0 output

## Graph Freshness
- Built from commit: `fdff9534`
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
- [[_COMMUNITY_Community 83|Community 83]]
- [[_COMMUNITY_Community 84|Community 84]]
- [[_COMMUNITY_Community 85|Community 85]]
- [[_COMMUNITY_Community 86|Community 86]]

## God Nodes (most connected - your core abstractions)
1. `getButtonClassName()` - 76 edges
2. `requireAdmin()` - 61 edges
3. `Product` - 55 edges
4. `getStoreSettings()` - 51 edges
5. `getDataProvider()` - 48 edges
6. `createAdminClient()` - 41 edges
7. `Category` - 36 edges
8. `getProductRepository()` - 31 edges
9. `AdminPageHeader()` - 27 edges
10. `getAllProductsAdmin` - 25 edges

## Surprising Connections (you probably didn't know these)
- `generateMetadata()` --calls--> `getBannerRepository()`  [INFERRED]
  app/admin/banners/[id]/page.tsx → lib/banners/get-banner-repository.ts
- `AdminEditCategoryPage()` --calls--> `getAllCategoriesAdmin`  [INFERRED]
  app/admin/categories/[id]/edit/page.tsx → lib/categories.ts
- `AdminEditCategoryPage()` --calls--> `getAllProductsAdmin`  [INFERRED]
  app/admin/categories/[id]/edit/page.tsx → lib/products.ts
- `AdminNewCategoryPage()` --calls--> `getAllCategoriesAdmin`  [INFERRED]
  app/admin/categories/new/page.tsx → lib/categories.ts
- `AdminCampanhasPage()` --calls--> `getButtonClassName()`  [EXTRACTED]
  app/admin/comercial/campanhas/page.tsx → components/ui/button.tsx

## Import Cycles
- None detected.

## Communities (87 total, 10 thin omitted)

### Community 0 - "Community 0"
Cohesion: 0.10
Nodes (19): compilerOptions, allowJs, esModuleInterop, incremental, isolatedModules, jsx, lib, module (+11 more)

### Community 1 - "Community 1"
Cohesion: 0.04
Nodes (45): dependencies, clsx, driver.js, framer-motion, headroom-ai, lucide-react, next, react (+37 more)

### Community 2 - "Community 2"
Cohesion: 0.15
Nodes (21): Icon(), size, categoryImageFilename(), CONTENT_TYPES, deleteCategoryImage(), writeCategoryImage(), GET(), MIME (+13 more)

### Community 3 - "Community 3"
Cohesion: 0.12
Nodes (16): AdminListPage(), AdminListPageProps, BulkActionsBar(), DeleteProductButton(), DeleteProductButtonProps, ProductsTable(), ProductsTableProps, AdminProductsPage() (+8 more)

### Community 4 - "Community 4"
Cohesion: 0.15
Nodes (20): CSV_COLUMNS, REQUIRED_HEADERS, importCategories, TEMPLATE_PATH, findConflictingProductRows(), groupRowsBySlug(), mapVariationAttributes(), parseCategory() (+12 more)

### Community 5 - "Community 5"
Cohesion: 0.14
Nodes (21): barlowCondensed, generateMetadata(), inter, RootLayout(), viewport, CartPage(), metadata, ContatoPage() (+13 more)

### Community 7 - "Community 7"
Cohesion: 0.17
Nodes (19): getClientCatalogCache(), buildPricing(), CartContext, CartContextValue, CartPricingConfig, defaultPersonalizationSettings, emptyPricing, sanitizeItems() (+11 more)

### Community 8 - "Community 8"
Cohesion: 0.33
Nodes (5): nextConfig, supabaseProductsPattern, buildContentSecurityPolicy(), SECURITY_HEADERS, supabaseHost()

### Community 10 - "Community 10"
Cohesion: 0.07
Nodes (46): CATALOG_PATH, ensureStorage(), loadCatalogFromDisk(), persistCatalog(), readFromDisk(), SEED_PATH, STORAGE_DIR, writeToDisk() (+38 more)

### Community 11 - "Community 11"
Cohesion: 0.18
Nodes (13): AdminAccessButton(), AdminLoginForm(), DemoAdminToolbar(), clearDemoAdminFlag(), DEMO_ADMIN_CREDENTIALS, hasDemoAdminSession(), notifyDemoSessionChange(), setDemoAdminFlag() (+5 more)

### Community 12 - "Community 12"
Cohesion: 0.25
Nodes (11): matchesMediaStatus(), classifyProductImagesInitial(), extractProductsStoragePath(), isProductsStorageUrl(), matchesMediaFilter(), normalizeSupabaseBaseUrl(), resolveMediaStatus(), loadOnboardingSnapshot() (+3 more)

### Community 13 - "Community 13"
Cohesion: 0.16
Nodes (23): normalizeHeaderBrandDisplay(), jsonSettingsRepository, createDefaultStoreSettings(), isValidHexColor(), mergeStoreSettings(), normalizeColor(), StoreSettingsRepository, BRANDING_DIR (+15 more)

### Community 14 - "Community 14"
Cohesion: 0.06
Nodes (40): BM25, detect_domain(), _load_csv(), Lowercase, split, remove punctuation, filter short words, Build BM25 index from documents, Score all documents against query, Load CSV and return list of dicts, Core search function using BM25 (+32 more)

### Community 15 - "Community 15"
Cohesion: 0.05
Nodes (60): AdminReorderButtons(), AdminReorderButtonsProps, AdminToggleSwitch(), AdminToggleSwitchProps, BenefitForm(), BenefitFormProps, BenefitsSectionForm(), BenefitsSectionFormProps (+52 more)

### Community 20 - "Community 20"
Cohesion: 0.06
Nodes (62): BannerSlideForm(), BannerSlideFormProps, generateMetadata(), createBannerSlideWithDesktopAction(), deleteBannerSlideAction(), parseBannerMetadata(), removeBannerDesktopAction(), removeBannerImageAction() (+54 more)

### Community 21 - "Community 21"
Cohesion: 0.21
Nodes (6): NotFound(), CartTestPage(), AdminImportPage(), StatusPage(), StatusPageProps, metadata

### Community 23 - "Community 23"
Cohesion: 0.11
Nodes (37): canonicalImportSlug(), COLOR_ALIASES, COLOR_PATTERN, extractCanonicalColors(), hasColorConflict(), normalizeProductName(), normalizeRelativePath(), splitPipeList() (+29 more)

### Community 24 - "Community 24"
Cohesion: 0.20
Nodes (14): AdminPage(), metadata, NavCard(), CategoryProductCounts, fetchMediaStatusCounts(), fetchProductsByCategoryCounts(), fetchProductStatusCounts(), MediaStatusCounts (+6 more)

### Community 25 - "Community 25"
Cohesion: 0.15
Nodes (20): VariationInput, deriveShortDescription(), deriveShortFromHtml(), stripHtml(), baseProduct, validInput, applyImport(), ApplyImportOptions (+12 more)

### Community 26 - "Community 26"
Cohesion: 0.08
Nodes (26): buildLegacyMeta(), byScrapedSlug, csv, getVariationSize(), HEADERS, IMAGES_ROOT, importLines, isPersonalizationValue() (+18 more)

### Community 28 - "Community 28"
Cohesion: 0.13
Nodes (10): AdminPageHeader(), AdminPageHeaderProps, metadata, metadata, AdminCampanhasPage(), metadata, metadata, AdminCuponsPage() (+2 more)

### Community 29 - "Community 29"
Cohesion: 0.13
Nodes (34): CategoryRepository, loadCategoriesFromDisk(), persistCategories(), assertValidParent(), computeCategoryPath(), legacyProductMatchesCategoryValue(), productMatchesCategorySubtree(), CategoryValidationError (+26 more)

### Community 30 - "Community 30"
Cohesion: 0.33
Nodes (10): generateMetadata(), generateMetadata(), BRANDING_ALIASES, BRANDING_ICON_FILES, brandingAssetUrl(), brandingAssetUrlVersioned(), absoluteOgUrl(), buildPageMetadata() (+2 more)

### Community 31 - "Community 31"
Cohesion: 0.09
Nodes (22): buildLegacyPriceIndex(), byScrapedSlug, headers, importLines, isPersonalizationValue(), leafCategory(), LEGACY, legacyPriceIndex (+14 more)

### Community 32 - "Community 32"
Cohesion: 0.15
Nodes (21): buildHeaderLogoWebp(), FAVICON_SIZES, generateBrandingAssets(), resizeContainedSquare(), brandingDir, copyDir(), copyFile(), deployDir (+13 more)

### Community 33 - "Community 33"
Cohesion: 0.11
Nodes (34): BulkActionsBarProps, BulkActivateDialog(), Props, BulkMoveCategoryDialog(), requireAdmin(), { mockRequireAdmin }, BulkActivateOptions, bulkActivateWithOptionsAction() (+26 more)

### Community 34 - "Community 34"
Cohesion: 0.19
Nodes (13): AdminPagination(), AdminPaginationProps, CartNavLink(), CheckoutPage(), metadata, AdminFretePage(), metadata, Header() (+5 more)

### Community 35 - "Community 35"
Cohesion: 0.10
Nodes (15): candidates, excludedAfterVisualReview, firstUrlUsage, importBySlug, importOrder, importRows, inventoryByFirstUrl, inventoryRows (+7 more)

### Community 36 - "Community 36"
Cohesion: 0.05
Nodes (78): AdminLayout(), useAdminOnboarding(), ActionResult, completeOnboardingIfReadyAction(), completeTourAction(), markFirstSaleStepAction(), markOnboardingStepCompleteAction(), markStorefrontReviewedAction() (+70 more)

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
Cohesion: 0.17
Nodes (18): getActiveBannerSlides(), AdminSettingsPage(), metadata, StoreSettingsForm(), StoreSettingsFormProps, getStoreSettingsAction(), { mockRequireAdmin, mockGetStoreSettings, mockUpdateStoreSettings, mockSaveHero, mockGenerateBranding }, restoreDefaultStorefrontAction() (+10 more)

### Community 41 - "Community 41"
Cohesion: 0.05
Nodes (69): Home(), categoryImageUrl(), getStorefrontRoots(), getVisibleChildCategories(), resolveCategoryDisplayName(), isStorefrontProduct(), categoryProductsHref(), hasStorefrontCategoryImages() (+61 more)

### Community 42 - "Community 42"
Cohesion: 0.11
Nodes (32): AdminTourDriverProps, buildDriverSteps(), clearTourResume(), createTourController(), DEFAULT_WAIT_FOR_TARGET, hasNextOnSameRoute(), isBrowser(), readTourResume() (+24 more)

### Community 43 - "Community 43"
Cohesion: 0.17
Nodes (25): CategoryForm(), CategoryFormProps, categoryToForm(), CategoryFormPayload, createCategoryAction(), deleteCategoryAction(), removeCategoryImageAction(), revalidateCategories() (+17 more)

### Community 44 - "Community 44"
Cohesion: 0.22
Nodes (13): calculateSubtotal(), buildPurchaseIntentFromPricing(), createOrderReference(), buildPurchaseIntentFromCart(), enrichPricingWithCartItems(), personalizationSettings, personalizedProduct, samplePricing (+5 more)

### Community 45 - "Community 45"
Cohesion: 0.13
Nodes (24): buildLoteCsv(), buildSku(), createSkuRegistry(), filterImages(), findMaxBatch(), groupProducts(), HEADERS, loteFileName() (+16 more)

### Community 46 - "Community 46"
Cohesion: 0.09
Nodes (27): emptyVariation(), ProductForm(), ProductFormProps, productToForm(), categories, mockCreateProductAction, mockPush, mockRefresh (+19 more)

### Community 47 - "Community 47"
Cohesion: 0.21
Nodes (16): BulkMoveCategoryDialogProps, CategoryTreePicker(), CategoryTreePickerProps, FilterBar(), FilterBarProps, buildCategoryTree(), CategoryNode, flattenCategoryTree() (+8 more)

### Community 48 - "Community 48"
Cohesion: 0.26
Nodes (7): RequireAdminResult, { mockGetUser, mockCreateClient, mockGetDataProvider }, getSupabaseAnonKey(), getSupabaseServiceRoleKey(), getSupabaseUrl(), readPublicSupabaseKey(), createServerSupabaseClient()

### Community 49 - "Community 49"
Cohesion: 0.15
Nodes (7): admin, baselineAfter, baselineBefore, env, results, root, touched

### Community 50 - "Community 50"
Cohesion: 0.17
Nodes (11): BRANDING_LOGO_FILENAMES, BRANDING_SOURCE_DIR, readBrandingLogoSourceBuffer(), resolveBrandingLogoSourcePath(), root, DefaultStorefrontVisualPreset, getDefaultStorefrontVisualPreset(), presetDir (+3 more)

### Community 51 - "Community 51"
Cohesion: 0.10
Nodes (27): SearchBar(), SearchBarProps, StatusTabs(), StatusTabsProps, MediaCenter(), MediaCenterProps, PRODUCT_STATUS_LABELS, Tab (+19 more)

### Community 52 - "Community 52"
Cohesion: 0.07
Nodes (36): ImageGalleryField(), ImageGalleryFieldProps, moveImageToPosition(), uploadProductImageAction, UploadProgress, uploadProductImageAction(), buildProductImageFilename(), CONTENT_TYPES (+28 more)

### Community 53 - "Community 53"
Cohesion: 0.27
Nodes (11): brandingDir, loadJson(), main(), mimeFor(), productToRow(), requireEnv(), root, storageDir (+3 more)

### Community 54 - "Community 54"
Cohesion: 0.24
Nodes (10): PersonalizationSettingsForm(), PersonalizationSettingsFormProps, AdminPersonalizacaoPage(), metadata, revalidatePersonalization(), updatePersonalizationSettingsAction(), personalizationToStoreSettingsInput(), storeSettingsToPersonalization() (+2 more)

### Community 55 - "Community 55"
Cohesion: 0.18
Nodes (5): csv, env, png, results, root

### Community 56 - "Community 56"
Cohesion: 0.05
Nodes (51): CACHE_HEADERS, GET(), digitsToDisplay(), MoneyInput, MoneyInputHandle, MoneyInputProps, metadata, archiveCommercialRuleAction() (+43 more)

### Community 57 - "Community 57"
Cohesion: 0.19
Nodes (15): CartLineItem(), CartLineItemProps, baseLine, mockGetProductById, personalizationSettings, product, buildPersonalizationPdpUrl(), canShowPersonalizationShortcut() (+7 more)

### Community 58 - "Community 58"
Cohesion: 0.16
Nodes (15): args, buildRpcPayload(), createSupabase(), dryRun, fetchCatalog(), fetchImportedFilenames(), filterImportableProducts(), fromLote (+7 more)

### Community 59 - "Community 59"
Cohesion: 0.20
Nodes (10): CartTestClient(), cartItemKey(), isValidAddons(), isValidCartItem(), loadCartItems(), parseLegacyItems(), parseStoredCart(), saveCartItems() (+2 more)

### Community 60 - "Community 60"
Cohesion: 0.31
Nodes (8): loadEnv(), loginAdmin(), main(), outDir, record(), report, reportPath, root

### Community 61 - "Community 61"
Cohesion: 0.31
Nodes (7): checkSecurityHeaders(), env, record(), report, root, smokeAdmin(), smokePublic()

### Community 62 - "Community 62"
Cohesion: 0.17
Nodes (11): settings, validatePersonalizationAddon(), settings, baseProduct, mockAddItem, mockItems, mockRemoveItem, mockSearchParams (+3 more)

### Community 63 - "Community 63"
Cohesion: 0.18
Nodes (10): prepareImportBatch(), applySupabaseImport(), ApplySupabaseImportOptions, buildRpcPayload(), ImportRpcResult, CsvErrorCode, ImportProductInput, ImportStatusBreakdown (+2 more)

### Community 64 - "Community 64"
Cohesion: 0.31
Nodes (10): fetchImportCatalogSnapshot(), confirmImportAction(), logImportParse(), parseImportCsvAction(), revalidateCatalog(), countUniqueImageUrls(), formatImportSizeLimit(), buildImportPreview() (+2 more)

### Community 65 - "Community 65"
Cohesion: 0.29
Nodes (4): outPath, products, root, settings

### Community 66 - "Community 66"
Cohesion: 0.22
Nodes (10): Filter, ImportPreviewTable(), ImportPreviewTableProps, STATUS_LABEL, ImportWizard(), ImportWizardProps, WizardStep, ImportPreview (+2 more)

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
Cohesion: 0.17
Nodes (18): mockRepository, applyPromotion(), evaluatePromotion(), evaluateQuantityDiscount(), PromotionEvaluation, computeTotals(), ComputeTotalsContext, baseProduct (+10 more)

### Community 73 - "Community 73"
Cohesion: 0.22
Nodes (14): queryProductsAdmin(), bulkSetProductImagesAction(), fetchMediaUploadCatalogAction(), revalidateMediaPaths(), setProductImagesAction(), fetchMediaUploadCatalog(), { mockRequireAdmin, mockRepo }, BulkImageItem (+6 more)

### Community 74 - "Community 74"
Cohesion: 0.17
Nodes (17): metadata, countProductsByCategory(), AdminCategoriesPage(), metadata, VISIBILITY_LABELS, EditProductPage(), EditProductPageProps, generateMetadata() (+9 more)

### Community 75 - "Community 75"
Cohesion: 0.12
Nodes (21): CartContent(), CartContentProps, PromotionSimulator(), PromotionSimulatorProps, useCart(), useProductPersonalizationPrice(), colorNameToHex(), colorSwatchBorderClass() (+13 more)

### Community 76 - "Community 76"
Cohesion: 0.26
Nodes (10): HeaderBrandMark(), HeaderBrandMarkProps, headerBrandPreviewClasses(), AppearancePreview(), AppearancePreviewProps, HEADER_BRAND_DISPLAY_VALUES, HeaderBrandRender, isValidHeaderBrandDisplay() (+2 more)

### Community 77 - "Community 77"
Cohesion: 0.33
Nodes (4): MediaUploadWizard(), MediaUploadWizardProps, ProductUploadState, UploadReportRow

### Community 78 - "Community 78"
Cohesion: 0.27
Nodes (8): cartLiteToProduct(), fetchCatalogProductsByIds(), mergeCatalogCache(), mergeCatalogCacheFromLite(), setCatalogCache(), ProductCartLite, CartCatalogSeeder(), CartCatalogSeederProps

### Community 79 - "Community 79"
Cohesion: 0.28
Nodes (6): AdminEmptyState(), AdminEmptyStateProps, AdminOrdersPage(), metadata, AdminPromocoesPage(), metadata

### Community 83 - "Community 83"
Cohesion: 0.28
Nodes (8): askYesNo(), backupPath, clientEnvPath, fail(), main(), root, rootEnvPath, slug

### Community 84 - "Community 84"
Cohesion: 0.32
Nodes (5): CATEGORIES_PATH, ensureStorage(), readFromDisk(), STORAGE_DIR, writeToDisk()

### Community 85 - "Community 85"
Cohesion: 0.39
Nodes (4): validateProductImageUrlsLocal(), ImportIssue, isAllowedImportImageUrl(), PRIVATE_HOST_PATTERNS

### Community 86 - "Community 86"
Cohesion: 0.40
Nodes (3): getAllBannerSlides(), AdminBannersPage(), metadata

## Knowledge Gaps
- **492 isolated node(s):** `mapRows`, `inventoryRows`, `importRows`, `importBySlug`, `importOrder` (+487 more)
  These have ≤1 connection - possible missing edges or undocumented components.
- **10 thin communities (<3 nodes) omitted from report** — run `graphify query` to explore isolated nodes.

## Suggested Questions
_Questions this graph is uniquely positioned to answer:_

- **Why does `getButtonClassName()` connect `Community 34` to `Community 3`, `Community 11`, `Community 15`, `Community 20`, `Community 21`, `Community 24`, `Community 28`, `Community 33`, `Community 36`, `Community 40`, `Community 41`, `Community 47`, `Community 51`, `Community 57`, `Community 66`, `Community 74`, `Community 75`, `Community 77`, `Community 79`, `Community 86`?**
  _High betweenness centrality (0.066) - this node is a cross-community bridge._
- **Why does `Product` connect `Community 72` to `Community 64`, `Community 33`, `Community 3`, `Community 4`, `Community 36`, `Community 7`, `Community 41`, `Community 10`, `Community 75`, `Community 44`, `Community 78`, `Community 46`, `Community 20`, `Community 62`, `Community 57`, `Community 25`, `Community 63`?**
  _High betweenness centrality (0.056) - this node is a cross-community bridge._
- **Why does `requireAdmin()` connect `Community 33` to `Community 64`, `Community 36`, `Community 40`, `Community 73`, `Community 43`, `Community 15`, `Community 48`, `Community 20`, `Community 52`, `Community 54`, `Community 56`?**
  _High betweenness centrality (0.033) - this node is a cross-community bridge._
- **Are the 2 inferred relationships involving `getButtonClassName()` (e.g. with `AdminProductsPage()` and `ProductsPage()`) actually correct?**
  _`getButtonClassName()` has 2 INFERRED edges - model-reasoned connections that need verification._
- **Are the 2 inferred relationships involving `getStoreSettings()` (e.g. with `AdminProductsPage()` and `generateMetadata()`) actually correct?**
  _`getStoreSettings()` has 2 INFERRED edges - model-reasoned connections that need verification._
- **Are the 2 inferred relationships involving `getDataProvider()` (e.g. with `EditBenefitPage()` and `NewBenefitPage()`) actually correct?**
  _`getDataProvider()` has 2 INFERRED edges - model-reasoned connections that need verification._
- **What connects `mapRows`, `inventoryRows`, `importRows` to the rest of the system?**
  _518 weakly-connected nodes found - possible documentation gaps or missing edges._