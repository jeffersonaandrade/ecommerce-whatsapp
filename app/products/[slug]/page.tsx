import { Metadata } from 'next'
import Image from 'next/image'
import { getProductBySlug } from '@/lib/products'
import { formatPrice, calculateDiscount } from '@/lib/formatters'
import { Badge } from '@/components/ui/badge'
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
        <h1 className="text-2xl font-bold mb-4">Produto não encontrado</h1>
        <p className="text-gray-600">
          O produto que você está procurando não existe.
        </p>
      </div>
    )
  }

  const hasPromotion =
    product.promotionalPrice && product.promotionalPrice < product.price
  const discount = hasPromotion
    ? calculateDiscount(product.price, product.promotionalPrice!)
    : 0
  const displayPrice = hasPromotion ? product.promotionalPrice : product.price

  return (
    <div className="w-full">
      {/* Product Content */}
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-12 sm:py-16">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12">
          {/* Gallery */}
          <div className="space-y-4">
            <div className="relative aspect-square overflow-hidden rounded-lg bg-gray-100">
              <Image
                src={product.images[0]}
                alt={product.name}
                fill
                className="object-cover"
                sizes="(max-width: 1024px) 100vw, 50vw"
                priority
              />
            </div>
            <div className="grid grid-cols-4 gap-2">
              {product.images.map((image, idx) => (
                <div
                  key={idx}
                  className="relative aspect-square overflow-hidden rounded-lg bg-gray-100 cursor-pointer hover:opacity-75"
                >
                  <Image
                    src={image}
                    alt={`${product.name} ${idx + 1}`}
                    fill
                    className="object-cover"
                    sizes="25vw"
                  />
                </div>
              ))}
            </div>
          </div>

          {/* Details */}
          <div className="space-y-6">
            {/* Breadcrumb */}
            <div className="flex items-center gap-2">
              <Badge variant="default">{product.category}</Badge>
              {product.club && (
                <Badge variant="default">{product.club}</Badge>
              )}
            </div>

            {/* Title */}
            <div>
              <h1 className="text-3xl sm:text-4xl font-bold mb-2">
                {product.name}
              </h1>
              <p className="text-gray-600">{product.shortDescription}</p>
            </div>

            {/* Price */}
            <div className="space-y-2">
              {hasPromotion ? (
                <div className="flex items-center gap-3">
                  <span className="text-4xl font-bold">
                    {formatPrice(displayPrice!)}
                  </span>
                  <div className="space-y-1">
                    <span className="block text-lg text-gray-500 line-through">
                      {formatPrice(product.price)}
                    </span>
                    <Badge variant="error" className="bg-red-500 text-white">
                      -{discount}%
                    </Badge>
                  </div>
                </div>
              ) : (
                <span className="text-4xl font-bold">
                  {formatPrice(product.price)}
                </span>
              )}
            </div>

            {/* Stock Status */}
            <div>
              {product.variations.some((v) => v.stock > 0) ? (
                <p className="text-green-600 font-medium">✓ Em Estoque</p>
              ) : (
                <p className="text-red-600 font-medium">✗ Fora de Estoque</p>
              )}
            </div>

            <ProductPurchasePanel product={product} />

            {/* Description */}
            <div className="border-t pt-6">
              <h2 className="font-semibold text-lg mb-3">Descrição</h2>
              <p className="text-gray-700 leading-relaxed">
                {product.longDescription}
              </p>
            </div>

            {/* Additional Info */}
            <div className="bg-gray-50 p-4 rounded-lg space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-gray-600">SKU:</span>
                <span className="font-medium">
                  {product.variations[0].sku}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Status:</span>
                <span className="font-medium">{product.status}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
