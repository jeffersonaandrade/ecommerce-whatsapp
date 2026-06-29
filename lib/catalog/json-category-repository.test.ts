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
        depth: 0,
        path: 'meias',
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
        depth: 0,
        path: 'camisas',
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
        depth: 0,
        path: 'qa',
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

  it('recalcula paths dos descendentes ao mover categoria pai', async () => {
    categoriesState.categories = [
      {
        id: 'e',
        name: 'Esportes',
        slug: 'esportes',
        description: '',
        sortOrder: 10,
        visible: true,
        parentId: null,
        depth: 0,
        path: 'esportes',
        createdAt: '',
        updatedAt: '',
      },
      {
        id: 'c',
        name: 'Camisas',
        slug: 'camisas',
        description: '',
        sortOrder: 20,
        visible: true,
        parentId: null,
        depth: 0,
        path: 'camisas',
        createdAt: '',
        updatedAt: '',
      },
      {
        id: 'm',
        name: 'Manga Longa',
        slug: 'manga-longa',
        description: '',
        sortOrder: 30,
        visible: true,
        parentId: 'c',
        depth: 1,
        path: 'camisas/manga-longa',
        createdAt: '',
        updatedAt: '',
      },
    ]

    await jsonCategoryRepository.update('c', {
      name: 'Camisas',
      slug: 'camisas',
      parentId: 'e',
      visible: true,
      sortOrder: 20,
    })

    const all = await jsonCategoryRepository.getAll()
    expect(all.find((c) => c.id === 'c')?.path).toBe('esportes/camisas')
    expect(all.find((c) => c.id === 'm')?.path).toBe('esportes/camisas/manga-longa')
  })
})
