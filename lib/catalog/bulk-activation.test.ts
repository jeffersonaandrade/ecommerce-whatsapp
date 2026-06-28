import { beforeEach, describe, expect, it, vi } from 'vitest'
import type { Product } from '@/types/product'

const { mockRequireAdmin } = vi.hoisted(() => ({
  mockRequireAdmin: vi.fn(),
}))

vi.mock('@/lib/auth/require-admin', () => ({
  requireAdmin: mockRequireAdmin,
}))

const mockGetByIdsAdmin = vi.fn()
const mockBulkSetStatus = vi.fn()
const mockBulkSetPersonalization = vi.fn()

vi.mock('@/lib/catalog/get-product-repository', () => ({
  getProductRepository: vi.fn(() => ({
    getByIdsAdmin: mockGetByIdsAdmin,
    bulkSetStatus: mockBulkSetStatus,
    bulkSetPersonalization: mockBulkSetPersonalization,
  })),
}))

vi.mock('next/cache', () => ({
  revalidatePath: vi.fn(),
  updateTag: vi.fn(),
}))

import { bulkValidateForActivationAction, bulkActivateWithOptionsAction } from './actions'

const makeProduct = (overrides: Partial<Product> = {}): Product => ({
  id: '1',
  name: 'Camisa',
  slug: 'camisa',
  shortDescription: '',
  longDescription: '',
  price: 99,
  category: 'Camisas',
  images: ['img.jpg'],
  variations: [{ id: 'v1', sku: 'SKU-1', stock: 5 }],
  status: 'draft',
  ...overrides,
})

describe('bulkValidateForActivationAction', () => {
  beforeEach(() => {
    mockRequireAdmin.mockReset()
    mockGetByIdsAdmin.mockReset()
    mockBulkSetStatus.mockReset()
    mockBulkSetPersonalization.mockReset()
  })

  it('retorna erro se lista vazia', async () => {
    mockRequireAdmin.mockResolvedValue(undefined)
    const result = await bulkValidateForActivationAction([])
    expect(result).toEqual({ ok: false, error: 'Nenhum produto selecionado.' })
  })

  it('todos válidos', async () => {
    mockRequireAdmin.mockResolvedValue(undefined)
    const products = [
      makeProduct({ id: '1' }),
      makeProduct({ id: '2', name: 'Camisa 2', slug: 'camisa-2' }),
    ]
    mockGetByIdsAdmin.mockResolvedValue(products)

    const result = await bulkValidateForActivationAction(['1', '2'])
    expect(result.ok).toBe(true)
    if (!result.ok) return
    expect(result.summary.total).toBe(2)
    expect(result.summary.validIds).toEqual(['1', '2'])
    expect(result.summary.invalid).toHaveLength(0)
  })

  it('mistura de válidos e inválidos', async () => {
    mockRequireAdmin.mockResolvedValue(undefined)
    const products = [
      makeProduct({ id: '1' }),
      makeProduct({ id: '2', name: 'Sem Imagem', slug: 'sem-imagem', images: [] }),
      makeProduct({ id: '3', name: 'Sem Preço', slug: 'sem-preco', price: 0 }),
    ]
    mockGetByIdsAdmin.mockResolvedValue(products)

    const result = await bulkValidateForActivationAction(['1', '2', '3'])
    expect(result.ok).toBe(true)
    if (!result.ok) return
    expect(result.summary.total).toBe(3)
    expect(result.summary.validIds).toEqual(['1'])
    expect(result.summary.invalid).toHaveLength(2)
    expect(result.summary.invalid[0].errors).toContain('sem_imagem')
    expect(result.summary.invalid[1].errors).toContain('sem_preco')
  })

  it('todos inválidos — validIds vazio', async () => {
    mockRequireAdmin.mockResolvedValue(undefined)
    mockGetByIdsAdmin.mockResolvedValue([
      makeProduct({ id: '1', images: [] }),
    ])

    const result = await bulkValidateForActivationAction(['1'])
    expect(result.ok).toBe(true)
    if (!result.ok) return
    expect(result.summary.validIds).toHaveLength(0)
    expect(result.summary.invalid).toHaveLength(1)
  })

  it('propaga erro do repositório', async () => {
    mockRequireAdmin.mockResolvedValue(undefined)
    mockGetByIdsAdmin.mockRejectedValue(new Error('DB offline'))

    const result = await bulkValidateForActivationAction(['1'])
    expect(result).toEqual({ ok: false, error: 'DB offline' })
  })
})

describe('bulkActivateWithOptionsAction', () => {
  beforeEach(() => {
    mockRequireAdmin.mockReset()
    mockBulkSetStatus.mockReset()
    mockBulkSetPersonalization.mockReset()
    mockBulkSetStatus.mockResolvedValue(undefined)
    mockBulkSetPersonalization.mockResolvedValue(undefined)
  })

  it('retorna erro se lista vazia', async () => {
    mockRequireAdmin.mockResolvedValue(undefined)
    const result = await bulkActivateWithOptionsAction([], { enablePersonalization: false })
    expect(result).toEqual({ ok: false, error: 'Nenhum produto selecionado.' })
  })

  it('chama bulkSetStatus e NÃO chama bulkSetPersonalization quando opt-in desmarcado', async () => {
    mockRequireAdmin.mockResolvedValue(undefined)
    const result = await bulkActivateWithOptionsAction(['1', '2'], { enablePersonalization: false })
    expect(result).toEqual({ ok: true, count: 2 })
    expect(mockBulkSetStatus).toHaveBeenCalledWith(['1', '2'], 'active')
    expect(mockBulkSetPersonalization).not.toHaveBeenCalled()
  })

  it('chama bulkSetStatus E bulkSetPersonalization quando opt-in marcado', async () => {
    mockRequireAdmin.mockResolvedValue(undefined)
    const result = await bulkActivateWithOptionsAction(['1', '2'], { enablePersonalization: true })
    expect(result).toEqual({ ok: true, count: 2 })
    expect(mockBulkSetStatus).toHaveBeenCalledWith(['1', '2'], 'active')
    expect(mockBulkSetPersonalization).toHaveBeenCalledWith(['1', '2'], true)
  })

  it('propaga erro do bulkSetStatus', async () => {
    mockRequireAdmin.mockResolvedValue(undefined)
    mockBulkSetStatus.mockRejectedValue(new Error('Status update failed'))
    const result = await bulkActivateWithOptionsAction(['1'], { enablePersonalization: false })
    expect(result).toEqual({ ok: false, error: 'Status update failed' })
  })
})
