import { beforeEach, describe, expect, it, vi } from 'vitest'

const {
  mockRequireAdmin,
  mockGetCategoryRepository,
  mockFetchProductCountForCategory,
} = vi.hoisted(() => ({
  mockRequireAdmin: vi.fn(),
  mockGetCategoryRepository: vi.fn(),
  mockFetchProductCountForCategory: vi.fn(),
}))

vi.mock('@/lib/auth/require-admin', () => ({
  requireAdmin: mockRequireAdmin,
}))

vi.mock('./get-category-repository', () => ({
  getCategoryRepository: mockGetCategoryRepository,
}))

vi.mock('@/lib/catalog/product-aggregates', () => ({
  fetchProductCountForCategory: mockFetchProductCountForCategory,
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
    getSlugIndex: vi.fn(),
    getById: vi.fn(),
    create: vi.fn(),
    update: vi.fn(),
    delete: vi.fn(),
  }

  beforeEach(() => {
    mockRequireAdmin.mockReset()
    mockGetCategoryRepository.mockReset()
    mockFetchProductCountForCategory.mockReset()
    repo.getAll.mockReset()
    repo.getSlugIndex.mockReset()
    repo.getById.mockReset()
    repo.create.mockReset()
    repo.update.mockReset()
    repo.delete.mockReset()
    mockGetCategoryRepository.mockReturnValue(repo)
    mockRequireAdmin.mockResolvedValue({ ok: true })
    mockFetchProductCountForCategory.mockResolvedValue({ total: 0, active: 0 })
    repo.getAll.mockResolvedValue([sampleCategory])
    repo.getSlugIndex.mockResolvedValue([{ id: sampleCategory.id, slug: sampleCategory.slug }])
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
    repo.getSlugIndex.mockResolvedValue([
      { id: sampleCategory.id, slug: sampleCategory.slug },
      { id: 'cat-2', slug: 'shorts' },
    ])
    const result = await updateCategoryAction('cat-2', {
      name: 'Shorts',
      slug: 'camisas',
    })
    expect(result.ok).toBe(false)
  })

  it('updateCategoryAction bloqueia mudança de slug com produtos vinculados', async () => {
    repo.getById.mockResolvedValue(sampleCategory)
    mockFetchProductCountForCategory.mockResolvedValue({ total: 1, active: 1 })
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
    mockFetchProductCountForCategory.mockResolvedValue({ total: 1, active: 1 })
    const result = await deleteCategoryAction('cat-1')
    expect(result).toEqual({
      ok: false,
      error: expect.stringContaining('Não é possível excluir'),
    })
  })

  it('deleteCategoryAction permite quando sem produtos', async () => {
    repo.getById.mockResolvedValue(sampleCategory)
    mockFetchProductCountForCategory.mockResolvedValue({ total: 0, active: 0 })
    const result = await deleteCategoryAction('cat-1')
    expect(result).toEqual({ ok: true })
    expect(repo.delete).toHaveBeenCalledWith('cat-1')
  })
})
