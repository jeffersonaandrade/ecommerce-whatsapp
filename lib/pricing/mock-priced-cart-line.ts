import type { PricedCartLine } from '@/types/cart-pricing'

/** Helper para mocks de teste e simuladores admin */
export function mockPricedCartLine(
  overrides: Partial<PricedCartLine> &
    Pick<PricedCartLine, 'productId' | 'variationId' | 'quantity' | 'unitPrice'>
): PricedCartLine {
  const quantity = overrides.quantity
  const unitPrice = overrides.unitPrice
  const addonsUnitTotal = overrides.addonsUnitTotal ?? 0
  const lineProductSubtotal = unitPrice * quantity
  const lineAdjustmentTotal = addonsUnitTotal * quantity
  const lineMerchandiseTotal =
    overrides.lineMerchandiseTotal ?? lineProductSubtotal + lineAdjustmentTotal

  return {
    name: 'Produto',
    slug: 'produto',
    sku: 'SKU',
    image: '',
    addonsUnitTotal,
    maxStock: quantity,
    lineProductSubtotal,
    lineAdjustmentTotal,
    lineDiscountEligibleBase: overrides.lineDiscountEligibleBase ?? lineProductSubtotal,
    lineDiscountTotal: overrides.lineDiscountTotal ?? 0,
    lineDisplayTotal: overrides.lineDisplayTotal ?? lineMerchandiseTotal,
    lineMerchandiseTotal,
    ...overrides,
    quantity,
    unitPrice,
  }
}
