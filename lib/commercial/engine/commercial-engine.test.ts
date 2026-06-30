import { describe, expect, it } from 'vitest'
import { resolveCommercialPricing } from '@/lib/commercial/engine/resolve-commercial-pricing'
import { COMMERCIAL_ENGINE_VERSION } from '@/lib/commercial/engine/types'
import { computeTotals } from '@/lib/pricing/compute-totals'
import { CommercialRule } from '@/types/commercial-rule'
import { CommercialPolicy } from '@/types/commercial-policy'
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

const engineContext = {
  getProductById: () => baseProduct,
  personalizationSettings: settings,
  commercialRules: [] as CommercialRule[],
}

describe('resolveCommercialPricing', () => {
  it('retorna trace vazio e totais zerados para carrinho vazio', () => {
    const result = resolveCommercialPricing({
      items: [],
      ...engineContext,
    })

    expect(result.engineVersion).toBe(COMMERCIAL_ENGINE_VERSION)
    expect(result.trace).toEqual([])
    expect(result.total).toBe(0)
    expect(result.lines).toEqual([])
  })

  it('inclui engineVersion e trace com base + frete para carrinho simples', () => {
    const items: CartItem[] = [{ productId: '1', variationId: 'v1', quantity: 2 }]

    const result = resolveCommercialPricing({
      items,
      ...engineContext,
    })

    expect(result.engineVersion).toBe(1)
    expect(result.subtotals.merchandiseBase).toBe(200)
    expect(result.subtotals.adjustments).toBe(0)
    expect(result.total).toBe(200)

    const stages = result.trace.map((e) => e.stage)
    expect(stages).toContain('base')
    expect(stages).toContain('freight')
    expect(result.trace.find((e) => e.stage === 'base')?.amount).toBe(200)
    expect(result.trace.length).toBeGreaterThanOrEqual(2)
  })

  it('aplica promo qty com trace de rule e cap no subtotal', () => {
    const items: CartItem[] = [{ productId: '1', variationId: 'v1', quantity: 6 }]
    const rule = makeRule(10, 3, 159.9)

    const result = resolveCommercialPricing({
      items,
      ...engineContext,
      commercialRules: [rule],
    })

    expect(result.subtotals.ruleDiscount).toBeCloseTo(319.8)
    expect(result.total).toBeCloseTo(600 - 319.8)

    const ruleEntry = result.trace.find((e) => e.stage === 'rule')
    expect(ruleEntry).toBeDefined()
    expect(ruleEntry!.ruleId).toBe('rule-10')
    expect(ruleEntry!.amount).toBeCloseTo(-319.8)
    expect(ruleEntry!.metadata?.discountGroups).toBe(2)
    expect(result.applied.ruleIds).toContain('rule-10')
  })

  it('usa prioridade — primeira elegível vence', () => {
    const items: CartItem[] = [{ productId: '1', variationId: 'v1', quantity: 6 }]
    const lowPriority = makeRule(10, 3, 50)
    const highPriority = makeRule(100, 5, 30)

    const result = resolveCommercialPricing({
      items,
      ...engineContext,
      commercialRules: [highPriority, lowPriority],
    })

    expect(result.applied.appliedRule?.ruleId).toBe('rule-100')
    expect(result.subtotals.ruleDiscount).toBe(30)
  })

  it('limita desconto ao subtotal (total nunca negativo)', () => {
    const items: CartItem[] = [{ productId: '1', variationId: 'v1', quantity: 2 }]
    const rule = makeRule(10, 2, 9999)

    const result = resolveCommercialPricing({
      items,
      ...engineContext,
      commercialRules: [rule],
    })

    expect(result.subtotals.ruleDiscount).toBe(200)
    expect(result.total).toBe(0)
  })

  it('inclui trace de personalização quando há addons', () => {
    const items: CartItem[] = [
      {
        productId: '1',
        variationId: 'v1',
        quantity: 1,
        addons: { personalization: { name: 'JEFF', number: '10' } },
      },
      { productId: '1', variationId: 'v1', quantity: 2 },
    ]
    const rule = makeRule(10, 3, 50)

    const result = resolveCommercialPricing({
      items,
      ...engineContext,
      commercialRules: [rule],
    })

    expect(result.subtotals.adjustments).toBe(35)
    expect(result.subtotals.merchandiseBase).toBe(300)
    expect(result.subtotals.ruleDiscount).toBe(50)
    expect(result.total).toBe(300 + 35 - 50)

    const adjustmentEntry = result.trace.find((e) => e.stage === 'adjustment')
    expect(adjustmentEntry).toBeDefined()
    expect(adjustmentEntry!.amount).toBe(35)
    expect(adjustmentEntry!.label).toBe('Personalização')

    const ruleEntry = result.trace.find((e) => e.stage === 'rule')
    expect(ruleEntry).toBeDefined()
  })

  it('sequência do trace é monotônica crescente', () => {
    const items: CartItem[] = [
      {
        productId: '1',
        variationId: 'v1',
        quantity: 1,
        addons: { personalization: { name: 'A', number: '1' } },
      },
    ]

    const result = resolveCommercialPricing({
      items,
      ...engineContext,
      commercialRules: [makeRule(10, 1, 10)],
    })

    const sequences = result.trace.map((e) => e.sequence)
    for (let i = 1; i < sequences.length; i++) {
      expect(sequences[i]).toBeGreaterThan(sequences[i - 1]!)
    }
  })

  it('aplica política retail e promo qty com trace de policy + rule', () => {
    const productWithStock: Product = {
      ...baseProduct,
      variations: [{ id: 'v1', sku: 'SKU', stock: 20, size: 'M' }],
    }
    const items: CartItem[] = [{ productId: '1', variationId: 'v1', quantity: 12 }]
    const policy: CommercialPolicy = {
      id: 'pol-retail',
      name: 'Varejo 10+',
      channel: 'retail',
      priority: 10,
      enabled: true,
      isDefault: false,
      conditions: { minQty: 10 },
      actions: [{ type: 'discount_percent', value: 10 }],
      createdAt: '',
      updatedAt: '',
    }

    const result = resolveCommercialPricing({
      items,
      getProductById: () => productWithStock,
      personalizationSettings: settings,
      commercialPolicies: [policy],
      salesChannels: { retail: true, wholesale: false, distributor: false },
      salesChannel: 'retail',
      commercialRules: [makeRule(10, 3, 50)],
    })

    expect(result.subtotals.merchandiseBase).toBe(1200)
    expect(result.subtotals.policyDiscount).toBe(120)
    expect(result.subtotals.ruleDiscount).toBe(200)
    expect(result.total).toBe(1200 - 120 - 200)

    expect(result.trace.some((e) => e.stage === 'policy')).toBe(true)
    expect(result.trace.some((e) => e.stage === 'rule')).toBe(true)
    expect(result.applied.policyIds).toContain('pol-retail')
  })
})

describe('computeTotals facade', () => {
  it('produz mesmos números que resolveCommercialPricing', () => {
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

    const engine = resolveCommercialPricing({
      items,
      getProductById: () => baseProduct,
      personalizationSettings: settings,
      commercialRules: [makeRule(10, 3, 50)],
    })

    expect(pricing.merchandiseSubtotal).toBe(
      engine.subtotals.merchandiseBase + engine.subtotals.adjustments
    )
    expect(pricing.addonsSubtotal).toBe(engine.subtotals.adjustments)
    expect(pricing.commercialDiscount).toBe(engine.discounts.total)
    expect(pricing.cartTotal).toBe(engine.total)
    expect(pricing.appliedRule?.ruleId).toBe(engine.applied.appliedRule?.ruleId)
  })
})
