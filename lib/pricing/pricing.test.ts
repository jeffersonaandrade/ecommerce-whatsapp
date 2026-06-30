import { describe, expect, it } from 'vitest'
import { applyPromotion, evaluateQuantityDiscount } from '@/lib/pricing/apply-promotion'
import { computeTotals } from '@/lib/pricing/compute-totals'
import { resolveAddonsUnitTotal } from '@/lib/pricing/resolve-addons-price'
import { CommercialRule } from '@/types/commercial-rule'
import { CartItem, Product } from '@/types/product'
import { PersonalizationSettings } from '@/types/personalization-settings'
import type { PricedCartLine } from '@/types/cart-pricing'
import { mockPricedCartLine } from '@/lib/pricing/mock-priced-cart-line'

const baseProduct: Product = {
  id: '1',
  name: 'Camisa',
  slug: 'camisa',
  shortDescription: '',
  longDescription: '',
  price: 100,
  category: 'Camisas',
  images: [],
  variations: [{ id: 'v1', sku: 'SKU', stock: 10, size: 'M' }],
  status: 'active',
  personalizationEnabled: true,
  personalizationPrice: 35,
}

const settings: PersonalizationSettings = {
  enabled: true,
  defaultPrice: 25,
  nameMaxLength: 15,
  numberMin: 0,
  numberMax: 99,
  notesRequired: false,
  notesMaxLength: 200,
  updatedAt: '',
}

function makeRule(priority: number, requiredQuantity: number, discountAmount: number): CommercialRule {
  return {
    id: `rule-${priority}`,
    kind: 'promotion',
    name: `Promo ${priority}`,
    trigger: 'auto',
    type: 'quantity_discount',
    status: 'active',
    priority,
    stackable: false,
    appliesTo: 'all_products',
    config: { requiredQuantity, discountAmount },
    conditions: {},
    actions: [],
    usageCount: 0,
    createdAt: '',
    updatedAt: '',
  }
}

describe('evaluateQuantityDiscount', () => {
  const lines: PricedCartLine[] = [
    mockPricedCartLine({
      productId: '1',
      variationId: 'v1',
      quantity: 5,
      unitPrice: 100,
      name: 'Camisa',
      slug: 'camisa',
    }),
  ]

  it('aplica 1 grupo para 5 produtos com regra de 3', () => {
    const result = evaluateQuantityDiscount(makeRule(10, 3, 159.9), lines)
    expect(result.discountGroups).toBe(1)
    expect(result.discountAmount).toBe(159.9)
  })

  it('aplica 2 grupos para 6 produtos com regra de 3', () => {
    const six = [
      mockPricedCartLine({
        ...lines[0],
        quantity: 6,
        unitPrice: 100,
      }),
    ]
    const result = evaluateQuantityDiscount(makeRule(10, 3, 159.9), six)
    expect(result.discountGroups).toBe(2)
    expect(result.discountAmount).toBeCloseTo(319.8)
  })
})

describe('applyPromotion', () => {
  const lines: PricedCartLine[] = [
    mockPricedCartLine({
      productId: '1',
      variationId: 'v1',
      quantity: 6,
      unitPrice: 100,
      name: 'Camisa',
      slug: 'camisa',
    }),
  ]

  it('usa prioridade — primeira elegível vence', () => {
    const lowPriority = makeRule(10, 3, 50)
    const highPriority = makeRule(100, 5, 30)
    const result = applyPromotion([highPriority, lowPriority], lines, 600)
    expect(result.appliedRule?.ruleId).toBe('rule-100')
    expect(result.commercialDiscount).toBe(30)
  })

  it('limita desconto ao subtotal', () => {
    const rule = makeRule(10, 2, 9999)
    const result = applyPromotion([rule], lines, 100)
    expect(result.commercialDiscount).toBe(100)
  })
})

describe('resolveAddonsUnitTotal', () => {
  it('usa preço do produto quando definido', () => {
    const total = resolveAddonsUnitTotal(
      { personalization: { name: 'A', number: '10' } },
      baseProduct,
      settings
    )
    expect(total).toBe(35)
  })

  it('usa preço global quando produto não define', () => {
    const total = resolveAddonsUnitTotal(
      { personalization: { name: 'A', number: '10' } },
      { ...baseProduct, personalizationPrice: null },
      settings
    )
    expect(total).toBe(25)
  })

  it('trata preço 0 do produto como override gratuito', () => {
    const total = resolveAddonsUnitTotal(
      { personalization: { name: 'A', number: '10' } },
      { ...baseProduct, personalizationPrice: 0 },
      settings
    )
    expect(total).toBe(0)
  })
})

describe('computeTotals', () => {
  it('calcula carrinho com personalização e desconto', () => {
    const items: CartItem[] = [
      {
        productId: '1',
        variationId: 'v1',
        quantity: 1,
        addons: { personalization: { name: 'JEFF', number: '10' } },
      },
      { productId: '1', variationId: 'v1', quantity: 2 },
    ]

    const pricing = computeTotals(items, {
      getProductById: () => baseProduct,
      personalizationSettings: settings,
      commercialRules: [makeRule(10, 3, 50)],
    })

    expect(pricing.addonsSubtotal).toBe(35)
    expect(pricing.commercialDiscount).toBe(50)
    expect(pricing.cartTotal).toBe(pricing.merchandiseSubtotal - 50)
  })
})
