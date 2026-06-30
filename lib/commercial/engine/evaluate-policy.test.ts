import { describe, expect, it } from 'vitest'
import { evaluateCommercialPolicies } from '@/lib/commercial/engine/evaluate-policy'
import type { PricedLine } from '@/lib/commercial/engine/types'
import type {
  CommercialPolicy,
  CommercialProductPolicyOverride,
} from '@/types/commercial-policy'

function makeLine(
  productId: string,
  unitPrice: number,
  quantity: number
): PricedLine {
  const lineProductSubtotal = unitPrice * quantity
  return {
    productId,
    variationId: 'v1',
    quantity,
    name: 'Produto',
    slug: 'produto',
    sku: 'SKU',
    image: '',
    unitPrice,
    addonsUnitTotal: 0,
    lineMerchandiseTotal: lineProductSubtotal,
    lineProductSubtotal,
    lineAdjustmentTotal: 0,
    lineDiscountEligibleBase: lineProductSubtotal,
    lineDiscountTotal: 0,
    lineDisplayTotal: lineProductSubtotal,
    maxStock: 10,
  }
}

function makePolicy(
  overrides: Partial<CommercialPolicy> & Pick<CommercialPolicy, 'id' | 'name'>
): CommercialPolicy {
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

describe('evaluateCommercialPolicies', () => {
  it('aplica 10% no preço base com 10+ peças e preços diferentes', () => {
    const lines = [
      makeLine('p1', 100, 6),
      makeLine('p2', 200, 5),
    ]
    const policy = makePolicy({ id: 'pol-1', name: 'Atacado 10+' })

    const result = evaluateCommercialPolicies(lines, {
      salesChannel: 'wholesale',
      channelEnabled: true,
      policies: [policy],
      overrides: [],
    })

    expect(result.policyDiscount).toBe(160)
    expect(result.policyIds).toEqual(['pol-1'])
    expect(result.merchandiseDiscountBase).toBe(1600)
  })

  it('não aplica quando quantidade mínima não é atingida', () => {
    const lines = [makeLine('p1', 100, 5)]
    const policy = makePolicy({ id: 'pol-1', name: 'Atacado 10+' })

    const result = evaluateCommercialPolicies(lines, {
      salesChannel: 'wholesale',
      channelEnabled: true,
      policies: [policy],
      overrides: [],
    })

    expect(result.policyDiscount).toBe(0)
  })

  it('exclui produto com override exclude_from_policy', () => {
    const lines = [
      makeLine('p1', 100, 10),
      makeLine('p2', 100, 10),
    ]
    const policy = makePolicy({ id: 'pol-1', name: 'Atacado' })
    const overrides: CommercialProductPolicyOverride[] = [
      {
        id: 'ov-1',
        productId: 'p2',
        policyId: 'pol-1',
        conditions: {},
        actions: [{ type: 'exclude_from_policy' }],
        createdAt: '',
        updatedAt: '',
      },
    ]

    const result = evaluateCommercialPolicies(lines, {
      salesChannel: 'wholesale',
      channelEnabled: true,
      policies: [policy],
      overrides,
    })

    expect(result.policyDiscount).toBe(100)
  })

  it('usa prioridade — primeira elegível vence', () => {
    const lines = [makeLine('p1', 100, 12)]
    const low = makePolicy({
      id: 'low',
      name: 'Baixa',
      priority: 5,
      actions: [{ type: 'discount_percent', value: 5 }],
    })
    const high = makePolicy({
      id: 'high',
      name: 'Alta',
      priority: 20,
      actions: [{ type: 'discount_percent', value: 15 }],
    })

    const result = evaluateCommercialPolicies(lines, {
      salesChannel: 'wholesale',
      channelEnabled: true,
      policies: [low, high],
      overrides: [],
    })

    expect(result.policyIds).toEqual(['high'])
    expect(result.policyDiscount).toBe(180)
  })

  it('não aplica quando canal da loja está desabilitado', () => {
    const lines = [makeLine('p1', 100, 12)]

    const result = evaluateCommercialPolicies(lines, {
      salesChannel: 'wholesale',
      channelEnabled: false,
      policies: [makePolicy({ id: 'pol-1', name: 'Atacado' })],
      overrides: [],
    })

    expect(result.policyDiscount).toBe(0)
  })

  it('não aplica política de atacado no canal varejo', () => {
    const lines = [makeLine('p1', 100, 12)]
    const policy = makePolicy({ id: 'pol-1', name: 'Atacado', channel: 'wholesale' })

    const result = evaluateCommercialPolicies(lines, {
      salesChannel: 'retail',
      channelEnabled: true,
      policies: [policy],
      overrides: [],
    })

    expect(result.policyDiscount).toBe(0)
  })

  it('per_product: aplica só em linhas que atingem minQty', () => {
    const lines = [
      makeLine('p1', 100, 12),
      makeLine('p2', 200, 3),
    ]
    const policy = makePolicy({
      id: 'pol-pp',
      name: 'Por produto 5+',
      conditions: { minQty: 5, eligibilityStrategy: 'per_product' },
      actions: [{ type: 'discount_percent', value: 10 }],
    })

    const result = evaluateCommercialPolicies(lines, {
      salesChannel: 'wholesale',
      channelEnabled: true,
      policies: [policy],
      overrides: [],
    })

    expect(result.merchandiseDiscountBase).toBe(1200)
    expect(result.policyDiscount).toBe(120)
    expect(result.lines[0]?.lineDiscountTotal).toBe(120)
    expect(result.lines[1]?.lineDiscountTotal).toBe(0)
  })

  it('discount_fixed não excede base elegível', () => {
    const lines = [makeLine('p1', 100, 5)]
    const policy = makePolicy({
      id: 'pol-fixed',
      name: 'Fixo alto',
      conditions: { minQty: 5 },
      actions: [{ type: 'discount_fixed', value: 9999 }],
    })

    const result = evaluateCommercialPolicies(lines, {
      salesChannel: 'wholesale',
      channelEnabled: true,
      policies: [policy],
      overrides: [],
    })

    expect(result.merchandiseDiscountBase).toBe(500)
    expect(result.policyDiscount).toBe(500)
  })
})
