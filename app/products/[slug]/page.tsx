import { Metadata } from 'next'
import Image from 'next/image'
import { getProductBySlug } from '@/lib/products'
import { formatPrice } from '@/lib/formatters'
import { ProductPurchasePanel } from '@/components/product/product-purchase-panel'

interface ProductPageProps {
  params: Promise<{ slug: string }>
}

export async function generateMetadata({
  params,
}: ProductPageProps): Promise<Metadata> {
  const { slug } = await params
  const product = getProductBySlug(slug)

  return {
    title: product?.name || 'Produto não encontrado',
    description: product?.shortDescription || '',
  }
}

export default async function ProductPage({ params }: ProductPageProps) {
  const { slug } = await params
  const product = getProductBySlug(slug)

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

  return (
    <div className="w-full">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-12 sm:py-16">
        {/* DS §5 PDP: 1 col mobile, 2 col desktop; gap-8 lg:gap-12 */}
        <div className="grid grid-cols-1 items-start gap-8 lg:grid-cols-2 lg:gap-12">
          {/* Gallery — DS §9.2: 1:1, soft-cloud, flat */}
          <div className="space-y-3">
            <div className="relative aspect-square overflow-hidden bg-soft-cloud">
              <Image
                src={product.images[0]}
                alt={product.name}
                fill
                className="object-cover"
                sizes="(max-width: 1024px) 100vw, 50vw"
                priority
              />
            </div>
            {product.images.length > 1 && (
              <div className="grid grid-cols-4 gap-2">
                {product.images.map((image, idx) => (
                  <div
                    key={idx}
                    className="relative aspect-square overflow-hidden bg-soft-cloud"
                  >
                    <Image
                      src={image}
                      alt={`${product.name} ${idx + 1}`}
                      fill
                      className="object-cover opacity-90"
                      sizes="25vw"
                    />
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Purchase column — editorial hierarchy */}
          <div className="space-y-6 lg:sticky lg:top-20 lg:self-start">
            <div className="space-y-3">
              <p className="text-xs font-medium uppercase tracking-wide text-mute">
                {product.category}
                {product.club ? ` · ${product.club}` : ''}
              </p>

              <h1 className="text-3xl font-bold tracking-tight text-ink sm:text-4xl">
                {product.name}
              </h1>

              <p className="text-base leading-relaxed text-mute">
                {product.shortDescription}
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
                {product.longDescription}
              </p>
            </div>

            {/* Meta — DS §8 flat surface */}
            <div className="space-y-2 border border-hairline bg-soft-cloud p-4 text-sm">
              <div className="flex justify-between gap-4">
                <span className="text-mute">SKU</span>
                <span className="font-medium text-ink">
                  {product.variations[0].sku}
                </span>
              </div>
              <div className="flex justify-between gap-4">
                <span className="text-mute">Status</span>
                <span className="font-medium capitalize text-ink">
                  {product.status}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
