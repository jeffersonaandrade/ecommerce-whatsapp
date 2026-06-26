import { Metadata } from 'next'
import Link from 'next/link'
import { ProductCard } from '@/components/product/product-card'
import { getButtonClassName } from '@/components/ui/button'
import { getAllProducts, getProductsByCategory } from '@/lib/products'
import { getStorefrontCategories } from '@/lib/categories'
import {
  categoryProductsHref,
  isCategoryFilterActive,
  resolveCategoryHeading,
  resolveStorefrontCategoryList,
} from '@/lib/catalog/storefront-categories'
import { getStoreSettings } from '@/lib/store/settings-repository'
import { buildPageMetadata } from '@/lib/store/build-metadata'

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
  searchParams: Promise<{ category?: string }>
}

export default async function ProductsPage({ searchParams }: ProductsPageProps) {
  const { category } = await searchParams
  const categories = resolveStorefrontCategoryList(await getStorefrontCategories())

  const filteredProducts = category
    ? await getProductsByCategory(category)
    : await getAllProducts()

  const heading = resolveCategoryHeading(category, categories)

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
            {filteredProducts.length}{' '}
            {filteredProducts.length === 1 ? 'produto' : 'produtos'} disponíveis
          </p>

          <nav
            className="mt-6 flex flex-wrap gap-2"
            aria-label="Filtrar por categoria"
          >
            <Link
              href="/products"
              className={getButtonClassName(
                category ? 'secondary' : 'default',
                'sm'
              )}
            >
              Todos
            </Link>
            {categories.map((cat) => (
              <Link
                key={cat.id}
                href={categoryProductsHref(cat.slug)}
                className={getButtonClassName(
                  isCategoryFilterActive(category, cat) ? 'default' : 'secondary',
                  'sm'
                )}
              >
                {cat.name}
              </Link>
            ))}
          </nav>
        </div>
      </div>

      <section className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-12 sm:py-16">
        {filteredProducts.length > 0 ? (
          <div className="grid grid-cols-2 gap-4 md:grid-cols-3 md:gap-6 lg:grid-cols-4">
            {filteredProducts.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        ) : (
          <div className="border border-hairline bg-soft-cloud px-6 py-16 text-center">
            <p className="text-lg font-semibold text-ink">
              Nenhum produto nesta categoria
            </p>
            <p className="mt-2 text-sm text-mute">
              Explore outras categorias ou volte ao catálogo completo.
            </p>
            <Link
              href="/products"
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
