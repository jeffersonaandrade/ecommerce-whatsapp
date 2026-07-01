import { describe, expect, it } from 'vitest'
import {
  categoryProductsHref,
  hasStorefrontCategoryImages,
  isCategoryFilterActive,
  isStorefrontTestResidue,
  productsPageHref,
  resolveCategoryHeading,
  resolveStorefrontCategories,
  resolveStorefrontCategoryList,
  resolveStorefrontNavCategories,
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
    depth: 0,
    path: 'camisas',
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
    depth: 0,
    path: 'shorts',
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
    depth: 0,
    path: 'qa',
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

  it('retorna vazio quando catálogo vazio', () => {
    expect(resolveStorefrontCategories([])).toEqual([])
  })
})

describe('resolveStorefrontCategoryList', () => {
  it('filtra QA e ordena por sortOrder', () => {
    expect(resolveStorefrontCategoryList(sampleCategories).map((c) => c.slug)).toEqual([
      'camisas',
      'shorts',
    ])
  })

  it('retorna vazio quando lista vazia', () => {
    expect(resolveStorefrontCategoryList([])).toEqual([])
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

describe('hasStorefrontCategoryImages', () => {
  it('retorna true quando alguma categoria tem imagePath', () => {
    expect(
      hasStorefrontCategoryImages([
        { ...sampleCategories[0]!, imagePath: 'categories/1.webp' },
        sampleCategories[1]!,
      ])
    ).toBe(true)
    expect(hasStorefrontCategoryImages(sampleCategories)).toBe(false)
  })
})

describe('productsPageHref', () => {
  it('monta href sem category e sem page', () => {
    expect(productsPageHref()).toBe('/products')
    expect(
      productsPageHref({ preserve: { category: 'camisas', page: '2', q: 'bola' } })
    ).toBe('/products?q=bola')
  })

  it('inclui category e preserva params permitidos', () => {
    expect(
      productsPageHref({
        category: 'camisas',
        preserve: { q: 'bola', page: '3', sort: 'name' },
      })
    ).toBe('/products?q=bola&sort=name&category=camisas')
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

const treeCategories: Category[] = [
  {
    id: 'c1',
    name: 'Camisas',
    slug: 'camisas',
    description: '',
    sortOrder: 10,
    visible: true,
    parentId: null,
    depth: 0,
    path: 'camisas',
    createdAt: '',
    updatedAt: '',
  },
  {
    id: 'c2',
    name: 'Brasileiro',
    slug: 'brasileiro',
    description: '',
    sortOrder: 10,
    visible: true,
    parentId: 'c1',
    depth: 1,
    path: 'camisas/brasileiro',
    createdAt: '',
    updatedAt: '',
  },
  {
    id: 'c3',
    name: 'Retrô',
    slug: 'retro',
    description: '',
    sortOrder: 10,
    visible: true,
    parentId: 'c2',
    depth: 2,
    path: 'camisas/brasileiro/retro',
    createdAt: '',
    updatedAt: '',
  },
  {
    id: 'c4',
    name: 'Santa Cruz',
    slug: 'santa-cruz',
    description: '',
    sortOrder: 10,
    visible: true,
    parentId: 'c3',
    depth: 3,
    path: 'camisas/brasileiro/retro/santa-cruz',
    createdAt: '',
    updatedAt: '',
  },
  {
    id: 'c5',
    name: 'Sport',
    slug: 'sport',
    description: '',
    sortOrder: 20,
    visible: true,
    parentId: 'c3',
    depth: 3,
    path: 'camisas/brasileiro/retro/sport',
    createdAt: '',
    updatedAt: '',
  },
]

describe('resolveStorefrontNavCategories (4 níveis)', () => {
  it('mostra raízes sem categoria ativa', () => {
    expect(resolveStorefrontNavCategories(treeCategories).map((c) => c.slug)).toEqual(['camisas'])
  })

  it('drill-down por nível', () => {
    expect(resolveStorefrontNavCategories(treeCategories, 'camisas').map((c) => c.slug)).toEqual([
      'brasileiro',
    ])
    expect(resolveStorefrontNavCategories(treeCategories, 'brasileiro').map((c) => c.slug)).toEqual([
      'retro',
    ])
    expect(resolveStorefrontNavCategories(treeCategories, 'retro').map((c) => c.slug)).toEqual([
      'santa-cruz',
      'sport',
    ])
  })

  it('em folha mostra irmãos', () => {
    expect(resolveStorefrontNavCategories(treeCategories, 'santa-cruz').map((c) => c.slug)).toEqual([
      'santa-cruz',
      'sport',
    ])
  })
})
