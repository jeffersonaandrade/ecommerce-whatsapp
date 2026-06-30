import { describe, expect, it } from 'vitest'
import { resolveCommercialPricing } from '@/lib/commercial/engine/resolve-commercial-pricing'
import { COMMERCIAL_ENGINE_VERSION } from '@/lib/commercial/engine/types'
import type { CommercialPolicy } from '@/types/commercial-policy'
import type { CommercialRule } from '@/types/commercial-rule'
import type { CartItem, Product } from '@/types/product'
import type { PersonalizationSettings } from '@/types/personalization-settings'

const baseProduct: Product = {
  id: 'p1',
  name: 'Camisa',
  slug: 'camisa',
  shortDescription: '',
  longDescription: '',
  price: 100,
  category: 'Camisas',
  categoryId: 'cat-shirts',
  images: [],
  variations: [{ id: 'v1', sku: 'SKU', stock: 20, size: 'M' }],
  status: 'active',
  personalizationEnabled: true,
  personalizationPrice: 35,
}

const otherProduct: Product = {
  ...baseProduct,
  id: 'p2',
  name: 'Short',
  slug: 'short',
  category: 'Shorts',
  categoryId: 'cat-shorts',
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

function getProduct(id: string): Product | undefined {
  if (id === 'p1') return baseProduct
  if (id === 'p2') return otherProduct
  return undefined
}

function makeAutoRule(
  priority: number,
  requiredQuantity: number,
  discountAmount: number
): CommercialRule {
  return {
    id: `auto-${priority}`,
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

function makeCoupon(
  overrides: Partial<CommercialRule> & { code: string }
): CommercialRule {
  return {
    id: 'coupon-1',
    kind: 'promotion',
    name: 'Cupom Teste',
    trigger: 'manual',
    type: 'quantity_discount',
    status: 'active',
    priority: 0,
    stackable: false,
    appliesTo: 'all_products',
    config: { requiredQuantity: 0, discountAmount: 0 },
    conditions: {},
    actions: [{ type: 'discount_percent', value: 10 }],
    usageCount: 0,
    createdAt: '',
    updatedAt: '',
    ...overrides,
  }
}

const items: CartItem[] = [{ productId: 'p1', variationId: 'v1', quantity: 2 }]

describe('Fase 3 — cupons manuais', () => {
  it('cupom global percentual aplicado', () => {
    const coupon = makeCoupon({
      code: 'GLOBAL10',
      actions: [{ type: 'discount_percent', value: 10 }],
    })

    const result = resolveCommercialPricing({
      items,
      getProductById: getProduct,
      personalizationSettings: settings,
      commercialRules: [coupon],
      couponCode: 'global10',
    })

    expect(result.engineVersion).toBe(COMMERCIAL_ENGINE_VERSION)
    expect(result.applied.couponCode).toBe('GLOBAL10')
    expect(result.subtotals.ruleDiscount).toBe(20)
    expect(result.trace.some((e) => e.source === 'coupon' && e.status === 'applied')).toBe(true)
  })

  it('cupom global fixo aplicado', () => {
    const coupon = makeCoupon({
      code: 'FIXO15',
      actions: [{ type: 'discount_fixed', value: 15 }],
    })

    const result = resolveCommercialPricing({
      items,
      getProductById: getProduct,
      personalizationSettings: settings,
      commercialRules: [coupon],
      couponCode: 'FIXO15',
    })

    expect(result.subtotals.ruleDiscount).toBe(15)
    expect(result.applied.couponCode).toBe('FIXO15')
  })

  it('cupom fixo maior que subtotal elegível é capeado', () => {
    const coupon = makeCoupon({
      code: 'FIXO999',
      actions: [{ type: 'discount_fixed', value: 999 }],
    })

    const result = resolveCommercialPricing({
      items,
      getProductById: getProduct,
      personalizationSettings: settings,
      commercialRules: [coupon],
      couponCode: 'FIXO999',
    })

    expect(result.subtotals.ruleDiscount).toBe(200)
    expect(result.total).toBe(0)
  })

  it('cupom por categoria', () => {
    const coupon = makeCoupon({
      code: 'SHIRTS',
      conditions: { categoryIds: ['cat-shirts'] },
      actions: [{ type: 'discount_percent', value: 10 }],
    })

    const multiItems: CartItem[] = [
      { productId: 'p1', variationId: 'v1', quantity: 2 },
      { productId: 'p2', variationId: 'v1', quantity: 2 },
    ]

    const result = resolveCommercialPricing({
      items: multiItems,
      getProductById: getProduct,
      personalizationSettings: settings,
      commercialRules: [coupon],
      couponCode: 'SHIRTS',
    })

    expect(result.subtotals.ruleDiscount).toBe(20)
  })

  it('cupom por produto', () => {
    const coupon = makeCoupon({
      code: 'P1ONLY',
      conditions: { productIds: ['p1'] },
      actions: [{ type: 'discount_percent', value: 10 }],
    })

    const multiItems: CartItem[] = [
      { productId: 'p1', variationId: 'v1', quantity: 2 },
      { productId: 'p2', variationId: 'v1', quantity: 2 },
    ]

    const result = resolveCommercialPricing({
      items: multiItems,
      getProductById: getProduct,
      personalizationSettings: settings,
      commercialRules: [coupon],
      couponCode: 'P1ONLY',
    })

    expect(result.subtotals.ruleDiscount).toBe(20)
  })

  it('cupom sem item elegível', () => {
    const coupon = makeCoupon({
      code: 'WRONGCAT',
      conditions: { categoryIds: ['cat-other'] },
    })

    const result = resolveCommercialPricing({
      items,
      getProductById: getProduct,
      personalizationSettings: settings,
      commercialRules: [coupon],
      couponCode: 'WRONGCAT',
    })

    expect(result.subtotals.ruleDiscount).toBe(0)
    expect(result.applied.couponCode).toBeUndefined()
    expect(result.errors.some((e) => e.code === 'COUPON_NO_ELIGIBLE_ITEMS')).toBe(true)
  })

  it('cupom com pedido mínimo não atingido', () => {
    const coupon = makeCoupon({
      code: 'MIN300',
      conditions: { minSubtotal: 300 },
    })

    const result = resolveCommercialPricing({
      items,
      getProductById: getProduct,
      personalizationSettings: settings,
      commercialRules: [coupon],
      couponCode: 'MIN300',
    })

    expect(result.errors.some((e) => e.code === 'COUPON_MIN_SUBTOTAL')).toBe(true)
  })

  it('cupom expirado', () => {
    const coupon = makeCoupon({
      code: 'OLD',
      endsAt: '2020-01-01T00:00:00.000Z',
    })

    const result = resolveCommercialPricing({
      items,
      getProductById: getProduct,
      personalizationSettings: settings,
      commercialRules: [coupon],
      couponCode: 'OLD',
    })

    expect(result.errors.some((e) => e.code === 'COUPON_EXPIRED')).toBe(true)
  })

  it('cupom inativo', () => {
    const coupon = makeCoupon({ code: 'DRAFT', status: 'draft' })

    const result = resolveCommercialPricing({
      items,
      getProductById: getProduct,
      personalizationSettings: settings,
      commercialRules: [coupon],
      couponCode: 'DRAFT',
    })

    expect(result.errors.some((e) => e.code === 'COUPON_INACTIVE')).toBe(true)
  })

  it('cupom inexistente', () => {
    const result = resolveCommercialPricing({
      items,
      getProductById: getProduct,
      personalizationSettings: settings,
      commercialRules: [],
      couponCode: 'NAOEXISTE',
    })

    expect(result.errors.some((e) => e.code === 'COUPON_NOT_FOUND')).toBe(true)
    expect(result.total).toBe(200)
  })

  it('cupom bloqueado por allowManualRules = false', () => {
    const policy: CommercialPolicy = {
      id: 'pol-dist',
      name: 'Distribuidor',
      channel: 'distributor',
      priority: 10,
      enabled: true,
      isDefault: false,
      conditions: {},
      actions: [],
      accumulation: { allowManualRules: false },
      createdAt: '',
      updatedAt: '',
    }

    const coupon = makeCoupon({ code: 'BLOCKED' })

    const result = resolveCommercialPricing({
      items,
      getProductById: getProduct,
      personalizationSettings: settings,
      commercialRules: [coupon],
      commercialPolicies: [policy],
      salesChannel: 'distributor',
      salesChannels: { retail: true, wholesale: false, distributor: true },
      couponCode: 'BLOCKED',
    })

    expect(result.subtotals.ruleDiscount).toBe(0)
    expect(result.trace.some((e) => e.source === 'coupon' && e.status === 'skipped')).toBe(
      true
    )
  })

  it('cupom não incide sobre personalização', () => {
    const coupon = makeCoupon({
      code: 'NOPERS',
      actions: [{ type: 'discount_percent', value: 10 }],
    })

    const personalizedItems: CartItem[] = [
      {
        productId: 'p1',
        variationId: 'v1',
        quantity: 2,
        addons: { personalization: { name: 'A', number: '10' } },
      },
    ]

    const result = resolveCommercialPricing({
      items: personalizedItems,
      getProductById: getProduct,
      personalizationSettings: settings,
      commercialRules: [coupon],
      couponCode: 'NOPERS',
    })

    expect(result.subtotals.adjustments).toBe(70)
    expect(result.subtotals.ruleDiscount).toBe(20)
    expect(result.total).toBe(200 + 70 - 20)
  })

  it('acumula após promo auto', () => {
    const coupon = makeCoupon({
      code: 'POSPROMO',
      actions: [{ type: 'discount_fixed', value: 10 }],
    })

    const result = resolveCommercialPricing({
      items: [{ productId: 'p1', variationId: 'v1', quantity: 6 }],
      getProductById: getProduct,
      personalizationSettings: settings,
      commercialRules: [makeAutoRule(10, 3, 50), coupon],
      couponCode: 'POSPROMO',
    })

    expect(result.subtotals.ruleDiscount).toBe(110)
  })

  it('apenas um cupom por carrinho — primeiro code match vence', () => {
    const c1 = makeCoupon({ id: 'c1', code: 'DUP', actions: [{ type: 'discount_fixed', value: 5 }] })
    const c2 = makeCoupon({
      id: 'c2',
      code: 'DUP',
      name: 'Duplicado',
      actions: [{ type: 'discount_fixed', value: 50 }],
    })

    const result = resolveCommercialPricing({
      items,
      getProductById: getProduct,
      personalizationSettings: settings,
      commercialRules: [c1, c2],
      couponCode: 'DUP',
    })

    expect(result.subtotals.ruleDiscount).toBe(5)
    expect(result.applied.ruleIds).toEqual(['c1'])
  })

  it('cupom com limite de uso atingido', () => {
    const coupon = makeCoupon({
      code: 'LIMIT',
      usageLimit: 5,
      usageCount: 5,
    })

    const result = resolveCommercialPricing({
      items,
      getProductById: getProduct,
      personalizationSettings: settings,
      commercialRules: [coupon],
      couponCode: 'LIMIT',
    })

    expect(result.errors.some((e) => e.code === 'COUPON_USAGE_LIMIT')).toBe(true)
  })

  it('trace de cupom rejeitado', () => {
    const result = resolveCommercialPricing({
      items,
      getProductById: getProduct,
      personalizationSettings: settings,
      commercialRules: [],
      couponCode: 'INVALIDO',
    })

    const errTrace = result.trace.find((e) => e.stage === 'error')
    expect(errTrace?.status).toBe('skipped')
    expect(errTrace?.source).toBe('coupon')
  })
})
