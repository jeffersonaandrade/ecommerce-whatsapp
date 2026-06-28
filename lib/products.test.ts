import { beforeEach, describe, expect, it, vi } from 'vitest'
import { Product } from '@/types/product'

const mockRepository = vi.hoisted(() => ({
  getActive: vi.fn(),
  getAll: vi.fn(),
  getBySlug: vi.fn(),
  getById: vi.fn(),
  query: vi.fn(),
}))

vi.mock('@/lib/catalog/get-product-repository', () => ({
  getProductRepository: () => mockRepository,
}))

vi.mock('@/lib/categories', () => ({
  getStorefrontCategories: vi.fn(async () => []),
}))

function product(id: string, status: Product['status'], category = 'camisas'): Product {
  return {
    id,
    slug: `produto-${id}`,
    name: `Produto ${id}`,
    shortDescription: '',
    longDescription: '',
    price: 100,
    category,
    images: ['https://example.com/image.jpg'],
    variations: [{ id: `v-${id}`, sku: `SKU-${id}`, stock: 1 }],
    status,
  }
}

describe('products facade', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('getAllProducts usa apenas o catálogo ativo da vitrine', async () => {
    mockRepository.getActive.mockResolvedValue([
      product('1', 'active'),
      product('qa', 'active', 'QA'),
    ])

    const { getAllProducts } = await import('./products')
    const products = await getAllProducts()

    expect(mockRepository.getActive).toHaveBeenCalled()
    expect(mockRepository.getAll).not.toHaveBeenCalled()
    expect(products.map((p) => p.id)).toEqual(['1'])
  })

  it('getAllProductsAdmin usa o catálogo completo, incluindo rascunhos e indisponíveis', async () => {
    mockRepository.getAll.mockResolvedValue([
      product('1', 'active'),
      product('2', 'draft'),
      product('3', 'unavailable'),
    ])

    const { getAllProductsAdmin } = await import('./products')
    const products = await getAllProductsAdmin()

    expect(mockRepository.getAll).toHaveBeenCalled()
    expect(mockRepository.getActive).not.toHaveBeenCalled()
    expect(products.map((p) => p.status)).toEqual(['active', 'draft', 'unavailable'])
  })

  it('toProductCartLite inclui campos de personalização para o carrinho', async () => {
    const { toProductCartLite } = await import('./products')
    const lite = toProductCartLite({
      ...product('1', 'active'),
      personalizationEnabled: true,
      personalizationPrice: 29.9,
    })

    expect(lite.personalizationEnabled).toBe(true)
    expect(lite.personalizationPrice).toBe(29.9)
  })
})
