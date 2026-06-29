import { beforeEach, describe, expect, it, vi } from 'vitest'

const mockRepo = vi.hoisted(() => ({
  bulkSetCategoryIdByFilters: vi.fn(async () => 42),
}))

vi.mock('@/lib/auth/require-admin', () => ({
  requireAdmin: vi.fn(async () => undefined),
}))

vi.mock('next/cache', () => ({
  revalidatePath: vi.fn(),
  updateTag: vi.fn(),
}))

vi.mock('./get-product-repository', () => ({
  getProductRepository: () => mockRepo,
}))

import { bulkSetProductCategoryIdByFiltersAction } from './actions'

describe('bulkSetProductCategoryIdByFiltersAction', () => {
  beforeEach(() => {
    mockRepo.bulkSetCategoryIdByFilters.mockClear()
    mockRepo.bulkSetCategoryIdByFilters.mockResolvedValue(42)
  })

  it('move produtos pelo filtro e retorna count', async () => {
    const result = await bulkSetProductCategoryIdByFiltersAction(
      { batchId: 'batch-123', status: ['draft'] },
      'cat-camisas'
    )
    expect(result).toEqual({ ok: true, count: 42 })
    expect(mockRepo.bulkSetCategoryIdByFilters).toHaveBeenCalledWith(
      { batchId: 'batch-123', status: ['draft'] },
      'cat-camisas'
    )
  })

  it('falha quando nenhum produto corresponde', async () => {
    mockRepo.bulkSetCategoryIdByFilters.mockResolvedValueOnce(0)
    const result = await bulkSetProductCategoryIdByFiltersAction({}, 'cat-camisas')
    expect(result).toEqual({ ok: false, error: 'Nenhum produto corresponde ao filtro atual.' })
  })
})
