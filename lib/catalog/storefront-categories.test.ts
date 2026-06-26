import { describe, expect, it } from 'vitest'
import { siteConfig } from '@/config/site'
import {
  categoryProductsHref,
  isCategoryFilterActive,
  isStorefrontTestResidue,
  resolveCategoryHeading,
  resolveStorefrontCategories,
  resolveStorefrontCategoryList,
} from './storefront-categories'
import { Category } from '@/types/category'

const sampleCategories: Category[] = [
  {
    id: '1',
    name: 'Camisas',
    slug: 'camisas',
    description: '',
    sortOrder: 20,
    visible: true,
    createdAt: '',
    updatedAt: '',
  },
  {
    id: '2',
    name: 'Shorts',
    slug: 'shorts',
    description: '',
    sortOrder: 50,
    visible: true,
    createdAt: '',
    updatedAt: '',
  },
  {
    id: '3',
    name: 'QA',
    slug: 'qa',
    description: '',
    sortOrder: 99,
    visible: true,
    createdAt: '',
    updatedAt: '',
  },
]

describe('resolveStorefrontCategories (legacy strings)', () => {
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

describe('resolveStorefrontCategoryList', () => {
  it('filtra QA e ordena por sortOrder', () => {
    expect(resolveStorefrontCategoryList(sampleCategories).map((c) => c.slug)).toEqual([
      'camisas',
      'shorts',
    ])
  })

  it('usa fallback siteConfig quando lista vazia', () => {
    expect(resolveStorefrontCategoryList([]).length).toBe(siteConfig.categories.length)
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
  it('monta query com slug', () => {
    expect(categoryProductsHref('acessorios')).toBe('/products?category=acessorios')
  })
})

describe('isCategoryFilterActive', () => {
  it('aceita slug e nome legado na URL', () => {
    expect(isCategoryFilterActive('camisas', sampleCategories[0]!)).toBe(true)
    expect(isCategoryFilterActive('Camisas', sampleCategories[0]!)).toBe(true)
    expect(isCategoryFilterActive('shorts', sampleCategories[0]!)).toBe(false)
  })
})

describe('resolveCategoryHeading', () => {
  it('mostra name legível para slug ou nome na URL', () => {
    expect(resolveCategoryHeading('camisas', sampleCategories)).toBe('Camisas')
    expect(resolveCategoryHeading('Camisas', sampleCategories)).toBe('Camisas')
    expect(resolveCategoryHeading(undefined, sampleCategories)).toBe('Todos os produtos')
  })
})
