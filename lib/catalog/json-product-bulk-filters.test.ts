import { beforeEach, describe, expect, it, vi } from 'vitest'
import { Product } from '@/types/product'

const catalogState = vi.hoisted(() => ({
  products: [] as Product[],
}))

vi.mock('./catalog-storage', () => ({
  loadCatalogFromDisk: () => catalogState.products,
  persistCatalog: (next: Product[]) => {
    catalogState.products = next
  },
}))

vi.mock('./category-storage', () => ({
  loadCategoriesFromDisk: () => [],
  persistCategories: () => {},
  resetCategoriesMemoryCache: () => {},
}))

vi.mock('./get-category-repository', () => ({
  getCategoryRepository: () => ({
    getAll: async () => [
      {
        id: 'cat-camisas',
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
        id: 'cat-shorts',
        name: 'Shorts',
        slug: 'shorts',
        description: '',
        sortOrder: 20,
        visible: true,
        parentId: null,
        depth: 0,
        path: 'shorts',
        createdAt: '',
        updatedAt: '',
      },
    ],
  }),
}))

vi.mock('@/lib/categories', () => ({
  getStorefrontCategories: async () => [
    {
      id: 'cat-camisas',
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
  ],
}))

import { jsonProductRepository } from './json-product-repository'

function makeProduct(overrides: Partial<Product> & Pick<Product, 'id' | 'name' | 'category'>): Product {
  return {
    slug: overrides.slug ?? overrides.id,
    shortDescription: '',
    longDescription: '',
    price: 100,
    club: '',
    images: [],
    variations: [{ id: 'v1', sku: `sku-${overrides.id}`, stock: 1 }],
    status: 'draft',
    ...overrides,
  }
}

describe('jsonProductRepository bulk filters', () => {
  beforeEach(() => {
    catalogState.products = [
      makeProduct({ id: '1', name: 'Camisa A', category: 'camisas', status: 'draft', importBatchId: 'batch-a' }),
      makeProduct({ id: '2', name: 'Camisa B', category: 'camisas', status: 'draft', importBatchId: 'batch-a' }),
      makeProduct({ id: '3', name: 'Short', category: 'shorts', status: 'active', importBatchId: 'batch-b' }),
    ]
  })

  it('listIdsByFilters respeita status e batch', async () => {
    const ids = await jsonProductRepository.listIdsByFilters({
      status: ['draft'],
      batchId: 'batch-a',
    })
    expect(ids.sort()).toEqual(['1', '2'])
  })

  it('bulkSetCategoryIdByFilters move produtos do filtro', async () => {
    const count = await jsonProductRepository.bulkSetCategoryIdByFilters(
      { batchId: 'batch-a' },
      'cat-camisas'
    )
    expect(count).toBe(2)
    expect(catalogState.products.every((p) => p.importBatchId !== 'batch-a' || p.categoryId === 'cat-camisas')).toBe(true)
  })
})
