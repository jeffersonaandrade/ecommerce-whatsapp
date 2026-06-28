import Link from 'next/link'
import { Product } from '@/types/product'
import { formatPrice } from '@/lib/formatters'
import { colorNameToHex, colorSwatchBorderClass } from '@/lib/colors'
import { ProductImage } from '@/components/product/product-image'

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

  const brandLabel = product.club ?? product.category

  return (
    <article className="group flex flex-col">
      <Link
        href={`/products/${product.slug}`}
        className="relative mb-4 block aspect-square overflow-hidden bg-soft-cloud"
      >
        <ProductImage
          src={product.images[0] ?? ''}
          alt={product.name}
          fill
          sizes="(max-width: 768px) 50vw, 25vw"
          className="transition-opacity duration-200 group-hover:opacity-95"
        />
        {!hasStock && (
          <div className="absolute inset-0 flex items-center justify-center bg-ink/50">
            <span className="text-xs font-semibold uppercase tracking-wide text-canvas">
              Esgotado
            </span>
          </div>
        )}
      </Link>

      <div className="flex flex-col gap-1.5">
        <p className="text-xs font-medium uppercase tracking-wide text-mute">
          {brandLabel}
        </p>

        <Link href={`/products/${product.slug}`}>
          <h3 className="line-clamp-2 text-base font-semibold leading-snug text-ink transition-colors hover:text-charcoal">
            {product.name}
          </h3>
        </Link>

        <div className="flex flex-wrap items-baseline gap-x-2 gap-y-0.5 pt-0.5">
          {hasPromotion ? (
            <>
              <span className="text-2xl font-bold text-sale">
                {formatPrice(displayPrice!)}
              </span>
              <span className="text-sm text-mute line-through">
                {formatPrice(product.price)}
              </span>
            </>
          ) : (
            <span className="text-2xl font-bold text-ink">
              {formatPrice(product.price)}
            </span>
          )}
        </div>

        {colorOptions.length > 0 && (
          <div className="flex gap-1.5 pt-1" aria-label="Cores disponíveis">
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

        <Link
          href={`/products/${product.slug}`}
          className="mt-2 inline-flex text-sm font-medium text-ink underline-offset-4 transition-colors hover:text-charcoal hover:underline"
        >
          {hasStock ? 'Ver produto' : 'Indisponível'}
        </Link>
      </div>
    </article>
  )
}
