'use client'

import Image from 'next/image'
import Link from 'next/link'
import { useCart } from '@/context/cart-context'
import { formatPrice } from '@/lib/formatters'
import type { CartLine } from '@/lib/cart-utils'

const qtyButtonClass =
  'inline-flex h-11 w-11 items-center justify-center text-ink transition-colors hover:bg-soft-cloud disabled:opacity-40 disabled:cursor-not-allowed'

interface CartLineItemProps {
  line: CartLine
}

export function CartLineItem({ line }: CartLineItemProps) {
  const { updateQuantity, removeItem } = useCart()

  const variationLabel = [line.size, line.color].filter(Boolean).join(' · ')

  return (
    <article className="flex gap-4 py-6">
      {/* Image — DS §9.2: 1:1, soft-cloud, flat */}
      <Link
        href={`/products/${line.slug}`}
        className="relative h-24 w-24 shrink-0 overflow-hidden bg-soft-cloud sm:h-28 sm:w-28"
      >
        {line.image && (
          <Image
            src={line.image}
            alt={line.name}
            fill
            className="object-cover"
            sizes="112px"
          />
        )}
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
          <p className="text-sm font-medium text-charcoal">
            {formatPrice(line.unitPrice)}
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3 sm:gap-4">
          {/* Quantity — DS §7 pills; §9.4 min 44px touch */}
          <div
            className="inline-flex items-center overflow-hidden rounded-full border border-hairline"
            aria-label="Quantidade"
          >
            <button
              type="button"
              onClick={() =>
                updateQuantity(line.productId, line.variationId, line.quantity - 1)
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
                updateQuantity(line.productId, line.variationId, line.quantity + 1)
              }
              disabled={line.quantity >= line.maxStock}
              className={qtyButtonClass}
              aria-label="Aumentar quantidade"
            >
              +
            </button>
          </div>

          <p className="min-w-20 text-right text-base font-bold text-ink">
            {formatPrice(line.lineTotal)}
          </p>

          <button
            type="button"
            onClick={() => removeItem(line.productId, line.variationId)}
            className="text-sm font-medium text-mute transition-colors hover:text-error"
          >
            Remover
          </button>
        </div>
      </div>
    </article>
  )
}
