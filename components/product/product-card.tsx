import Image from 'next/image'
import Link from 'next/link'
import { Product } from '@/types/product'
import { formatPrice, calculateDiscount } from '@/lib/formatters'
import { colorNameToHex } from '@/lib/colors'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'

interface ProductCardProps {
  product: Product
}

export function ProductCard({ product }: ProductCardProps) {
  const hasPromotion = product.promotionalPrice && product.promotionalPrice < product.price
  const discount = hasPromotion ? calculateDiscount(product.price, product.promotionalPrice!) : 0
  const displayPrice = hasPromotion ? product.promotionalPrice : product.price
  const hasStock = product.variations.some((v) => v.stock > 0)

  return (
    <div className="group">
      {/* Image Container */}
      <div className="relative overflow-hidden rounded-lg bg-gray-100 aspect-square mb-4">
        <Image
          src={product.images[0]}
          alt={product.name}
          fill
          className="object-cover group-hover:scale-105 transition-transform duration-300"
          sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
        />

        {/* Discount Badge */}
        {hasPromotion && (
          <div className="absolute top-3 right-3 z-10">
            <Badge variant="error" className="bg-red-500 text-white">
              -{discount}%
            </Badge>
          </div>
        )}

        {/* Out of Stock Overlay */}
        {!hasStock && (
          <div className="absolute inset-0 bg-black/40 flex items-center justify-center">
            <span className="text-white font-semibold text-lg">Fora de Estoque</span>
          </div>
        )}
      </div>

      {/* Content */}
      <div className="space-y-3">
        {/* Category and Club */}
        <div className="flex items-center gap-2 flex-wrap">
          <Badge variant="default" className="text-xs">
            {product.category}
          </Badge>
          {product.club && (
            <Badge variant="default" className="text-xs">
              {product.club}
            </Badge>
          )}
        </div>

        {/* Product Name */}
        <Link href={`/products/${product.slug}`}>
          <h3 className="font-semibold text-base line-clamp-2 hover:text-gray-600 transition-colors">
            {product.name}
          </h3>
        </Link>

        {/* Short Description */}
        <p className="text-sm text-gray-600 line-clamp-2">
          {product.shortDescription}
        </p>

        {/* Price */}
        <div className="space-y-1">
          {hasPromotion ? (
            <div className="flex items-center gap-2">
              <span className="text-xl font-bold text-black">
                {formatPrice(displayPrice!)}
              </span>
              <span className="text-sm text-gray-500 line-through">
                {formatPrice(product.price)}
              </span>
            </div>
          ) : (
            <span className="text-xl font-bold text-black">
              {formatPrice(product.price)}
            </span>
          )}
        </div>

        {/* Variations Preview */}
        {product.variations.some((v) => v.color) && (
          <div className="flex gap-2">
            {Array.from(
              new Set(product.variations.map((v) => v.color).filter(Boolean))
            ).map((color) => (
              <div
                key={color}
                className="w-5 h-5 rounded-full border-2 border-gray-300"
                title={color}
                style={{
                  backgroundColor: colorNameToHex(color!),
                }}
              />
            ))}
          </div>
        )}

        {/* CTA Buttons */}
        <div className="flex gap-2 pt-2">
          {hasStock ? (
            <Link href={`/products/${product.slug}`} className="flex-1">
              <Button variant="default" size="md" className="w-full">
                Escolher opções
              </Button>
            </Link>
          ) : (
            <Button variant="default" size="md" className="flex-1" disabled>
              Fora de estoque
            </Button>
          )}
          <Link href={`/products/${product.slug}`} className="flex-1">
            <Button
              variant="outline"
              size="md"
              className="w-full"
            >
              Ver detalhes
            </Button>
          </Link>
        </div>
      </div>
    </div>
  )
}
