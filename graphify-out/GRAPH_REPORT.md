# Graph Report - ecommerce-sports  (2026-06-30)

## Corpus Check
- 510 files · ~169,809 words
- Verdict: corpus is large enough that graph structure adds value.

## Summary
- 2298 nodes · 6270 edges · 114 communities (102 shown, 12 thin omitted)
- Extraction: 99% EXTRACTED · 1% INFERRED · 0% AMBIGUOUS · INFERRED: 57 edges (avg confidence: 0.8)
- Token cost: 0 input · 0 output

## Graph Freshness
- Built from commit: `4a65f6e3`
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
- [[_COMMUNITY_Community 87|Community 87]]
- [[_COMMUNITY_Community 88|Community 88]]
- [[_COMMUNITY_Community 90|Community 90]]
- [[_COMMUNITY_Community 91|Community 91]]
- [[_COMMUNITY_Community 92|Community 92]]
- [[_COMMUNITY_Community 94|Community 94]]
- [[_COMMUNITY_Community 95|Community 95]]
- [[_COMMUNITY_Community 96|Community 96]]
- [[_COMMUNITY_Community 97|Community 97]]
- [[_COMMUNITY_Community 98|Community 98]]
- [[_COMMUNITY_Community 99|Community 99]]
- [[_COMMUNITY_Community 100|Community 100]]
- [[_COMMUNITY_Community 101|Community 101]]
- [[_COMMUNITY_Community 102|Community 102]]
- [[_COMMUNITY_Community 103|Community 103]]
- [[_COMMUNITY_Community 105|Community 105]]
- [[_COMMUNITY_Community 106|Community 106]]
- [[_COMMUNITY_Community 108|Community 108]]
- [[_COMMUNITY_Community 109|Community 109]]
- [[_COMMUNITY_Community 111|Community 111]]
- [[_COMMUNITY_Community 113|Community 113]]
- [[_COMMUNITY_Community 117|Community 117]]
- [[_COMMUNITY_Community 118|Community 118]]

## God Nodes (most connected - your core abstractions)
1. `getButtonClassName()` - 85 edges
2. `requireAdmin()` - 73 edges
3. `Product` - 63 edges
4. `getStoreSettings()` - 51 edges
5. `getDataProvider()` - 50 edges
6. `createAdminClient()` - 42 edges
7. `Category` - 42 edges
8. `getProductRepository()` - 35 edges
9. `AdminPageHeader()` - 32 edges
10. `Button` - 25 edges

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

## Communities (114 total, 12 thin omitted)

### Community 0 - "Community 0"
Cohesion: 0.10
Nodes (19): compilerOptions, allowJs, esModuleInterop, incremental, isolatedModules, jsx, lib, module (+11 more)

### Community 1 - "Community 1"
Cohesion: 0.04
Nodes (45): dependencies, clsx, driver.js, framer-motion, headroom-ai, lucide-react, next, react (+37 more)

### Community 2 - "Community 2"
Cohesion: 0.14
Nodes (21): Icon(), size, categoryImageFilename(), CONTENT_TYPES, deleteCategoryImage(), writeCategoryImage(), GET(), MIME (+13 more)

### Community 3 - "Community 3"
Cohesion: 0.11
Nodes (23): AdminListPage(), AdminListPageProps, AdminPagination(), AdminPaginationProps, SearchBar(), SearchBarProps, StatusTabs(), StatusTabsProps (+15 more)

### Community 4 - "Community 4"
Cohesion: 0.08
Nodes (38): validateProductImageUrlsLocal(), CSV_COLUMNS, REQUIRED_HEADERS, Filter, ImportPreviewTable(), ImportPreviewTableProps, STATUS_LABEL, importCategories (+30 more)

### Community 5 - "Community 5"
Cohesion: 0.11
Nodes (28): barlowCondensed, generateMetadata(), inter, RootLayout(), viewport, CartPage(), metadata, PersonalizationSettingsForm() (+20 more)

### Community 7 - "Community 7"
Cohesion: 0.10
Nodes (32): CartTestClient(), getClientCatalogCache(), buildPricing(), CartContext, CartContextValue, CartPricingConfig, defaultPersonalizationSettings, emptyPricing (+24 more)

### Community 8 - "Community 8"
Cohesion: 0.33
Nodes (5): nextConfig, supabaseProductsPattern, buildContentSecurityPolicy(), SECURITY_HEADERS, supabaseHost()

### Community 10 - "Community 10"
Cohesion: 0.18
Nodes (19): runInChunks(), rowsToProduct(), variationsToRows(), fetchAllProducts(), fetchProductById(), fetchProductBySlug(), fetchProducts(), fetchProductStatusCounts() (+11 more)

### Community 11 - "Community 11"
Cohesion: 0.18
Nodes (13): AdminAccessButton(), AdminLoginForm(), DemoAdminToolbar(), clearDemoAdminFlag(), DEMO_ADMIN_CREDENTIALS, hasDemoAdminSession(), notifyDemoSessionChange(), setDemoAdminFlag() (+5 more)

### Community 12 - "Community 12"
Cohesion: 0.09
Nodes (35): matchesMediaStatus(), CategoryProductCounts, fetchMediaStatusCounts(), MediaStatusCounts, classifyProductImagesInitial(), matchesMediaFilter(), resolveMediaStatus(), MediaCenter() (+27 more)

### Community 13 - "Community 13"
Cohesion: 0.10
Nodes (27): baseProduct, settings, CartDiscountDisplay, CartDiscountLine, getCartDiscountDisplay(), ManualCouponContext, DEFAULT_SALES_CHANNELS, merchandiseAfterAuto() (+19 more)

### Community 14 - "Community 14"
Cohesion: 0.06
Nodes (40): BM25, detect_domain(), _load_csv(), Lowercase, split, remove punctuation, filter short words, Build BM25 index from documents, Score all documents against query, Load CSV and return list of dicts, Core search function using BM25 (+32 more)

### Community 15 - "Community 15"
Cohesion: 0.21
Nodes (14): BenefitForm(), generateMetadata(), PageProps, metadata, getBenefitRepository(), getActiveBenefitItems(), getAllBenefitItems(), getBenefitItemById() (+6 more)

### Community 20 - "Community 20"
Cohesion: 0.17
Nodes (25): generateMetadata(), createBannerSlideWithDesktopAction(), deleteBannerSlideAction(), parseBannerMetadata(), removeBannerDesktopAction(), removeBannerImageAction(), removeBannerMobileAction(), reorderBannerSlideAction() (+17 more)

### Community 21 - "Community 21"
Cohesion: 0.31
Nodes (3): StatusPage(), StatusPageProps, metadata

### Community 23 - "Community 23"
Cohesion: 0.10
Nodes (38): canonicalImportSlug(), csvToRecords(), COLOR_ALIASES, COLOR_PATTERN, extractCanonicalColors(), hasColorConflict(), normalizeProductName(), normalizeRelativePath() (+30 more)

### Community 24 - "Community 24"
Cohesion: 0.21
Nodes (12): AdminPage(), metadata, NavCard(), fetchProductStatusCounts(), categories, clubs, mockProducts, getAllProductsAdmin (+4 more)

### Community 25 - "Community 25"
Cohesion: 0.17
Nodes (21): buildProduct(), ProductInput, assignVariationIds(), deriveShortDescription(), deriveShortFromHtml(), slugifyUnique(), stripHtml(), baseProduct (+13 more)

### Community 26 - "Community 26"
Cohesion: 0.08
Nodes (26): buildLegacyMeta(), byScrapedSlug, csv, getVariationSize(), HEADERS, IMAGES_ROOT, importLines, isPersonalizationValue() (+18 more)

### Community 28 - "Community 28"
Cohesion: 0.12
Nodes (22): CommercialPolicyRow, commercialPolicyToRow(), CommercialProductPolicyOverrideRow, inputToCommercialPolicyRow(), inputToProductPolicyOverrideRow(), rowToCommercialPolicy(), rowToProductPolicyOverride(), CommercialPolicyRepository (+14 more)

### Community 29 - "Community 29"
Cohesion: 0.13
Nodes (25): parseCsv(), buildLoteCsv(), buildSku(), createSkuRegistry(), filterImages(), findMaxBatch(), groupProducts(), HEADERS (+17 more)

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
Cohesion: 0.19
Nodes (23): BulkActionsBarProps, getProductsForPickerByIdsAction(), searchProductsForPickerAction(), requireAdmin(), { mockRequireAdmin }, BulkActivateOptions, bulkActivateWithOptionsAction(), bulkDeleteProductsAction() (+15 more)

### Community 34 - "Community 34"
Cohesion: 0.15
Nodes (18): AdminEmptyState(), AdminEmptyStateProps, CartNavLink(), CheckoutPage(), metadata, getAllCommercialPoliciesAdmin(), AdminFretePage(), metadata (+10 more)

### Community 35 - "Community 35"
Cohesion: 0.10
Nodes (15): candidates, excludedAfterVisualReview, firstUrlUsage, importBySlug, importOrder, importRows, inventoryByFirstUrl, inventoryRows (+7 more)

### Community 36 - "Community 36"
Cohesion: 0.07
Nodes (58): AdminLayout(), useAdminOnboarding(), ActionResult, completeOnboardingIfReadyAction(), completeTourAction(), markFirstSaleStepAction(), markOnboardingStepCompleteAction(), markStorefrontReviewedAction() (+50 more)

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
Cohesion: 0.06
Nodes (55): parseChannelConfig(), parseSalesChannels(), serializeSalesChannels(), HeaderBrandMark(), HeaderBrandMarkProps, headerBrandPreviewClasses(), revalidatePersonalization(), updatePersonalizationSettingsAction() (+47 more)

### Community 41 - "Community 41"
Cohesion: 0.15
Nodes (20): Home(), ProductsSearchInput(), getStorefrontCategories(), fetchProductBySlugUncached(), getAllProducts(), getCachedFeaturedProducts, getCategories(), getFeaturedProducts() (+12 more)

### Community 42 - "Community 42"
Cohesion: 0.11
Nodes (32): AdminTourDriverProps, buildDriverSteps(), clearTourResume(), createTourController(), DEFAULT_WAIT_FOR_TARGET, hasNextOnSameRoute(), isBrowser(), readTourResume() (+24 more)

### Community 43 - "Community 43"
Cohesion: 0.18
Nodes (22): CategoryFormProps, categoryToForm(), CategoryFormPayload, createCategoryAction(), deleteCategoryAction(), removeCategoryImageAction(), revalidateCategories(), {
  mockRequireAdmin,
  mockGetCategoryRepository,
  mockFetchProductCountForCategory,
} (+14 more)

### Community 44 - "Community 44"
Cohesion: 0.14
Nodes (22): CartContent(), CartContentProps, CartLineItemProps, formatCouponDiscount(), calculateSubtotal(), CartLine, formatPrice(), buildPurchaseIntentFromPricing() (+14 more)

### Community 45 - "Community 45"
Cohesion: 0.13
Nodes (22): categoriesContext(), computeOnboardingProgressFromSnapshot(), desktopBannerContext(), hasDesktopBanner(), hasMobileBanner(), isCategoriesStepComplete(), isDesktopBannerStepComplete(), isManualStepComplete() (+14 more)

### Community 46 - "Community 46"
Cohesion: 0.10
Nodes (22): emptyVariation(), ProductForm(), ProductFormProps, productToForm(), categories, mockCreateProductAction, mockPush, mockRefresh (+14 more)

### Community 47 - "Community 47"
Cohesion: 0.10
Nodes (29): CategoryForm(), CategoryTreePicker(), CategoryTreePickerProps, FilterBar(), FilterBarProps, assertSubtreeFitsMaxDepth(), assertValidParent(), buildCategoryTree() (+21 more)

### Community 48 - "Community 48"
Cohesion: 0.21
Nodes (11): RequireAdminResult, { mockGetUser, mockCreateClient, mockGetDataProvider }, assertSupabaseEnv(), DataProvider, isSupabaseConfigured(), getProductsPublicUrl(), getSupabaseAnonKey(), getSupabaseUrl() (+3 more)

### Community 49 - "Community 49"
Cohesion: 0.15
Nodes (7): admin, baselineAfter, baselineBefore, env, results, root, touched

### Community 50 - "Community 50"
Cohesion: 0.20
Nodes (9): BannerRepository, jsonBannerRepository, STORAGE_PATH, BannerSlideRow, rowToSlide(), slideInputToRow(), supabaseBannerRepository, BannerSlideCreateInput (+1 more)

### Community 51 - "Community 51"
Cohesion: 0.17
Nodes (12): BulkActionsBar(), BulkFilterMoveBanner(), BulkFilterMoveBannerProps, BulkMoveCategoryDialog(), BulkMoveCategoryDialogProps, BulkMoveMode, DeleteProductButton(), DeleteProductButtonProps (+4 more)

### Community 52 - "Community 52"
Cohesion: 0.20
Nodes (13): ClientUploadResult, extFromFile(), uploadProductImageClient(), UploadQueueRunnerOptions, validateClientUploadFile(), ALLOWED_IMAGE_MIME_TYPES, AllowedImageMime, isAllowedImageExtension() (+5 more)

### Community 53 - "Community 53"
Cohesion: 0.27
Nodes (11): brandingDir, loadJson(), main(), mimeFor(), productToRow(), requireEnv(), root, storageDir (+3 more)

### Community 54 - "Community 54"
Cohesion: 0.15
Nodes (15): metadata, ELIGIBILITY_STRATEGY_LABELS, formatPolicySummary(), POLICY_CHANNEL_LABELS, policyChannelClass(), STAGE_GATE_LABELS, resolveSalesChannelStageGates(), GATE_KEYS (+7 more)

### Community 55 - "Community 55"
Cohesion: 0.18
Nodes (5): csv, env, png, results, root

### Community 56 - "Community 56"
Cohesion: 0.08
Nodes (35): CommercialRuleRow, commercialRuleToRow(), DEFAULT_CONFIG, inputToCommercialRuleRow(), parseActions(), parseConditions(), parseStatus(), parseTrigger() (+27 more)

### Community 57 - "Community 57"
Cohesion: 0.22
Nodes (12): CartLineItem(), baseLine, mockGetProductById, personalizationSettings, product, buildPersonalizationPdpUrl(), canShowPersonalizationShortcut(), PersonalizationShortcutInput (+4 more)

### Community 58 - "Community 58"
Cohesion: 0.09
Nodes (30): fetchImportCatalogSnapshot(), confirmImportAction(), logImportParse(), parseImportCsvAction(), revalidateCatalog(), countUniqueImageUrls(), formatImportSizeLimit(), prepareImportBatch() (+22 more)

### Community 59 - "Community 59"
Cohesion: 0.15
Nodes (16): PolicyEvaluationContext, resolveAccumulationGates(), ResolvedAccumulation, CHANNEL_DEFAULT_GATES, DEFAULT_DISTRIBUTOR_STAGE_GATES, DEFAULT_RETAIL_STAGE_GATES, DEFAULT_WHOLESALE_STAGE_GATES, isChannelEnabled() (+8 more)

### Community 60 - "Community 60"
Cohesion: 0.31
Nodes (8): loadEnv(), loginAdmin(), main(), outDir, record(), report, reportPath, root

### Community 61 - "Community 61"
Cohesion: 0.31
Nodes (7): checkSecurityHeaders(), env, record(), report, root, smokeAdmin(), smokePublic()

### Community 62 - "Community 62"
Cohesion: 0.08
Nodes (22): baseProduct, items, otherProduct, settings, baseProduct, engineContext, settings, settings (+14 more)

### Community 63 - "Community 63"
Cohesion: 0.14
Nodes (12): catalogState, ProductRow, productToRow(), ProductVariationRow, baseProduct, resolveImportStatusForPreview(), existingActive, existingDraft (+4 more)

### Community 64 - "Community 64"
Cohesion: 0.25
Nodes (12): metadata, GET(), getCommercialPolicyById(), getPolicyOverridesForProducts(), getStorefrontCommercialPolicies(), createCommercialPolicyAction(), deleteCommercialPolicyAction(), revalidatePolicies() (+4 more)

### Community 65 - "Community 65"
Cohesion: 0.29
Nodes (4): outPath, products, root, settings

### Community 66 - "Community 66"
Cohesion: 0.23
Nodes (11): allocatePolicyDiscountToLines(), computeDiscountFromActions(), eligibilityStrategy(), eligibleBaseForPolicy(), evaluateCommercialPolicies(), isLineEligibleByQty(), isPolicyEligible(), isPolicyQtyEligible() (+3 more)

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
Cohesion: 0.14
Nodes (23): buildMockLines(), PromotionSimulatorProps, CommercialEngineInput, findVariation(), applyPromotion(), evaluatePromotion(), evaluateQuantityDiscount(), PromotionEvaluation (+15 more)

### Community 73 - "Community 73"
Cohesion: 0.21
Nodes (15): queryProductsAdmin(), bulkSetProductImagesAction(), fetchMediaUploadCatalogAction(), revalidateMediaPaths(), setProductImagesAction(), extractProductsStoragePath(), isProductsStorageUrl(), fetchMediaUploadCatalog() (+7 more)

### Community 74 - "Community 74"
Cohesion: 0.09
Nodes (26): AdminPageHeader(), AdminPageHeaderProps, metadata, metadata, PageProps, metadata, metadata, metadata (+18 more)

### Community 75 - "Community 75"
Cohesion: 0.27
Nodes (8): cartLiteToProduct(), fetchCatalogProductsByIds(), mergeCatalogCache(), mergeCatalogCacheFromLite(), setCatalogCache(), ProductCartLite, CartCatalogSeeder(), CartCatalogSeederProps

### Community 76 - "Community 76"
Cohesion: 0.31
Nodes (4): generateMetadata(), HomeBenefits(), pickHomeProductSections(), isProductInStock()

### Community 77 - "Community 77"
Cohesion: 0.57
Nodes (4): ReferralPromptCard(), buildWhatsAppUrl(), getReferralWhatsAppUrl(), getSupportPhoneFromEnv()

### Community 78 - "Community 78"
Cohesion: 0.15
Nodes (17): resolveCategoryDisplayName(), colorNameToHex(), colorSwatchBorderClass(), LIGHT_SWATCH_HEX, calculateDiscount(), getCachedProductBySlug(), getProductBySlug(), ProductCard() (+9 more)

### Community 79 - "Community 79"
Cohesion: 0.33
Nodes (4): mockBulkSetPersonalization, mockBulkSetStatus, mockGetByIdsAdmin, { mockRequireAdmin }

### Community 83 - "Community 83"
Cohesion: 0.28
Nodes (8): askYesNo(), backupPath, clientEnvPath, fail(), main(), root, rootEnvPath, slug

### Community 84 - "Community 84"
Cohesion: 0.14
Nodes (21): CategoryRepository, CATEGORIES_PATH, ensureStorage(), loadCategoriesFromDisk(), persistCategories(), readFromDisk(), STORAGE_DIR, writeToDisk() (+13 more)

### Community 85 - "Community 85"
Cohesion: 0.50
Nodes (4): getActiveBannerSlides(), AdminSettingsPage(), metadata, StoreSettingsForm()

### Community 86 - "Community 86"
Cohesion: 0.13
Nodes (13): AdminReorderButtons(), AdminReorderButtonsProps, AdminToggleSwitch(), AdminToggleSwitchProps, ReorderBannerButtons(), ReorderBenefitButtons(), ToggleBannerActiveButton(), ToggleBenefitActiveButton() (+5 more)

### Community 87 - "Community 87"
Cohesion: 0.50
Nodes (3): mockGetByIdsAdmin, mockQuery, mockRequireAdmin

### Community 88 - "Community 88"
Cohesion: 0.23
Nodes (11): BenefitRepository, DEFAULT_BENEFIT_ITEMS, resolveStorefrontBenefits(), StorefrontBenefitsSection, activeItem, benefitInputToRow(), BenefitItemRow, rowToBenefitItem() (+3 more)

### Community 90 - "Community 90"
Cohesion: 0.18
Nodes (8): BannerCarousel(), HomeHero(), HomeHeroProps, fallback, SportsHero(), SportsHeroContent, SportsHeroProps, useDeviceBreakpoint()

### Community 91 - "Community 91"
Cohesion: 0.10
Nodes (35): getStorefrontRoots(), getVisibleChildCategories(), isStorefrontProduct(), getNavigationContext(), NavigationContext, resolveHintText(), resolveSearchPlaceholder(), categoryProductsHref() (+27 more)

### Community 92 - "Community 92"
Cohesion: 0.13
Nodes (18): exportMediaMapCsvAction(), runUploadQueue(), AssociationError, AssociationMatch, AssociationResult, buildExpectedFilename(), buildMediaMapCsvRows(), findProductByKey() (+10 more)

### Community 94 - "Community 94"
Cohesion: 0.18
Nodes (9): digitsToDisplay(), MoneyInput, MoneyInputHandle, MoneyInputProps, PersonalizationSettingsFormProps, BRL_DISPLAY, formatBrlMoneyInput(), parseBrlMoney() (+1 more)

### Community 95 - "Community 95"
Cohesion: 0.17
Nodes (25): computeCategoryPath(), legacyProductMatchesCategoryValue(), productMatchesCategorySubtree(), CategoryValidationError, generateCategorySlug(), isKnownCategoryValue(), isStorefrontCategoryEntity(), isValidCategorySlug() (+17 more)

### Community 96 - "Community 96"
Cohesion: 0.22
Nodes (10): Find-SpecifyRoot(), Format-SpecKitCommand(), Get-CurrentBranch(), Get-FeaturePathsEnv(), Get-InvokeSeparator(), Get-Python3Command(), Get-RepoRoot(), Resolve-SpecifyInitDir() (+2 more)

### Community 97 - "Community 97"
Cohesion: 0.35
Nodes (10): BenefitFormProps, createBenefitItemAction(), deleteBenefitItemAction(), ensureSupabase(), reorderBenefitItemAction(), revalidateBenefits(), updateBenefitItemAction(), updateBenefitsSectionAction() (+2 more)

### Community 98 - "Community 98"
Cohesion: 0.24
Nodes (13): jsonProductRepository, nextProductId(), listProductIdsByQuery(), ProductRepository, VariationInput, ProductFilters, ProductQuery, ProductQueryFields (+5 more)

### Community 99 - "Community 99"
Cohesion: 0.15
Nodes (15): metadata, archiveCommercialRuleAction(), createCommercialRuleAction(), revalidateCommercial(), updateCommercialRuleAction(), validateRuleInput(), PromotionForm(), PromotionFormProps (+7 more)

### Community 100 - "Community 100"
Cohesion: 0.17
Nodes (11): BenefitsSectionForm(), BenefitsSectionFormProps, cn(), Alert, AlertProps, AlertSize, AlertType, sizeStyles (+3 more)

### Community 101 - "Community 101"
Cohesion: 0.24
Nodes (10): BRANDING_DIR, DEFAULT_SETTINGS, ensureStorage(), getBrandingFilePath(), persistStoreSettings(), readFromDisk(), SEED_PATH, SETTINGS_PATH (+2 more)

### Community 102 - "Community 102"
Cohesion: 0.22
Nodes (12): bannerImageUrl(), getBannerPreloadIndices(), preloadBannerImageUrl(), resolveBannerSlidePreloadSrc(), assertBannerCreatePayload(), assertBannerSlideImages(), filterSlidesForViewport(), hasRequiredBannerImages() (+4 more)

### Community 103 - "Community 103"
Cohesion: 0.29
Nodes (8): CATALOG_PATH, ensureStorage(), loadCatalogFromDisk(), persistCatalog(), readFromDisk(), SEED_PATH, STORAGE_DIR, writeToDisk()

### Community 105 - "Community 105"
Cohesion: 0.29
Nodes (8): BannerSlideForm(), BannerSlideFormProps, metadata, hasBannerDesktopImage(), visibilityRequiresDesktop(), visibilityRequiresMobile(), BannerSlide, BannerSlideVisibility

### Community 106 - "Community 106"
Cohesion: 0.33
Nodes (7): categoryImageUrl(), cardRing(), CategoryAllCard(), CategoryAllCardProps, CategoryCardImage(), CategoryVisualCard(), CategoryVisualCardProps

### Community 108 - "Community 108"
Cohesion: 0.24
Nodes (9): BulkActivateDialog(), Props, BulkValidationSummary, ProductValidationResult, PUBLICATION_ERROR_LABELS, PublicationError, base, validateProductForPublication() (+1 more)

### Community 109 - "Community 109"
Cohesion: 0.24
Nodes (10): CACHE_HEADERS, GET(), COMMERCIAL_RULE_STATUS_LABELS, commercialRuleStatusClass(), getAllCommercialRulesAdmin(), getStorefrontCommercialRules(), AdminCuponsPage(), metadata (+2 more)

### Community 111 - "Community 111"
Cohesion: 0.20
Nodes (10): ImageGalleryField(), ImageGalleryFieldProps, moveImageToPosition(), uploadProductImageAction, UploadProgress, uploadProductImageAction(), buildProductImageFilename(), CONTENT_TYPES (+2 more)

### Community 113 - "Community 113"
Cohesion: 0.14
Nodes (19): ProductPickerItem, archiveCouponRuleAction(), createCouponRuleAction(), revalidateCoupons(), updateCouponRuleAction(), validateCouponInput(), normalizeCouponCode(), CouponForm() (+11 more)

## Knowledge Gaps
- **553 isolated node(s):** `mapRows`, `inventoryRows`, `importRows`, `importBySlug`, `importOrder` (+548 more)
  These have ≤1 connection - possible missing edges or undocumented components.
- **12 thin communities (<3 nodes) omitted from report** — run `graphify query` to explore isolated nodes.

## Suggested Questions
_Questions this graph is uniquely positioned to answer:_

- **Why does `Product` connect `Community 63` to `Community 4`, `Community 7`, `Community 10`, `Community 13`, `Community 24`, `Community 25`, `Community 41`, `Community 44`, `Community 45`, `Community 46`, `Community 51`, `Community 56`, `Community 57`, `Community 58`, `Community 62`, `Community 72`, `Community 75`, `Community 76`, `Community 78`, `Community 79`, `Community 90`, `Community 98`, `Community 103`, `Community 108`?**
  _High betweenness centrality (0.068) - this node is a cross-community bridge._
- **Why does `requireAdmin()` connect `Community 33` to `Community 64`, `Community 97`, `Community 99`, `Community 36`, `Community 40`, `Community 73`, `Community 43`, `Community 15`, `Community 48`, `Community 111`, `Community 113`, `Community 20`, `Community 58`, `Community 92`, `Community 63`?**
  _High betweenness centrality (0.053) - this node is a cross-community bridge._
- **Why does `getButtonClassName()` connect `Community 34` to `Community 3`, `Community 4`, `Community 11`, `Community 12`, `Community 15`, `Community 21`, `Community 24`, `Community 33`, `Community 36`, `Community 40`, `Community 41`, `Community 44`, `Community 51`, `Community 57`, `Community 74`, `Community 77`, `Community 84`, `Community 85`, `Community 86`, `Community 90`, `Community 91`, `Community 92`, `Community 102`, `Community 108`, `Community 109`, `Community 113`?**
  _High betweenness centrality (0.046) - this node is a cross-community bridge._
- **Are the 2 inferred relationships involving `getButtonClassName()` (e.g. with `AdminProductsPage()` and `ProductsPage()`) actually correct?**
  _`getButtonClassName()` has 2 INFERRED edges - model-reasoned connections that need verification._
- **Are the 2 inferred relationships involving `getStoreSettings()` (e.g. with `AdminProductsPage()` and `generateMetadata()`) actually correct?**
  _`getStoreSettings()` has 2 INFERRED edges - model-reasoned connections that need verification._
- **Are the 2 inferred relationships involving `getDataProvider()` (e.g. with `EditBenefitPage()` and `NewBenefitPage()`) actually correct?**
  _`getDataProvider()` has 2 INFERRED edges - model-reasoned connections that need verification._
- **What connects `mapRows`, `inventoryRows`, `importRows` to the rest of the system?**
  _579 weakly-connected nodes found - possible documentation gaps or missing edges._