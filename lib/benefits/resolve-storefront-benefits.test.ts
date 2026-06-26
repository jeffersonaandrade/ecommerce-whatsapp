import { describe, expect, it } from 'vitest'
import { resolveStorefrontBenefits } from './resolve-storefront-benefits'
import { BenefitItem } from '@/types/benefit-item'

const activeItem: BenefitItem = {
  id: 'b1',
  title: 'Frete grátis',
  description: 'Acima de R$ 199',
  sortOrder: 10,
  active: true,
  createdAt: '2026-01-01T00:00:00Z',
  updatedAt: '2026-01-01T00:00:00Z',
}

describe('resolveStorefrontBenefits', () => {
  it('usa itens ativos do banco quando existem', () => {
    const section = resolveStorefrontBenefits([activeItem], {
      benefitsEyebrow: 'Nossa loja',
      benefitsTitle: 'Vantagens',
    })
    expect(section.eyebrow).toBe('Nossa loja')
    expect(section.title).toBe('Vantagens')
    expect(section.items).toHaveLength(1)
    expect(section.items[0].title).toBe('Frete grátis')
  })

  it('fallback para defaults quando nenhum item ativo', () => {
    const section = resolveStorefrontBenefits([], {})
    expect(section.items).toHaveLength(3)
    expect(section.items[0].id).toBe('benefit-default-1')
    expect(section.eyebrow).toBe('Por que comprar conosco')
    expect(section.title).toBe('Benefícios')
  })
})
