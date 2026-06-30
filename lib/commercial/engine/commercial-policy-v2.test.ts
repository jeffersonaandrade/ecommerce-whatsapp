import { describe, expect, it } from 'vitest'
import { resolveCommercialPricing } from '@/lib/commercial/engine/resolve-commercial-pricing'
import { COMMERCIAL_ENGINE_VERSION } from '@/lib/commercial/engine/types'
import { CommercialPolicy } from '@/types/commercial-policy'
import { CommercialRule } from '@/types/commercial-rule'
import { CartItem, Product } from '@/types/product'
import { PersonalizationSettings } from '@/types/personalization-settings'

const baseProduct: Product = {
  id: '1',
  name: 'Camisa',
  slug: 'camisa',
  shortDescription: '',
  longDescription: '',
  price: 100,
  category: 'Camisas',
  images: [],
  variations: [{ id: 'v1', sku: 'SKU', stock: 20, size: 'M' }],
  status: 'active',
  personalizationEnabled: true,
  personalizationPrice: 35,
}

const settings: PersonalizationSettings = {
  // minimal - will use product override price
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
    type: 'quantity_discount',
    status: 'active',
    priority,
    stackable: false,
    appliesTo: 'all_products',
    config: { requiredQuantity, discountAmount },
    createdAt: '',
    updatedAt: '',
  }
}

function makePolicy(overrides: Partial<CommercialPolicy> & Pick<CommercialPolicy, 'id' | 'name'>): CommercialPolicy {
  return {
    channel: 'wholesale',
    priority: 10,
    enabled: true,
    isDefault: false,
    conditions: { minQty: 10 },
    actions: [{ type: 'discount_percent', value: 10 }],
    createdAt: '',
    updatedAt: '',
    ...overrides,
  }
}

describe('Fase 2.5 — accumulation gates e bases', () => {
  it('retail sem policy: promo auto continua (regressão zero)', () => {
    const items: CartItem[] = [{ productId: '1', variationId: 'v1', quantity: 6 }]

    const result = resolveCommercialPricing({
      items,
      getProductById: () => baseProduct,
      personalizationSettings: settings,
      commercialRules: [makeRule(10, 3, 159.9)],
      salesChannel: 'retail',
      salesChannels: { retail: true, wholesale: false, distributor: false },
    })

    expect(result.engineVersion).toBe(COMMERCIAL_ENGINE_VERSION)
    expect(result.subtotals.ruleDiscount).toBeCloseTo(319.8)
    expect(result.total).toBeCloseTo(600 - 319.8)
    expect(result.trace.some((e) => e.stage === 'rule' && e.status === 'applied')).toBe(true)
    expect(result.trace.some((e) => e.status === 'skipped')).toBe(false)
  })

  it('wholesale canal: bloqueia promo auto com trace skipped', () => {
    const items: CartItem[] = [{ productId: '1', variationId: 'v1', quantity: 12 }]
    const policy = makePolicy({
      id: 'pol-wholesale',
      name: 'Atacado 10+',
      channel: 'wholesale',
      conditions: { minQty: 10 },
      actions: [{ type: 'discount_percent', value: 20 }],
    })

    const result = resolveCommercialPricing({
      items,
      getProductById: () => baseProduct,
      personalizationSettings: settings,
      commercialPolicies: [policy],
      commercialRules: [makeRule(10, 3, 50)],
      salesChannel: 'wholesale',
      salesChannels: { retail: true, wholesale: true, distributor: false },
    })

    expect(result.subtotals.policyDiscount).toBe(240)
    expect(result.subtotals.ruleDiscount).toBe(0)
    expect(result.total).toBe(960)

    const skipped = result.trace.find(
      (e) => e.stage === 'rule' && e.status === 'skipped'
    )
    expect(skipped).toBeDefined()
    expect(skipped?.label).toContain('Promoções')
  })

  it('policy accumulation pode reabrir promo auto no wholesale', () => {
    const items: CartItem[] = [{ productId: '1', variationId: 'v1', quantity: 12 }]
    const policy = makePolicy({
      id: 'pol-wholesale-open',
      name: 'Atacado promo ok',
      channel: 'wholesale',
      accumulation: { allowAutoRules: true },
      actions: [{ type: 'discount_percent', value: 10 }],
    })

    const result = resolveCommercialPricing({
      items,
      getProductById: () => baseProduct,
      personalizationSettings: settings,
      commercialPolicies: [policy],
      commercialRules: [makeRule(10, 3, 50)],
      salesChannel: 'wholesale',
      salesChannels: { retail: true, wholesale: true, distributor: false },
    })

    expect(result.subtotals.policyDiscount).toBe(120)
    expect(result.subtotals.ruleDiscount).toBe(200)
    expect(result.trace.some((e) => e.stage === 'rule' && e.status === 'applied')).toBe(true)
  })

  it('expõe merchandiseDiscountBase, displaySubtotal e runningTotal', () => {
    const items: CartItem[] = [{ productId: '1', variationId: 'v1', quantity: 12 }]
    const policy = makePolicy({
      id: 'pol-base',
      name: 'Base test',
      channel: 'retail',
      conditions: { minQty: 10 },
      actions: [{ type: 'discount_percent', value: 10 }],
    })

    const result = resolveCommercialPricing({
      items,
      getProductById: () => baseProduct,
      personalizationSettings: settings,
      commercialPolicies: [policy],
      commercialRules: [makeRule(10, 3, 50)],
      salesChannel: 'retail',
    })

    expect(result.subtotals.displaySubtotal).toBe(1200)
    expect(result.subtotals.merchandiseDiscountBase).toBe(1200)
    expect(result.subtotals.runningTotal).toBe(1200 - 120 - 200)
    expect(result.lines[0]?.lineProductSubtotal).toBe(1200)
    expect(result.lines[0]?.lineDiscountTotal).toBe(120)
    expect(result.lines[0]?.lineDisplayTotal).toBe(1080)
  })

  it('salesChannels estendido com stageGates no wholesale', () => {
    const items: CartItem[] = [{ productId: '1', variationId: 'v1', quantity: 6 }]

    const result = resolveCommercialPricing({
      items,
      getProductById: () => baseProduct,
      personalizationSettings: settings,
      commercialRules: [makeRule(10, 3, 50)],
      salesChannel: 'wholesale',
      salesChannels: {
        retail: true,
        wholesale: { enabled: true, stageGates: { allowAutoRules: false } },
        distributor: false,
      },
    })

    expect(result.subtotals.ruleDiscount).toBe(0)
    expect(result.trace.some((e) => e.status === 'skipped')).toBe(true)
  })

  it('personalização não entra na merchandiseDiscountBase da policy', () => {
    const items: CartItem[] = [
      {
        productId: '1',
        variationId: 'v1',
        quantity: 12,
        addons: { personalization: { name: 'JEFF', number: '10' } },
      },
    ]
    const policy = makePolicy({
      id: 'pol-personal',
      name: 'Retail 10+',
      channel: 'retail',
      conditions: { minQty: 10 },
      actions: [{ type: 'discount_percent', value: 10 }],
    })

    const result = resolveCommercialPricing({
      items,
      getProductById: () => baseProduct,
      personalizationSettings: settings,
      commercialPolicies: [policy],
      commercialRules: [],
      salesChannel: 'retail',
    })

    expect(result.subtotals.merchandiseBase).toBe(1200)
    expect(result.subtotals.adjustments).toBe(35 * 12)
    expect(result.subtotals.displaySubtotal).toBe(1200 + 35 * 12)
    expect(result.subtotals.merchandiseDiscountBase).toBe(1200)
    expect(result.subtotals.policyDiscount).toBe(120)
    expect(result.lines[0]?.lineDiscountEligibleBase).toBe(1200)
  })
})
