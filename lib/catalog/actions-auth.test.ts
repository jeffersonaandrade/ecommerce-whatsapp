import { beforeEach, describe, expect, it, vi } from 'vitest'

const { mockRequireAdmin } = vi.hoisted(() => ({
  mockRequireAdmin: vi.fn(),
}))

vi.mock('@/lib/auth/require-admin', () => ({
  requireAdmin: mockRequireAdmin,
}))

vi.mock('@/lib/catalog/get-product-repository', () => ({
  getProductRepository: vi.fn(() => ({
    getAll: vi.fn().mockResolvedValue([]),
    create: vi.fn(),
  })),
}))

vi.mock('next/cache', () => ({
  revalidatePath: vi.fn(),
}))

import { createProductAction } from './actions'

describe('createProductAction auth', () => {
  beforeEach(() => {
    mockRequireAdmin.mockReset()
  })

  it('retorna erro quando requireAdmin falha', async () => {
    mockRequireAdmin.mockResolvedValue({ ok: false, error: 'Não autenticado' })

    const result = await createProductAction({
      name: 'Teste',
      longDescription: 'Desc',
      price: 10,
      category: 'Camisas',
      images: ['https://example.com/a.jpg'],
      variations: [{ sku: 'SKU-1', stock: 1 }],
      status: 'draft',
    })

    expect(result).toEqual({ ok: false, errors: ['Não autenticado'] })
  })
})
