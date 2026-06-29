import { Metadata } from 'next'
import Link from 'next/link'
import { Suspense } from 'react'
import { ProductCard } from '@/components/product/product-card'
import { getButtonClassName } from '@/components/ui/button'
import { AdminPagination } from '@/components/admin/admin-pagination'
import { ProductsCategoryFilter } from '@/components/commerce/products-category-filter'
import { ProductsCategoryChips } from '@/components/commerce/products-category-chips'
import { CategoryBreadcrumb } from '@/components/commerce/category-breadcrumb'
import { CategoryTreeNav } from '@/components/commerce/category-tree-nav'
import { ProductsSearchInput } from '@/components/commerce/products-search-input'
import { queryStorefrontProducts } from '@/lib/products'
import { getStorefrontCategories } from '@/lib/categories'
import {
  hasStorefrontCategoryImages,
  isCategoryFilterActive,
  productsPageHref,
  resolveCategoryHeading,
  resolveStorefrontCategoryList,
  resolveStorefrontNavCategories,
} from '@/lib/catalog/storefront-categories'
import { getVisibleChildCategories } from '@/lib/catalog/category-tree'
import { getStoreSettings } from '@/lib/store/settings-repository'
import { buildPageMetadata } from '@/lib/store/build-metadata'

export const revalidate = 60

export async function generateMetadata(): Promise<Metadata> {
  const settings = await getStoreSettings()
  return buildPageMetadata(
    settings,
    'Produtos',
    'Confira nossa seleção completa de produtos esportivos',
    '/products'
  )
}

interface ProductsPageProps {
  searchParams: Promise<Record<string, string | undefined>>
}

export default async function ProductsPage({ searchParams }: ProductsPageProps) {
  const params = await searchParams
  const { category, q } = params
  const page = Math.max(1, parseInt(params.page ?? '1', 10) || 1)
  const pageSize = 24
  const allCategories = await getStorefrontCategories()
  const categories = resolveStorefrontCategoryList(allCategories)
  const navCategories = resolveStorefrontNavCategories(allCategories, category)
  const showVisualCategories = hasStorefrontCategoryImages(allCategories)
  const activeNode = category
    ? allCategories.find((c) => isCategoryFilterActive(category, c))
    : undefined
  const navSectionLabel = activeNode
    ? getVisibleChildCategories(allCategories, activeNode.id).length > 0
      ? `Dentro de ${activeNode.name}`
      : activeNode.parentId
        ? `Mais em ${allCategories.find((c) => c.id === activeNode.parentId)?.name ?? 'categoria'}`
        : null
    : null

  const result = await queryStorefrontProducts({
    category,
    q,
    pagination: { page, pageSize },
    fields: 'list',
  })

  const filteredProducts = result.products
  const heading = resolveCategoryHeading(category, allCategories)
  const currentParams = new URLSearchParams(
    Object.entries(params).filter(([, v]) => v != null) as [string, string][]
  )

  return (
    <div className="w-full">
      <div className="border-b border-hairline bg-canvas">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-10 sm:py-12">
          <p className="text-xs font-semibold uppercase tracking-[0.15em] text-mute">
            Catálogo
          </p>
          <h1 className="mt-2 text-3xl font-bold tracking-tight text-ink sm:text-4xl">
            {heading}
          </h1>
          <p className="mt-2 text-mute">
            {result.total}{' '}
            {result.total === 1 ? 'produto' : 'produtos'} disponíveis
          </p>

          <CategoryBreadcrumb
            categories={allCategories}
            activeCategory={category}
            searchParams={params}
          />

          <div className="mt-4 w-full max-w-lg">
            <Suspense fallback={<div className="h-9 rounded-lg border border-hairline bg-soft-cloud" />}>
              <ProductsSearchInput initialValue={q ?? ''} />
            </Suspense>
          </div>

          <CategoryTreeNav
            categories={allCategories}
            activeCategory={category}
            searchParams={params}
          />

          {!showVisualCategories && (
            <ProductsCategoryChips
              categories={navCategories}
              activeCategory={category}
              searchParams={params}
              sectionLabel={navSectionLabel}
            />
          )}
        </div>
      </div>

      {showVisualCategories && (
        <ProductsCategoryFilter
          categories={navCategories}
          activeCategory={category}
          searchParams={params}
        />
      )}

      <section className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-12 sm:py-16">
        {filteredProducts.length > 0 ? (
          <>
            <div className="grid grid-cols-2 gap-4 md:grid-cols-3 md:gap-6 lg:grid-cols-4">
              {filteredProducts.map((product) => (
                <ProductCard key={product.id} product={product} />
              ))}
            </div>
            {result.totalPages > 1 && (
              <div className="mt-10">
                <AdminPagination
                  page={result.page}
                  pageSize={result.pageSize}
                  total={result.total}
                  totalPages={result.totalPages}
                  basePath="/products"
                  currentParams={currentParams}
                />
              </div>
            )}
          </>
        ) : (
          <div className="border border-hairline bg-soft-cloud px-6 py-16 text-center">
            <p className="text-lg font-semibold text-ink">
              {q ? `Nenhum resultado para "${q}"` : 'Nenhum produto nesta categoria'}
            </p>
            <p className="mt-2 text-sm text-mute">
              {q
                ? 'Tente outros termos ou limpe a busca para ver todos os produtos.'
                : 'Explore outras categorias ou volte ao catálogo completo.'}
            </p>
            <Link
              href={productsPageHref({ preserve: params })}
              className={`mt-6 inline-flex ${getButtonClassName('outline', 'sm')}`}
            >
              Ver todos os produtos
            </Link>
          </div>
        )}
      </section>
    </div>
  )
}
