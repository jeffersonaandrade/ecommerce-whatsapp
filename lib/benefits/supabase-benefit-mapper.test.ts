import { describe, expect, it } from 'vitest'
import { rowToBenefitItem, benefitInputToRow } from './supabase-benefit-mapper'

describe('supabase-benefit-mapper', () => {
  it('mapeia row para BenefitItem', () => {
    const item = rowToBenefitItem({
      id: 'benefit-default-1',
      title: 'Envio rápido',
      description: 'Entrega rápida',
      sort_order: 10,
      active: true,
      created_at: '2026-01-01T00:00:00Z',
      updated_at: '2026-01-02T00:00:00Z',
    })
    expect(item.sortOrder).toBe(10)
    expect(item.title).toBe('Envio rápido')
  })

  it('mapeia input parcial para row', () => {
    expect(benefitInputToRow({ title: '  Título  ', active: false })).toEqual({
      title: 'Título',
      active: false,
    })
  })
})
