import { beforeEach, describe, expect, it, vi, beforeAll } from 'vitest'

const { mockRequireAdmin, mockRepo } = vi.hoisted(() => ({
  mockRequireAdmin: vi.fn(),
  mockRepo: {
    getAll: vi.fn(),
    getById: vi.fn(),
    setProductImages: vi.fn(),
    bulkSetProductImages: vi.fn(),
  },
}))

beforeAll(() => {
  process.env.NEXT_PUBLIC_SUPABASE_URL = 'https://example.supabase.co'
})

vi.mock('@/lib/auth/require-admin', () => ({
  requireAdmin: mockRequireAdmin,
}))

vi.mock('@/lib/catalog/get-product-repository', () => ({
  getProductRepository: () => mockRepo,
}))

vi.mock('next/cache', () => ({
  revalidatePath: vi.fn(),
  unstable_cache: (fn: () => unknown) => fn,
}))

vi.mock('@/lib/catalog/media/fetch-upload-catalog', () => ({
  fetchMediaUploadCatalog: vi.fn(async () => []),
}))

import { bulkSetProductImagesAction, setProductImagesAction } from './actions'

describe('media actions', () => {
  beforeEach(() => {
    mockRequireAdmin.mockReset()
    mockRepo.getById.mockReset()
    mockRepo.setProductImages.mockReset()
  })

  it('bloqueia sem admin', async () => {
    mockRequireAdmin.mockResolvedValue({ ok: false, error: 'Não autenticado' })
    const result = await setProductImagesAction({
      productId: '1',
      paths: ['1/a.jpg'],
    })
    expect(result).toEqual({ ok: false, error: 'Não autenticado' })
  })

  it('salva imagens com replace', async () => {
    mockRequireAdmin.mockResolvedValue({ ok: true })
    mockRepo.getById.mockResolvedValue({
      id: '1',
      slug: 'produto',
      images: ['https://cdn.example.com/old.jpg'],
    })
    mockRepo.setProductImages.mockResolvedValue({
      id: '1',
      slug: 'produto',
      images: ['https://example.supabase.co/storage/v1/object/public/products/1/a.jpg'],
    })

    const result = await setProductImagesAction({
      productId: '1',
      paths: ['1/a.jpg'],
      mode: 'replace',
    })

    expect(result.ok).toBe(true)
    expect(mockRepo.setProductImages).toHaveBeenCalled()
  })

  it('bulk processa lote', async () => {
    mockRequireAdmin.mockResolvedValue({ ok: true })
    mockRepo.getById.mockResolvedValue({ id: '1', slug: 'p', images: [] })
    mockRepo.setProductImages.mockResolvedValue({ id: '1', slug: 'p', images: ['x'] })

    const result = await bulkSetProductImagesAction([
      { productId: '1', paths: ['1/a.jpg'], mode: 'replace' },
    ])

    expect(result.ok).toBe(true)
    if (result.ok) expect(result.updated).toBe(1)
  })
})
