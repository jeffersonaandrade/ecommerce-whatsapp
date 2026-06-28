'use client'

import Link from 'next/link'
import { useCart } from '@/context/cart-context'
import { formatPrice } from '@/lib/formatters'
import type { PricedCartLine } from '@/types/cart-pricing'
import { ProductImage } from '@/components/product/product-image'
import { hasPersonalizationAddons } from '@/lib/personalization/validate-personalization'

const qtyButtonClass =
  'inline-flex h-11 w-11 items-center justify-center text-ink transition-colors hover:bg-soft-cloud disabled:opacity-40 disabled:cursor-not-allowed'

interface CartLineItemProps {
  line: PricedCartLine
}

export function CartLineItem({ line }: CartLineItemProps) {
  const { updateQuantity, removeItem } = useCart()

  const variationLabel = [line.size, line.color].filter(Boolean).join(' · ')
  const isPersonalized = hasPersonalizationAddons(line.addons)
  const personalization = line.addons?.personalization

  return (
    <article className="flex gap-4 py-6">
      <Link
        href={`/products/${line.slug}`}
        className="relative h-24 w-24 shrink-0 overflow-hidden bg-soft-cloud sm:h-28 sm:w-28"
      >
        <ProductImage src={line.image} alt={line.name} fill />
      </Link>

      <div className="flex min-w-0 flex-1 flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div className="min-w-0 space-y-1">
          <Link
            href={`/products/${line.slug}`}
            className="line-clamp-2 font-semibold text-ink transition-colors hover:text-charcoal"
          >
            {line.name}
          </Link>
          {variationLabel && (
            <p className="text-sm text-mute">{variationLabel}</p>
          )}
          {personalization && (
            <div className="text-sm text-charcoal">
              <p>Nome: {personalization.name}</p>
              <p>Número: {personalization.number}</p>
              {personalization.notes?.trim() && (
                <p className="text-mute">Obs: {personalization.notes.trim()}</p>
              )}
            </div>
          )}
          <p className="text-sm font-medium text-charcoal">
            {formatPrice(line.unitPrice)}
            {line.addonsUnitTotal > 0 && (
              <span className="text-mute">
                {' '}
                + {formatPrice(line.addonsUnitTotal)} personalização
              </span>
            )}
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3 sm:gap-4">
          <div
            className="inline-flex items-center overflow-hidden rounded-full border border-hairline"
            aria-label="Quantidade"
          >
            <button
              type="button"
              onClick={() =>
                updateQuantity(
                  line.productId,
                  line.variationId,
                  line.quantity - 1,
                  line.addons
                )
              }
              className={qtyButtonClass}
              aria-label="Diminuir quantidade"
            >
              −
            </button>
            <span className="min-w-10 px-1 text-center text-sm font-semibold text-ink">
              {line.quantity}
            </span>
            <button
              type="button"
              onClick={() =>
                updateQuantity(
                  line.productId,
                  line.variationId,
                  line.quantity + 1,
                  line.addons
                )
              }
              disabled={isPersonalized || line.quantity >= line.maxStock}
              className={qtyButtonClass}
              aria-label="Aumentar quantidade"
            >
              +
            </button>
          </div>

          <p className="min-w-20 text-right text-base font-bold text-ink">
            {formatPrice(line.lineMerchandiseTotal)}
          </p>

          <button
            type="button"
            onClick={() => removeItem(line.productId, line.variationId, line.addons)}
            className="text-sm font-medium text-mute transition-colors hover:text-error"
          >
            Remover
          </button>
        </div>
      </div>
    </article>
  )
}
