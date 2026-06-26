import { describe, expect, it } from 'vitest'
import { siteConfig } from '@/config/site'
import { categoryProductsHref, isStorefrontTestResidue, resolveStorefrontCategories } from './storefront-categories'

describe('resolveStorefrontCategories', () => {
  it('filtra categoria QA e ordena', () => {
    expect(resolveStorefrontCategories(['Meias', 'QA', 'Camisas'])).toEqual([
      'Camisas',
      'Meias',
    ])
  })

  it('usa fallback do siteConfig quando catálogo vazio', () => {
    expect(resolveStorefrontCategories([])).toEqual(siteConfig.categories)
  })
})

describe('isStorefrontTestResidue', () => {
  it('detecta resíduo E2E por club ou slug', () => {
    expect(
      isStorefrontTestResidue({
        category: 'Camisas',
        club: 'QA',
        slug: 'qa-e2e-import-1',
        name: 'QA-E2E Importado',
      })
    ).toBe(true)
    expect(
      isStorefrontTestResidue({
        category: 'Camisas',
        slug: 'camisa-premium',
        name: 'Camisa Premium',
      })
    ).toBe(false)
  })
})

describe('categoryProductsHref', () => {
  it('monta query de categoria', () => {
    expect(categoryProductsHref('Acessórios')).toBe(
      '/products?category=Acess%C3%B3rios'
    )
  })
})
