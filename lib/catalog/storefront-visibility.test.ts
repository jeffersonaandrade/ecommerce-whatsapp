import { describe, expect, it } from 'vitest'
import { getStorefrontVisibility } from './storefront-visibility'

describe('getStorefrontVisibility', () => {
  it('explica rascunho', () => {
    const result = getStorefrontVisibility({
      status: 'draft',
      name: 'Camisa',
      slug: 'camisa',
      category: 'camisas',
    })
    expect(result.visible).toBe(false)
    expect(result.detail).toMatch(/Ativo/)
  })

  it('marca ativo visível', () => {
    const result = getStorefrontVisibility({
      status: 'active',
      name: 'Camisa Pro',
      slug: 'camisa-pro',
      category: 'camisas',
    })
    expect(result.visible).toBe(true)
  })

  it('oculta resíduo QA mesmo ativo', () => {
    const result = getStorefrontVisibility({
      status: 'active',
      name: 'QA Test',
      slug: 'qa-test',
      category: 'camisas',
    })
    expect(result.visible).toBe(false)
  })
})
