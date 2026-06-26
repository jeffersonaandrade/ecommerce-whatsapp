import { beforeEach, describe, expect, it, vi } from 'vitest'
import { Category } from '@/types/category'

const categoriesState = vi.hoisted(() => ({
  categories: [] as Category[],
  catalogCategories: [] as string[],
}))

vi.mock('./category-storage', () => ({
  loadCategoriesFromDisk: () => categoriesState.categories,
  persistCategories: (next: Category[]) => {
    categoriesState.categories = next
  },
  resetCategoriesMemoryCache: () => {},
}))

vi.mock('./catalog-storage', () => ({
  loadCatalogFromDisk: () =>
    categoriesState.catalogCategories.map((category, index) => ({
      id: String(index + 1),
      category,
    })),
}))

import { jsonCategoryRepository } from './json-category-repository'

describe('jsonCategoryRepository', () => {
  beforeEach(() => {
    categoriesState.categories = []
    categoriesState.catalogCategories = []
  })

  it('deriva categorias de products quando categories.json vazio', async () => {
    categoriesState.catalogCategories = ['Camisas', 'Shorts', 'Camisas']
    const categories = await jsonCategoryRepository.getAll()
    expect(categories.map((c) => c.slug)).toEqual(['camisas', 'shorts'])
    expect(categoriesState.categories).toHaveLength(2)
  })

  it('usa categories.json quando existir', async () => {
    categoriesState.categories = [
      {
        id: 'cat-meias',
        name: 'Meias',
        slug: 'meias',
        description: '',
        sortOrder: 40,
        visible: true,
        createdAt: '2026-01-01T00:00:00.000Z',
        updatedAt: '2026-01-01T00:00:00.000Z',
      },
    ]
    const categories = await jsonCategoryRepository.getAll()
    expect(categories).toHaveLength(1)
    expect(categories[0]?.name).toBe('Meias')
  })

  it('getStorefront filtra visible e oculta QA', async () => {
    categoriesState.categories = [
      {
        id: '1',
        name: 'Camisas',
        slug: 'camisas',
        description: '',
        sortOrder: 10,
        visible: true,
        createdAt: '',
        updatedAt: '',
      },
      {
        id: '2',
        name: 'QA',
        slug: 'qa',
        description: '',
        sortOrder: 20,
        visible: true,
        createdAt: '',
        updatedAt: '',
      },
    ]
    const storefront = await jsonCategoryRepository.getStorefront()
    expect(storefront.map((c) => c.slug)).toEqual(['camisas'])
  })

  it('create persiste nova categoria', async () => {
    categoriesState.categories = []
    categoriesState.catalogCategories = ['Camisas']
    await jsonCategoryRepository.getAll()
    const created = await jsonCategoryRepository.create({
      name: 'Jaquetas',
      slug: 'jaquetas',
      sortOrder: 30,
    })
    expect(created.slug).toBe('jaquetas')
    expect(categoriesState.categories.some((c) => c.slug === 'jaquetas')).toBe(true)
  })
})
