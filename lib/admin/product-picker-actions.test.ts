import { beforeEach, describe, expect, it, vi } from 'vitest'
import {
  getProductsForPickerByIdsAction,
  searchProductsForPickerAction,
} from './product-picker-actions'

const mockRequireAdmin = vi.fn()
const mockQuery = vi.fn()
const mockGetByIdsAdmin = vi.fn()

vi.mock('@/lib/auth/require-admin', () => ({
  requireAdmin: () => mockRequireAdmin(),
}))

vi.mock('@/lib/catalog/get-product-repository', () => ({
  getProductRepository: () => ({
    query: mockQuery,
    getByIdsAdmin: mockGetByIdsAdmin,
  }),
}))

describe('product-picker-actions', () => {
  beforeEach(() => {
    mockRequireAdmin.mockReset()
    mockQuery.mockReset()
    mockGetByIdsAdmin.mockReset()
    mockRequireAdmin.mockResolvedValue({ ok: true })
  })

  it('retorna vazio para busca curta', async () => {
    const result = await searchProductsForPickerAction('a')
    expect(result).toEqual({ ok: true, items: [] })
    expect(mockQuery).not.toHaveBeenCalled()
  })

  it('busca produtos por nome ou sku', async () => {
    mockQuery.mockResolvedValue({
      products: [
        {
          id: 'p1',
          name: 'Bola',
          status: 'active',
          variations: [{ id: 'v1', sku: 'BOLA-01', stock: 1 }],
        },
      ],
    })

    const result = await searchProductsForPickerAction('bola')
    expect(result.ok).toBe(true)
    if (result.ok) {
      expect(result.items).toEqual([
        { id: 'p1', name: 'Bola', sku: 'BOLA-01', status: 'active' },
      ])
    }
  })

  it('resolve produtos existentes por id para edição', async () => {
    mockGetByIdsAdmin.mockResolvedValue([
      {
        id: 'p1',
        name: 'Bola',
        status: 'active',
        variations: [{ id: 'v1', sku: 'BOLA-01', stock: 1 }],
      },
    ])

    const result = await getProductsForPickerByIdsAction(['p1', 'missing'])
    expect(result.ok).toBe(true)
    if (result.ok) {
      expect(result.items[0]).toEqual({
        id: 'p1',
        name: 'Bola',
        sku: 'BOLA-01',
        status: 'active',
      })
      expect(result.items[1]).toEqual({
        id: 'missing',
        name: 'Produto não encontrado',
        sku: null,
        status: 'unavailable',
      })
    }
  })
})
