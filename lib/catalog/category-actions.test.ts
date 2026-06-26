import { beforeEach, describe, expect, it, vi } from 'vitest'

const {
  mockRequireAdmin,
  mockGetCategoryRepository,
  mockGetAllProductsAdmin,
} = vi.hoisted(() => ({
  mockRequireAdmin: vi.fn(),
  mockGetCategoryRepository: vi.fn(),
  mockGetAllProductsAdmin: vi.fn(),
}))

vi.mock('@/lib/auth/require-admin', () => ({
  requireAdmin: mockRequireAdmin,
}))

vi.mock('./get-category-repository', () => ({
  getCategoryRepository: mockGetCategoryRepository,
}))

vi.mock('@/lib/products', () => ({
  getAllProductsAdmin: mockGetAllProductsAdmin,
}))

vi.mock('next/cache', () => ({
  revalidatePath: vi.fn(),
}))

import {
  createCategoryAction,
  deleteCategoryAction,
  updateCategoryAction,
} from './category-actions'

const sampleCategory = {
  id: 'cat-1',
  name: 'Camisas',
  slug: 'camisas',
  description: '',
  sortOrder: 20,
  visible: true,
  createdAt: '',
  updatedAt: '',
}

describe('category-actions', () => {
  const repo = {
    getAll: vi.fn(),
    getById: vi.fn(),
    create: vi.fn(),
    update: vi.fn(),
    delete: vi.fn(),
  }

  beforeEach(() => {
    mockRequireAdmin.mockReset()
    mockGetCategoryRepository.mockReset()
    mockGetAllProductsAdmin.mockReset()
    repo.getAll.mockReset()
    repo.getById.mockReset()
    repo.create.mockReset()
    repo.update.mockReset()
    repo.delete.mockReset()
    mockGetCategoryRepository.mockReturnValue(repo)
    mockRequireAdmin.mockResolvedValue({ ok: true })
    mockGetAllProductsAdmin.mockResolvedValue([])
    repo.getAll.mockResolvedValue([sampleCategory])
  })

  it('createCategoryAction exige admin', async () => {
    mockRequireAdmin.mockResolvedValue({ ok: false, error: 'Não autenticado' })
    const result = await createCategoryAction({ name: 'Teste' })
    expect(result).toEqual({ ok: false, errors: ['Não autenticado'] })
  })

  it('createCategoryAction bloqueia slug inválido', async () => {
    const result = await createCategoryAction({ name: 'Teste', slug: 'inválido' })
    expect(result.ok).toBe(false)
    if (!result.ok) {
      expect(result.errors.some((e) => e.includes('Slug'))).toBe(true)
    }
  })

  it('createCategoryAction bloqueia nome vazio', async () => {
    const result = await createCategoryAction({ name: '   ' })
    expect(result.ok).toBe(false)
  })

  it('updateCategoryAction bloqueia slug duplicado', async () => {
    repo.getAll.mockResolvedValue([
      sampleCategory,
      { ...sampleCategory, id: 'cat-2', slug: 'shorts', name: 'Shorts' },
    ])
    const result = await updateCategoryAction('cat-2', {
      name: 'Shorts',
      slug: 'camisas',
    })
    expect(result.ok).toBe(false)
  })

  it('updateCategoryAction bloqueia mudança de slug com produtos vinculados', async () => {
    repo.getById.mockResolvedValue(sampleCategory)
    mockGetAllProductsAdmin.mockResolvedValue([
      { category: 'Camisas', status: 'active' },
    ])
    const result = await updateCategoryAction('cat-1', {
      name: 'Camisas',
      slug: 'camisetas',
    })
    expect(result.ok).toBe(false)
    if (!result.ok) {
      expect(result.errors.some((e) => e.includes('alterar o slug'))).toBe(true)
    }
    expect(repo.update).not.toHaveBeenCalled()
  })

  it('deleteCategoryAction bloqueia quando há produtos', async () => {
    repo.getById.mockResolvedValue(sampleCategory)
    mockGetAllProductsAdmin.mockResolvedValue([
      { category: 'Camisas', status: 'active' },
    ])
    const result = await deleteCategoryAction('cat-1')
    expect(result).toEqual({
      ok: false,
      error: expect.stringContaining('Não é possível excluir'),
    })
  })

  it('deleteCategoryAction permite quando sem produtos', async () => {
    repo.getById.mockResolvedValue(sampleCategory)
    mockGetAllProductsAdmin.mockResolvedValue([])
    const result = await deleteCategoryAction('cat-1')
    expect(result).toEqual({ ok: true })
    expect(repo.delete).toHaveBeenCalledWith('cat-1')
  })
})
