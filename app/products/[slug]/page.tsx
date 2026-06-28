import { Metadata } from 'next'
import { getProductBySlug } from '@/lib/products'
import { formatPrice } from '@/lib/formatters'
import { ProductPurchasePanel } from '@/components/product/product-purchase-panel'
import { ProductGallery } from '@/components/product/product-gallery'
import { getStoreSettings } from '@/lib/store/settings-repository'
import { brandingAssetUrl } from '@/lib/store/branding-url'
import { getStorefrontCategories } from '@/lib/categories'
import { resolveCategoryDisplayName } from '@/lib/catalog/category-utils'
import { stripHtml } from '@/lib/catalog/product-utils'
import { CartCatalogSeeder } from '@/components/product/cart-catalog-seeder'

export const revalidate = 60

interface ProductPageProps {
  params: Promise<{ slug: string }>
}

export async function generateMetadata({
  params,
}: ProductPageProps): Promise<Metadata> {
  const { slug } = await params
  const product = await getProductBySlug(slug)
  const settings = await getStoreSettings()
  const canonical = `${settings.siteUrl}/products/${slug}`
  const ogFallback = brandingAssetUrl(settings.ogImagePath, settings.updatedAt)
  const productImage = product?.images[0]

  if (!product) {
    return { title: 'Produto não encontrado' }
  }

  return {
    title: product.name,
    description: stripHtml(product.shortDescription),
    alternates: { canonical },
    openGraph: {
      title: product.name,
      description: stripHtml(product.shortDescription),
      url: canonical,
      siteName: settings.storeName,
      type: 'website',
      images: productImage
        ? [{ url: productImage, alt: product.name }]
        : ogFallback
          ? [{ url: `${settings.siteUrl}${ogFallback}`, alt: settings.storeName }]
          : [],
    },
    twitter: {
      card: 'summary_large_image',
      title: product.name,
      description: stripHtml(product.shortDescription),
      images: productImage ? [productImage] : ogFallback ? [`${settings.siteUrl}${ogFallback}`] : [],
    },
    robots: { index: true, follow: true },
  }
}

export default async function ProductPage({ params }: ProductPageProps) {
  const { slug } = await params
  const [product, categories] = await Promise.all([
    getProductBySlug(slug),
    getStorefrontCategories(),
  ])

  if (!product) {
    return (
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-16 text-center">
        <h1 className="mb-4 text-2xl font-bold text-ink">Produto não encontrado</h1>
        <p className="text-mute">
          O produto que você está procurando não existe.
        </p>
      </div>
    )
  }

  const hasPromotion =
    product.promotionalPrice && product.promotionalPrice < product.price
  const displayPrice = hasPromotion ? product.promotionalPrice : product.price
  const inStock = product.variations.some((v) => v.stock > 0)
  const categoryLabel = resolveCategoryDisplayName(product.category, categories)
  const shortDescription = stripHtml(product.shortDescription)
  const longDescription = stripHtml(product.longDescription)

  return (
    <div className="w-full">
      <CartCatalogSeeder products={[product]} />
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-12 sm:py-16">
        {/* DS §5 PDP: 1 col mobile, 2 col desktop; gap-8 lg:gap-12 */}
        <div className="grid grid-cols-1 items-start gap-8 lg:grid-cols-2 lg:gap-12">
          <ProductGallery images={product.images} alt={product.name} />

          {/* Purchase column — editorial hierarchy */}
          <div className="space-y-6 lg:sticky lg:top-20 lg:self-start">
            <div className="space-y-3">
              <p className="text-xs font-medium uppercase tracking-wide text-mute">
                {categoryLabel}
                {product.club ? ` · ${product.club}` : ''}
              </p>

              <h1 className="text-3xl font-bold tracking-tight text-ink sm:text-4xl">
                {product.name}
              </h1>

              <p className="text-base leading-relaxed text-mute">
                {shortDescription}
              </p>
            </div>

            {/* Price — DS §4 price-xl; promo in sale red, no decorative badge */}
            <div>
              {hasPromotion ? (
                <div className="flex flex-wrap items-baseline gap-x-3 gap-y-1">
                  <span className="text-4xl font-bold text-sale">
                    {formatPrice(displayPrice!)}
                  </span>
                  <span className="text-lg text-mute line-through">
                    {formatPrice(product.price)}
                  </span>
                </div>
              ) : (
                <span className="text-4xl font-bold text-ink">
                  {formatPrice(product.price)}
                </span>
              )}
            </div>

            <p
              className={`text-sm font-medium ${inStock ? 'text-success' : 'text-error'}`}
            >
              {inStock ? 'Em estoque' : 'Fora de estoque'}
            </p>

            <ProductPurchasePanel product={product} />

            <div className="border-t border-hairline pt-6">
              <h2 className="mb-3 text-lg font-semibold text-ink">Descrição</h2>
              <p className="leading-relaxed text-charcoal">
                {longDescription}
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
