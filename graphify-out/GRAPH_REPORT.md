# Graph Report - ecommerce-sports  (2026-07-15)

## Corpus Check
- 527 files · ~179,838 words
- Verdict: corpus is large enough that graph structure adds value.

## Summary
- 2435 nodes · 6506 edges · 115 communities (103 shown, 12 thin omitted)
- Extraction: 99% EXTRACTED · 1% INFERRED · 0% AMBIGUOUS · INFERRED: 61 edges (avg confidence: 0.8)
- Token cost: 0 input · 0 output

## Graph Freshness
- Built from commit: `a4af086f`
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
- [[_COMMUNITY_Community 89|Community 89]]
- [[_COMMUNITY_Community 90|Community 90]]
- [[_COMMUNITY_Community 91|Community 91]]
- [[_COMMUNITY_Community 92|Community 92]]
- [[_COMMUNITY_Community 93|Community 93]]
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
- [[_COMMUNITY_Community 104|Community 104]]
- [[_COMMUNITY_Community 106|Community 106]]
- [[_COMMUNITY_Community 111|Community 111]]
- [[_COMMUNITY_Community 114|Community 114]]
- [[_COMMUNITY_Community 117|Community 117]]
- [[_COMMUNITY_Community 118|Community 118]]

## God Nodes (most connected - your core abstractions)
1. `getButtonClassName()` - 85 edges
2. `requireAdmin()` - 73 edges
3. `Product` - 63 edges
4. `getStoreSettings` - 51 edges
5. `getDataProvider()` - 50 edges
6. `createAdminClient()` - 42 edges
7. `Category` - 42 edges
8. `getProductRepository()` - 35 edges
9. `AdminPageHeader()` - 32 edges
10. `scripts` - 29 edges

## Surprising Connections (you probably didn't know these)
- `generateMetadata()` --calls--> `getBannerRepository()`  [INFERRED]
  app/admin/banners/[id]/page.tsx → lib/banners/get-banner-repository.ts
- `AdminEditCategoryPage()` --calls--> `getAllCategoriesAdmin`  [INFERRED]
  app/admin/categories/[id]/edit/page.tsx → lib/categories.ts
- `AdminEditCategoryPage()` --calls--> `getAllProductsAdmin`  [INFERRED]
  app/admin/categories/[id]/edit/page.tsx → lib/products.ts
- `AdminNewCategoryPage()` --calls--> `getAllCategoriesAdmin`  [INFERRED]
  app/admin/categories/new/page.tsx → lib/categories.ts
- `EditCupomPage()` --calls--> `getAllCategoriesAdmin`  [INFERRED]
  app/admin/comercial/cupons/[id]/page.tsx → lib/categories.ts

## Import Cycles
- None detected.

## Communities (115 total, 12 thin omitted)

### Community 0 - "Community 0"
Cohesion: 0.10
Nodes (19): compilerOptions, allowJs, esModuleInterop, incremental, isolatedModules, jsx, lib, module (+11 more)

### Community 1 - "Community 1"
Cohesion: 0.07
Nodes (29): scripts, branding:sync, build, build:client, build:netlify, create-client, deploy:check, dev (+21 more)

### Community 2 - "Community 2"
Cohesion: 0.14
Nodes (20): Icon(), size, categoryImageFilename(), CONTENT_TYPES, deleteCategoryImage(), writeCategoryImage(), Header(), GET() (+12 more)

### Community 3 - "Community 3"
Cohesion: 0.11
Nodes (20): AdminListPage(), AdminListPageProps, AdminPagination(), AdminPaginationProps, ProductsTable(), SearchBar(), SearchBarProps, StatusTabs() (+12 more)

### Community 4 - "Community 4"
Cohesion: 0.08
Nodes (39): validateProductImageUrlsLocal(), CSV_COLUMNS, REQUIRED_HEADERS, Filter, ImportPreviewTable(), ImportPreviewTableProps, STATUS_LABEL, importCategories (+31 more)

### Community 5 - "Community 5"
Cohesion: 0.17
Nodes (17): getActiveBannerSlides(), HomeBenefits(), ContatoPage(), generateMetadata(), socialHref(), buildInstitutionalMetadata(), InstitutionalPage(), InstitutionalPageProps (+9 more)

### Community 7 - "Community 7"
Cohesion: 0.12
Nodes (20): CartTestClient(), CartTestPage(), buildPricing(), CartContext, CartContextValue, CartPricingConfig, defaultPersonalizationSettings, emptyPricing (+12 more)

### Community 8 - "Community 8"
Cohesion: 0.33
Nodes (5): nextConfig, supabaseProductsPattern, buildContentSecurityPolicy(), SECURITY_HEADERS, supabaseHost()

### Community 10 - "Community 10"
Cohesion: 0.12
Nodes (32): jsonProductRepository, listProductIdsByQuery(), ProductRepository, runInChunks(), productToRow(), rowsToProduct(), variationsToRows(), createProductViaRpc() (+24 more)

### Community 11 - "Community 11"
Cohesion: 0.18
Nodes (13): AdminAccessButton(), AdminLoginForm(), DemoAdminToolbar(), clearDemoAdminFlag(), DEMO_ADMIN_CREDENTIALS, hasDemoAdminSession(), notifyDemoSessionChange(), setDemoAdminFlag() (+5 more)

### Community 12 - "Community 12"
Cohesion: 0.10
Nodes (30): matchesMediaStatus(), classifyProductImagesInitial(), matchesMediaFilter(), resolveMediaStatus(), MediaCenter(), MediaCenterProps, PRODUCT_STATUS_LABELS, Tab (+22 more)

### Community 13 - "Community 13"
Cohesion: 0.12
Nodes (27): CartDiscountDisplay, CartDiscountLine, getCartDiscountDisplay(), ResolvedAccumulation, DEFAULT_SALES_CHANNELS, merchandiseAfterAuto(), merchandiseAfterPolicyFromLines(), resolveCommercialPricing() (+19 more)

### Community 14 - "Community 14"
Cohesion: 0.06
Nodes (40): BM25, detect_domain(), _load_csv(), Lowercase, split, remove punctuation, filter short words, Build BM25 index from documents, Score all documents against query, Load CSV and return list of dicts, Core search function using BM25 (+32 more)

### Community 15 - "Community 15"
Cohesion: 0.14
Nodes (25): parseChannelConfig(), parseSalesChannels(), serializeSalesChannels(), jsonSettingsRepository, isValidHexColor(), mergeStoreSettings(), normalizeColor(), StoreSettingsRepository (+17 more)

### Community 20 - "Community 20"
Cohesion: 0.06
Nodes (64): BannerSlideForm(), BannerSlideFormProps, generateMetadata(), metadata, createBannerSlideWithDesktopAction(), deleteBannerSlideAction(), parseBannerMetadata(), removeBannerDesktopAction() (+56 more)

### Community 21 - "Community 21"
Cohesion: 0.31
Nodes (3): StatusPage(), StatusPageProps, metadata

### Community 23 - "Community 23"
Cohesion: 0.11
Nodes (37): canonicalImportSlug(), COLOR_ALIASES, COLOR_PATTERN, extractCanonicalColors(), hasColorConflict(), normalizeProductName(), normalizeRelativePath(), splitPipeList() (+29 more)

### Community 24 - "Community 24"
Cohesion: 0.14
Nodes (20): CartLineItem(), CartLineItemProps, baseLine, mockGetProductById, personalizationSettings, product, buildPersonalizationPdpUrl(), canShowPersonalizationShortcut() (+12 more)

### Community 25 - "Community 25"
Cohesion: 0.14
Nodes (25): buildProduct(), ProductInput, VariationInput, assignVariationIds(), deriveShortDescription(), deriveShortFromHtml(), slugifyUnique(), stripHtml() (+17 more)

### Community 26 - "Community 26"
Cohesion: 0.08
Nodes (26): buildLegacyMeta(), byScrapedSlug, csv, getVariationSize(), HEADERS, IMAGES_ROOT, importLines, isPersonalizationValue() (+18 more)

### Community 28 - "Community 28"
Cohesion: 0.13
Nodes (17): CommercialPolicyRow, commercialPolicyToRow(), CommercialProductPolicyOverrideRow, inputToCommercialPolicyRow(), inputToProductPolicyOverrideRow(), rowToCommercialPolicy(), rowToProductPolicyOverride(), CommercialPolicyRepository (+9 more)

### Community 29 - "Community 29"
Cohesion: 0.13
Nodes (24): buildLoteCsv(), buildSku(), createSkuRegistry(), filterImages(), findMaxBatch(), groupProducts(), HEADERS, loteFileName() (+16 more)

### Community 30 - "Community 30"
Cohesion: 0.22
Nodes (15): generateMetadata(), resolveCategoryDisplayName(), getCachedProductBySlug(), getProductBySlug(), generateMetadata(), ProductPage(), ProductPageProps, BRANDING_ALIASES (+7 more)

### Community 31 - "Community 31"
Cohesion: 0.09
Nodes (22): buildLegacyPriceIndex(), byScrapedSlug, headers, importLines, isPersonalizationValue(), leafCategory(), LEGACY, legacyPriceIndex (+14 more)

### Community 32 - "Community 32"
Cohesion: 0.22
Nodes (20): checkBranding(), checkCoreVersion(), checkEnvExample(), checkEnvLocal(), checkNetlifyReadiness(), checkPreset(), checkRequiredFiles(), checkSupabase() (+12 more)

### Community 33 - "Community 33"
Cohesion: 0.05
Nodes (58): BulkActionsBarProps, BulkActivateDialog(), Props, ImageGalleryField(), ImageGalleryFieldProps, moveImageToPosition(), uploadProductImageAction, UploadProgress (+50 more)

### Community 34 - "Community 34"
Cohesion: 0.11
Nodes (24): AdminEmptyState(), AdminEmptyStateProps, AdminCampanhasPage(), metadata, CartNavLink(), CheckoutPage(), metadata, commercialRuleStatusClass() (+16 more)

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
Cohesion: 0.12
Nodes (26): validateImageFile(), StoreSettingsFormProps, getStoreSettingsAction(), { mockRequireAdmin, mockGetStoreSettings, mockUpdateStoreSettings, mockSaveHero, mockGenerateBranding }, restoreDefaultStorefrontAction(), revalidateStore(), updateStoreSettingsAction(), uploadHeroImageAction() (+18 more)

### Community 41 - "Community 41"
Cohesion: 0.10
Nodes (32): Home(), hasStorefrontCategoryImages(), resolveStorefrontCategoryList(), CategoryChips(), HomeCategories(), ProductsCategoryFilter(), ProductsSearchInput(), categories (+24 more)

### Community 42 - "Community 42"
Cohesion: 0.11
Nodes (33): AdminTourDriver(), AdminTourDriverProps, buildDriverSteps(), clearTourResume(), createTourController(), DEFAULT_WAIT_FOR_TARGET, hasNextOnSameRoute(), isBrowser() (+25 more)

### Community 43 - "Community 43"
Cohesion: 0.23
Nodes (18): createCategoryAction(), deleteCategoryAction(), removeCategoryImageAction(), revalidateCategories(), {
  mockRequireAdmin,
  mockGetCategoryRepository,
  mockFetchProductCountForCategory,
}, sampleCategory, toCategoryInput(), toggleCategoryVisibleAction() (+10 more)

### Community 44 - "Community 44"
Cohesion: 0.21
Nodes (13): calculateSubtotal(), buildPurchaseIntentFromPricing(), createOrderReference(), buildPurchaseIntentFromCart(), enrichPricingWithCartItems(), personalizationSettings, personalizedProduct, samplePricing (+5 more)

### Community 45 - "Community 45"
Cohesion: 0.10
Nodes (19): CACHE_HEADERS, GET(), barlowCondensed, generateMetadata(), inter, RootLayout(), viewport, RequireAdminResult (+11 more)

### Community 46 - "Community 46"
Cohesion: 0.12
Nodes (20): emptyVariation(), ProductForm(), ProductFormProps, productToForm(), VariationRow, visibilityBannerClass(), defaultCategorySlug(), isKnownCategoryValue() (+12 more)

### Community 47 - "Community 47"
Cohesion: 0.10
Nodes (29): CategoryForm(), CategoryFormProps, categoryToForm(), CategoryTreePicker(), CategoryTreePickerProps, FilterBar(), FilterBarProps, CategoryFormPayload (+21 more)

### Community 48 - "Community 48"
Cohesion: 0.10
Nodes (30): fetchImportCatalogSnapshot(), confirmImportAction(), logImportParse(), parseImportCsvAction(), revalidateCatalog(), countUniqueImageUrls(), formatImportSizeLimit(), prepareImportBatch() (+22 more)

### Community 49 - "Community 49"
Cohesion: 0.15
Nodes (7): admin, baselineAfter, baselineBefore, env, results, root, touched

### Community 50 - "Community 50"
Cohesion: 0.22
Nodes (14): metadata, GET(), getAllCommercialPoliciesAdmin(), getCommercialPolicyById(), getPolicyOverridesForProducts(), getStorefrontCommercialPolicies(), createCommercialPolicyAction(), deleteCommercialPolicyAction() (+6 more)

### Community 51 - "Community 51"
Cohesion: 0.19
Nodes (11): BulkActionsBar(), BulkFilterMoveBanner(), BulkFilterMoveBannerProps, BulkMoveCategoryDialog(), BulkMoveCategoryDialogProps, BulkMoveMode, DeleteProductButton(), DeleteProductButtonProps (+3 more)

### Community 52 - "Community 52"
Cohesion: 0.16
Nodes (14): metadata, ELIGIBILITY_STRATEGY_LABELS, formatPolicySummary(), POLICY_CHANNEL_LABELS, policyChannelClass(), STAGE_GATE_LABELS, GATE_KEYS, GateKey (+6 more)

### Community 53 - "Community 53"
Cohesion: 0.27
Nodes (11): brandingDir, loadJson(), main(), mimeFor(), productToRow(), requireEnv(), root, storageDir (+3 more)

### Community 54 - "Community 54"
Cohesion: 0.15
Nodes (10): blockers, checks, e2eBase, nextSteps, opts, parseArgs(), printUsage(), root (+2 more)

### Community 55 - "Community 55"
Cohesion: 0.18
Nodes (5): csv, env, png, results, root

### Community 56 - "Community 56"
Cohesion: 0.05
Nodes (58): metadata, metadata, NotFound(), archiveCommercialRuleAction(), createCommercialRuleAction(), revalidateCommercial(), updateCommercialRuleAction(), validateRuleInput() (+50 more)

### Community 57 - "Community 57"
Cohesion: 0.19
Nodes (11): ClientUploadResult, extFromFile(), runUploadQueue(), uploadProductImageClient(), UploadQueueRunnerOptions, validateClientUploadFile(), AssociationMatch, MediaUploadWizard() (+3 more)

### Community 58 - "Community 58"
Cohesion: 0.09
Nodes (23): cartLiteToProduct(), fetchCatalogProductsByIds(), getClientCatalogCache(), mergeCatalogCache(), mergeCatalogCacheFromLite(), setCatalogCache(), catalogState, ProductRow (+15 more)

### Community 59 - "Community 59"
Cohesion: 0.19
Nodes (14): resolveSalesChannelStageGates(), resolveAccumulationGates(), CHANNEL_DEFAULT_GATES, DEFAULT_DISTRIBUTOR_STAGE_GATES, DEFAULT_RETAIL_STAGE_GATES, DEFAULT_WHOLESALE_STAGE_GATES, mergeStageGates(), resolveChannelStageGates() (+6 more)

### Community 60 - "Community 60"
Cohesion: 0.31
Nodes (8): loadEnv(), loginAdmin(), main(), outDir, record(), report, reportPath, root

### Community 61 - "Community 61"
Cohesion: 0.29
Nodes (8): checkSecurityHeaders(), env, record(), report, root, smokeAdmin(), smokeHomeRegression(), smokePublic()

### Community 62 - "Community 62"
Cohesion: 0.15
Nodes (16): useCart(), useProductPersonalizationPrice(), findDefaultVariation(), resolveVariationBySelection(), colorNameToHex(), colorSwatchBorderClass(), LIGHT_SWATCH_HEX, ProductPurchasePanel() (+8 more)

### Community 63 - "Community 63"
Cohesion: 0.12
Nodes (13): baseProduct, items, otherProduct, settings, baseProduct, settings, settings, validatePersonalizationAddon() (+5 more)

### Community 64 - "Community 64"
Cohesion: 0.09
Nodes (39): BenefitForm(), BenefitFormProps, generateMetadata(), PageProps, metadata, createBenefitItemAction(), deleteBenefitItemAction(), ensureSupabase() (+31 more)

### Community 65 - "Community 65"
Cohesion: 0.29
Nodes (4): outPath, products, root, settings

### Community 66 - "Community 66"
Cohesion: 0.16
Nodes (17): allocatePolicyDiscountToLines(), computeDiscountFromActions(), eligibilityStrategy(), eligibleBaseForPolicy(), evaluateCommercialPolicies(), isLineEligibleByQty(), isPolicyEligible(), isPolicyQtyEligible() (+9 more)

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
Cohesion: 0.16
Nodes (19): baseProduct, engineContext, settings, findVariation(), applyPromotion(), evaluatePromotion(), evaluateQuantityDiscount(), PromotionEvaluation (+11 more)

### Community 73 - "Community 73"
Cohesion: 0.25
Nodes (14): bulkSetProductImagesAction(), exportMediaMapCsvAction(), fetchMediaUploadCatalogAction(), revalidateMediaPaths(), setProductImagesAction(), extractProductsStoragePath(), isProductsStorageUrl(), fetchMediaUploadCatalog() (+6 more)

### Community 74 - "Community 74"
Cohesion: 0.16
Nodes (11): AdminPageHeader(), AdminPageHeaderProps, metadata, metadata, EditProductPage(), EditProductPageProps, generateMetadata(), metadata (+3 more)

### Community 75 - "Community 75"
Cohesion: 0.20
Nodes (12): metadata, metadata, PageProps, metadata, AdminCategoriesPage(), CouponForm(), fetchCategoryVisibilityCounts(), getAllCategoriesAdmin (+4 more)

### Community 76 - "Community 76"
Cohesion: 0.31
Nodes (10): base, clearCart(), clickAddToCartWithRetry(), findAddableProduct(), record(), report, root, runCheckoutFlow() (+2 more)

### Community 77 - "Community 77"
Cohesion: 0.16
Nodes (16): ReferralPromptCard(), CartContent(), CartContentProps, CartPage(), metadata, formatCouponDiscount(), calculateDiscount(), formatPrice() (+8 more)

### Community 78 - "Community 78"
Cohesion: 0.36
Nodes (5): ProductGallery(), ProductGalleryProps, isOptimizableSrc(), ProductImage(), ProductImageProps

### Community 79 - "Community 79"
Cohesion: 0.26
Nodes (11): HeaderBrandMark(), HeaderBrandMarkProps, headerBrandPreviewClasses(), AppearancePreview(), AppearancePreviewProps, HEADER_BRAND_DISPLAY_VALUES, HeaderBrandRender, isValidHeaderBrandDisplay() (+3 more)

### Community 83 - "Community 83"
Cohesion: 0.29
Nodes (7): backupPath, clientEnvPath, fail(), main(), root, rootEnvPath, slug

### Community 84 - "Community 84"
Cohesion: 0.15
Nodes (31): CategoryRepository, assertValidParent(), computeCategoryPath(), legacyProductMatchesCategoryValue(), productMatchesCategorySubtree(), CategoryValidationError, generateCategorySlug(), isStorefrontCategoryEntity() (+23 more)

### Community 85 - "Community 85"
Cohesion: 0.13
Nodes (10): clientDir, copyDir(), displayName, pkg, presetPath, readmePath, replace(), root (+2 more)

### Community 86 - "Community 86"
Cohesion: 0.14
Nodes (11): AdminReorderButtons(), AdminReorderButtonsProps, AdminToggleSwitch(), AdminToggleSwitchProps, ReorderBannerButtons(), ReorderBenefitButtons(), ToggleBannerActiveButton(), ToggleBenefitActiveButton() (+3 more)

### Community 87 - "Community 87"
Cohesion: 0.14
Nodes (20): AdminPage(), metadata, NavCard(), CategoryProductCounts, fetchMediaStatusCounts(), fetchProductsByCategoryCounts(), fetchProductStatusCounts(), MediaStatusCounts (+12 more)

### Community 88 - "Community 88"
Cohesion: 0.35
Nodes (8): getBrandingAssetPublicUrl(), getBrandingPublicUrl(), getProductsPublicUrl(), getSupabaseAnonKey(), getSupabaseServiceRoleKey(), getSupabaseUrl(), readPublicSupabaseKey(), createServerSupabaseClient()

### Community 89 - "Community 89"
Cohesion: 0.22
Nodes (14): assertValidSlug(), clientEnvExists(), envForChildProcess(), getClientEnvPath(), loadClientEnv(), parseEnvLines(), readClientEnvFile(), root (+6 more)

### Community 90 - "Community 90"
Cohesion: 0.17
Nodes (11): BenefitsSectionForm(), BenefitsSectionFormProps, cn(), Alert, AlertProps, AlertSize, AlertType, sizeStyles (+3 more)

### Community 91 - "Community 91"
Cohesion: 0.12
Nodes (28): getStorefrontRoots(), getVisibleChildCategories(), getNavigationContext(), NavigationContext, resolveHintText(), resolveSearchPlaceholder(), categoryProductsHref(), isCategoryFilterActive() (+20 more)

### Community 92 - "Community 92"
Cohesion: 0.22
Nodes (11): AssociationError, AssociationResult, buildExpectedFilename(), findProductByKey(), matchFilesToProducts(), parseAssociationFilename(), ParsedAssociationFilename, sanitizeFileName() (+3 more)

### Community 93 - "Community 93"
Cohesion: 0.19
Nodes (10): computeDiscountFromActions(), couponError(), eligibleMerchandiseAfterPolicyAndAuto(), evaluateManualCoupon(), ManualCouponContext, ManualCouponResult, merchandiseAfterPolicyForLines(), CommercialError (+2 more)

### Community 94 - "Community 94"
Cohesion: 0.17
Nodes (10): digitsToDisplay(), MoneyInput, MoneyInputHandle, MoneyInputProps, PersonalizationSettingsForm(), PersonalizationSettingsFormProps, BRL_DISPLAY, formatBrlMoneyInput() (+2 more)

### Community 95 - "Community 95"
Cohesion: 0.25
Nodes (12): BRANDING_LOGO_FILENAMES, LEGACY_BRANDING_SOURCE_DIR, readBrandingLogoSourceBuffer(), resolveBrandingLogoSourcePath(), resolveClientBrandingDir(), root, loadEnvLocal(), main() (+4 more)

### Community 96 - "Community 96"
Cohesion: 0.22
Nodes (10): Find-SpecifyRoot(), Format-SpecKitCommand(), Get-CurrentBranch(), Get-FeaturePathsEnv(), Get-InvokeSeparator(), Get-Python3Command(), Get-RepoRoot(), Resolve-SpecifyInitDir() (+2 more)

### Community 97 - "Community 97"
Cohesion: 0.24
Nodes (11): buildHeaderLogoWebp(), FAVICON_SIZES, generateBrandingAssets(), resizeContainedSquare(), brandingDir, copyDir(), copyFile(), deployDir (+3 more)

### Community 98 - "Community 98"
Cohesion: 0.24
Nodes (9): loadCatalogFromDisk(), CATEGORIES_PATH, ensureStorage(), loadCategoriesFromDisk(), persistCategories(), readFromDisk(), STORAGE_DIR, writeToDisk() (+1 more)

### Community 99 - "Community 99"
Cohesion: 0.15
Nodes (13): dependencies, clsx, driver.js, framer-motion, headroom-ai, lucide-react, next, react (+5 more)

### Community 100 - "Community 100"
Cohesion: 0.29
Nodes (11): BANNERS, demoDir, main(), mimeFor(), productsPublicUrl(), requireEnv(), root, syncBanners() (+3 more)

### Community 101 - "Community 101"
Cohesion: 0.22
Nodes (6): clientSlug, count, key, runId, supabase, url

### Community 102 - "Community 102"
Cohesion: 0.33
Nodes (6): buildPayload(), clientSlug, key, main(), supabase, url

### Community 103 - "Community 103"
Cohesion: 0.31
Nodes (7): CATALOG_PATH, ensureStorage(), persistCatalog(), readFromDisk(), SEED_PATH, STORAGE_DIR, writeToDisk()

### Community 104 - "Community 104"
Cohesion: 0.17
Nodes (12): devDependencies, jsdom, playwright, tailwindcss, @tailwindcss/postcss, @testing-library/react, @testing-library/user-event, @types/node (+4 more)

### Community 106 - "Community 106"
Cohesion: 0.10
Nodes (24): categories, mockCreateProductAction, mockPush, mockRefresh, mockUpdateProductAction, categoryImageUrl(), categoriesState, cardRing() (+16 more)

### Community 111 - "Community 111"
Cohesion: 0.25
Nodes (6): allHits, EXCLUDE_DIR_NAMES, FORBIDDEN_PATTERNS, root, SCAN_DIRS, TEXT_EXTENSIONS

### Community 114 - "Community 114"
Cohesion: 0.50
Nodes (3): name, private, version

## Knowledge Gaps
- **612 isolated node(s):** `mapRows`, `inventoryRows`, `importRows`, `importBySlug`, `importOrder` (+607 more)
  These have ≤1 connection - possible missing edges or undocumented components.
- **12 thin communities (<3 nodes) omitted from report** — run `graphify query` to explore isolated nodes.

## Suggested Questions
_Questions this graph is uniquely positioned to answer:_

- **Why does `Product` connect `Community 58` to `Community 4`, `Community 7`, `Community 10`, `Community 13`, `Community 20`, `Community 24`, `Community 25`, `Community 33`, `Community 36`, `Community 41`, `Community 44`, `Community 46`, `Community 48`, `Community 51`, `Community 62`, `Community 63`, `Community 72`, `Community 77`, `Community 93`, `Community 103`?**
  _High betweenness centrality (0.064) - this node is a cross-community bridge._
- **Why does `requireAdmin()` connect `Community 33` to `Community 64`, `Community 36`, `Community 40`, `Community 73`, `Community 43`, `Community 45`, `Community 48`, `Community 50`, `Community 20`, `Community 88`, `Community 56`?**
  _High betweenness centrality (0.047) - this node is a cross-community bridge._
- **Why does `getButtonClassName()` connect `Community 34` to `Community 2`, `Community 3`, `Community 4`, `Community 5`, `Community 11`, `Community 12`, `Community 20`, `Community 21`, `Community 24`, `Community 33`, `Community 36`, `Community 40`, `Community 41`, `Community 51`, `Community 57`, `Community 64`, `Community 74`, `Community 75`, `Community 77`, `Community 86`, `Community 87`, `Community 91`, `Community 106`?**
  _High betweenness centrality (0.039) - this node is a cross-community bridge._
- **Are the 2 inferred relationships involving `getButtonClassName()` (e.g. with `AdminProductsPage()` and `ProductsPage()`) actually correct?**
  _`getButtonClassName()` has 2 INFERRED edges - model-reasoned connections that need verification._
- **Are the 2 inferred relationships involving `getStoreSettings` (e.g. with `AdminProductsPage()` and `generateMetadata()`) actually correct?**
  _`getStoreSettings` has 2 INFERRED edges - model-reasoned connections that need verification._
- **Are the 2 inferred relationships involving `getDataProvider()` (e.g. with `EditBenefitPage()` and `NewBenefitPage()`) actually correct?**
  _`getDataProvider()` has 2 INFERRED edges - model-reasoned connections that need verification._
- **What connects `mapRows`, `inventoryRows`, `importRows` to the rest of the system?**
  _638 weakly-connected nodes found - possible documentation gaps or missing edges._