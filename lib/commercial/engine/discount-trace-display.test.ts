import { describe, expect, it } from 'vitest'
import { getCartDiscountDisplay } from './discount-trace-display'
import type { CommercialTrace } from './types'

describe('getCartDiscountDisplay', () => {
  it('separa policy e promoção do trace', () => {
    const trace: CommercialTrace = [
      {
        stage: 'base',
        sequence: 1,
        label: 'Preço base',
        amount: 1199.4,
      },
      {
        stage: 'policy',
        sequence: 2,
        policyId: 'pol-1',
        label: 'QA Retail 5+ (10%)',
        amount: -119.94,
      },
      {
        stage: 'rule',
        sequence: 3,
        ruleId: 'rule-1',
        label: 'Pague 3 Leve 5',
        amount: -319.8,
      },
    ]

    const display = getCartDiscountDisplay(trace)

    expect(display.lines).toHaveLength(2)
    expect(display.lines[0]).toEqual({
      stage: 'policy',
      label: 'Política comercial: QA Retail 5+ (10%)',
      amount: 119.94,
    })
    expect(display.lines[1]).toEqual({
      stage: 'rule',
      label: 'Promoção: Pague 3 Leve 5',
      amount: 319.8,
    })
    expect(display.total).toBeCloseTo(439.74)
  })

  it('retorna vazio quando trace não tem descontos', () => {
    const display = getCartDiscountDisplay([
      { stage: 'base', sequence: 1, label: 'Preço base', amount: 100 },
    ])

    expect(display.lines).toEqual([])
    expect(display.total).toBe(0)
  })
})
