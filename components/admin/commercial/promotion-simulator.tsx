'use client'

import { useMemo, useState } from 'react'
import { QuantityDiscountConfig } from '@/types/commercial-rule'
import { applyPromotion } from '@/lib/pricing/apply-promotion'
import { formatPrice } from '@/lib/formatters'
import type { PricedCartLine } from '@/types/cart-pricing'
import { mockPricedCartLine } from '@/lib/pricing/mock-priced-cart-line'

type PromotionSimulatorProps = {
  requiredQuantity: number
  discountAmount: number
  priority: number
  name: string
}

function buildMockLines(quantity: number, unitPrice: number): PricedCartLine[] {
  if (quantity <= 0) return []
  return [
    mockPricedCartLine({
      productId: 'mock',
      variationId: 'mock-v',
      quantity,
      unitPrice,
      name: 'Produto simulado',
      slug: 'mock',
      sku: 'MOCK',
      maxStock: quantity,
    }),
  ]
}

export function PromotionSimulator({
  requiredQuantity,
  discountAmount,
  priority,
  name,
}: PromotionSimulatorProps) {
  const [quantity, setQuantity] = useState(7)
  const [unitPrice, setUnitPrice] = useState(200)

  const result = useMemo(() => {
    if (requiredQuantity < 2 || discountAmount <= 0 || quantity <= 0) {
      return null
    }

    const lines = buildMockLines(quantity, unitPrice)
    const merchandiseSubtotal = lines.reduce((s, l) => s + l.lineMerchandiseTotal, 0)
    const { commercialDiscount, appliedRule } = applyPromotion(
      [
        {
          id: 'sim',
          kind: 'promotion',
          name: name || 'Simulação',
          type: 'quantity_discount',
          status: 'active',
          priority,
          stackable: false,
          appliesTo: 'all_products',
          config: { requiredQuantity, discountAmount },
          createdAt: '',
          updatedAt: '',
        },
      ],
      lines,
      merchandiseSubtotal
    )

    const groups = Math.floor(quantity / requiredQuantity)

    return {
      merchandiseSubtotal,
      commercialDiscount,
      cartTotal: Math.max(0, merchandiseSubtotal - commercialDiscount),
      groups,
      appliedRule,
    }
  }, [requiredQuantity, discountAmount, priority, name, quantity, unitPrice])

  return (
    <div className="space-y-4 rounded-lg border border-hairline bg-soft-cloud p-4">
      <h3 className="text-sm font-semibold uppercase tracking-wide text-ink">
        Simular promoção
      </h3>

      <div className="grid gap-3 sm:grid-cols-2">
        <label className="block space-y-1 text-sm">
          <span className="font-medium text-ink">Quantidade de produtos</span>
          <input
            type="number"
            min={0}
            value={quantity}
            onChange={(e) => setQuantity(Number(e.target.value) || 0)}
            className="w-full rounded-lg border border-hairline px-3 py-2"
          />
        </label>
        <label className="block space-y-1 text-sm">
          <span className="font-medium text-ink">Preço unitário estimado (R$)</span>
          <input
            type="number"
            min={0}
            step="0.01"
            value={unitPrice}
            onChange={(e) => setUnitPrice(Number(e.target.value) || 0)}
            className="w-full rounded-lg border border-hairline px-3 py-2"
          />
        </label>
      </div>

      {result ? (
        <div className="space-y-2 border-t border-hairline pt-4 text-sm">
          <p className="text-mute">
            Regra: floor({quantity}/{requiredQuantity}) × {formatPrice(discountAmount)} ={' '}
            {result.groups} × {formatPrice(discountAmount)}
          </p>
          <div className="flex justify-between">
            <span className="text-mute">Subtotal</span>
            <span>{formatPrice(result.merchandiseSubtotal)}</span>
          </div>
          <div className="flex justify-between text-success">
            <span>Desconto</span>
            <span>-{formatPrice(result.commercialDiscount)}</span>
          </div>
          <div className="flex justify-between font-semibold text-ink">
            <span>Total</span>
            <span>{formatPrice(result.cartTotal)}</span>
          </div>
        </div>
      ) : (
        <p className="text-sm text-mute">
          Preencha quantidade necessária e valor do desconto para simular.
        </p>
      )}
    </div>
  )
}
