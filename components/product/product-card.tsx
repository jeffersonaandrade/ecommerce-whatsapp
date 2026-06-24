import Image from 'next/image'
import Link from 'next/link'
import { Product } from '@/types/product'
import { formatPrice } from '@/lib/formatters'
import { colorNameToHex, colorSwatchBorderClass } from '@/lib/colors'
import { getButtonClassName } from '@/components/ui/button'

interface ProductCardProps {
  product: Product
}

export function ProductCard({ product }: ProductCardProps) {
  const hasPromotion =
    product.promotionalPrice && product.promotionalPrice < product.price
  const displayPrice = hasPromotion ? product.promotionalPrice : product.price
  const hasStock = product.variations.some((v) => v.stock > 0)

  const colorOptions = Array.from(
    new Set(product.variations.map((v) => v.color).filter(Boolean))
  )

  return (
    <article className="group flex flex-col">
      {/* Image — DS §9.2: 1:1, soft-cloud, flat, subtle hover */}
      <Link
        href={`/products/${product.slug}`}
        className="relative mb-3 block aspect-square overflow-hidden bg-soft-cloud"
      >
        <Image
          src={product.images[0]}
          alt={product.name}
          fill
          className="object-cover transition-opacity duration-200 group-hover:opacity-95"
          sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
        />

        {!hasStock && (
          <div className="absolute inset-0 flex items-center justify-center bg-ink/50">
            <span className="text-sm font-semibold uppercase tracking-wide text-canvas">
              Fora de estoque
            </span>
          </div>
        )}
      </Link>

      {/* Metadata — DS §9.2: clean hierarchy below image */}
      <div className="flex flex-col gap-2">
        <p className="text-xs font-medium uppercase tracking-wide text-mute">
          {product.category}
          {product.club ? ` · ${product.club}` : ''}
        </p>

        <Link href={`/products/${product.slug}`}>
          <h3 className="line-clamp-2 text-base font-semibold leading-snug text-ink transition-colors hover:text-charcoal">
            {product.name}
          </h3>
        </Link>

        {/* Price — DS §9.2: promo in sale red, no decorative badge */}
        <div className="flex flex-wrap items-baseline gap-x-2 gap-y-0.5">
          {hasPromotion ? (
            <>
              <span className="text-lg font-bold text-sale">
                {formatPrice(displayPrice!)}
              </span>
              <span className="text-sm text-mute line-through">
                {formatPrice(product.price)}
              </span>
            </>
          ) : (
            <span className="text-lg font-bold text-ink">
              {formatPrice(product.price)}
            </span>
          )}
        </div>

        {/* Swatches — discrete, white swatch border preserved */}
        {colorOptions.length > 0 && (
          <div className="flex gap-1.5 pt-0.5" aria-label="Cores disponíveis">
            {colorOptions.map((color) => (
              <span
                key={color}
                className={`h-4 w-4 shrink-0 rounded-full border ${colorSwatchBorderClass(color!)}`}
                title={color}
                style={{ backgroundColor: colorNameToHex(color!) }}
              />
            ))}
          </div>
        )}

        {/* CTAs — DS §9.1 pill links */}
        <div className="flex flex-col gap-2 pt-2 sm:flex-row">
          {hasStock ? (
            <Link
              href={`/products/${product.slug}`}
              className={getButtonClassName('default', 'sm', 'w-full sm:flex-1')}
            >
              Escolher opções
            </Link>
          ) : (
            <button
              type="button"
              disabled
              className={getButtonClassName('default', 'sm', 'w-full sm:flex-1')}
            >
              Fora de estoque
            </button>
          )}
          <Link
            href={`/products/${product.slug}`}
            className={getButtonClassName('outline', 'sm', 'w-full sm:flex-1')}
          >
            Ver detalhes
          </Link>
        </div>
      </div>
    </article>
  )
}
