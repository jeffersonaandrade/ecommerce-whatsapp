'use server'

import { revalidatePath } from 'next/cache'
import { requireAdmin } from '@/lib/auth/require-admin'
import { getCategoryRepository } from './get-category-repository'
import { CategoryInput } from '@/types/category'
import {
  validateCategoryInput,
  countProductsForCategory,
  normalizeCategorySlug,
  generateCategorySlug,
} from './category-utils'
import { getAllProductsAdmin } from '@/lib/products'
import { writeCategoryImage, deleteCategoryImage } from './category-image-storage'

export type CategoryFormPayload = {
  name: string
  slug?: string
  description?: string
  sortOrder?: number
  visible?: boolean
}

function toCategoryInput(payload: CategoryFormPayload): CategoryInput {
  return {
    name: payload.name,
    slug: payload.slug,
    description: payload.description,
    sortOrder: payload.sortOrder,
    visible: payload.visible,
  }
}

function revalidateCategories() {
  revalidatePath('/')
  revalidatePath('/products')
  revalidatePath('/admin/categories')
  revalidatePath('/admin/products')
  revalidatePath('/admin/products/new')
}

export async function createCategoryAction(
  payload: CategoryFormPayload
): Promise<{ ok: true; id: string } | { ok: false; errors: string[] }> {
  const auth = await requireAdmin()
  if (!auth.ok) return { ok: false, errors: [auth.error] }

  try {
    const repo = getCategoryRepository()
    const input = toCategoryInput(payload)
    const existing = await repo.getAll()
    const errors = validateCategoryInput(input, existing)
    if (errors.length > 0) {
      return { ok: false, errors: errors.map((e) => e.message) }
    }

    const category = await repo.create(input)
    revalidateCategories()
    return { ok: true, id: category.id }
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Falha ao criar categoria'
    return { ok: false, errors: [message] }
  }
}

export async function updateCategoryAction(
  id: string,
  payload: CategoryFormPayload
): Promise<{ ok: true } | { ok: false; errors: string[] }> {
  const auth = await requireAdmin()
  if (!auth.ok) return { ok: false, errors: [auth.error] }

  try {
    const repo = getCategoryRepository()
    const category = await repo.getById(id)
    if (!category) {
      return { ok: false, errors: ['Categoria não encontrada'] }
    }

    const input = toCategoryInput(payload)
    const existing = await repo.getAll()
    const errors = validateCategoryInput(input, existing, id)
    if (errors.length > 0) {
      return { ok: false, errors: errors.map((e) => e.message) }
    }

    const newSlug = normalizeCategorySlug(
      input.slug?.trim() || generateCategorySlug(input.name)
    )
    const currentSlug = normalizeCategorySlug(category.slug)
    if (newSlug !== currentSlug) {
      const products = await getAllProductsAdmin()
      const { count } = countProductsForCategory(category, products)
      if (count > 0) {
        return {
          ok: false,
          errors: [
            `Não é possível alterar o slug: ${count} produto(s) vinculado(s). Reatribua os produtos ou crie uma nova categoria.`,
          ],
        }
      }
    }

    await repo.update(id, input)
    revalidateCategories()
    return { ok: true }
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Falha ao atualizar categoria'
    return { ok: false, errors: [message] }
  }
}

export async function deleteCategoryAction(
  id: string
): Promise<{ ok: true } | { ok: false; error: string }> {
  const auth = await requireAdmin()
  if (!auth.ok) return { ok: false, error: auth.error }

  try {
    const repo = getCategoryRepository()
    const category = await repo.getById(id)
    if (!category) return { ok: false, error: 'Categoria não encontrada' }

    const products = await getAllProductsAdmin()
    const { count } = countProductsForCategory(category, products)
    if (count > 0) {
      return {
        ok: false,
        error: `Não é possível excluir: ${count} produto(s) vinculado(s). Oculte a categoria ou reatribua os produtos.`,
      }
    }

    await repo.delete(id)
    revalidateCategories()
    return { ok: true }
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Falha ao excluir categoria'
    return { ok: false, error: message }
  }
}

export async function uploadCategoryImageAction(
  categoryId: string,
  formData: FormData
): Promise<{ ok: true } | { ok: false; error: string }> {
  const auth = await requireAdmin()
  if (!auth.ok) return { ok: false, error: auth.error }

  const file = formData.get('image')
  if (!(file instanceof File) || file.size === 0)
    return { ok: false, error: 'Selecione uma imagem válida.' }

  if (file.size > 2 * 1024 * 1024)
    return { ok: false, error: 'Imagem deve ter no máximo 2 MB.' }

  const allowed = ['image/png', 'image/jpeg', 'image/webp']
  const ext = file.name.split('.').pop()?.toLowerCase()
  const extOk = ext === 'png' || ext === 'jpg' || ext === 'jpeg' || ext === 'webp'
  if (!allowed.includes(file.type) && !extOk)
    return { ok: false, error: 'Formato aceito: PNG, JPG ou WebP.' }

  try {
    const repo = getCategoryRepository()
    const category = await repo.getById(categoryId)
    if (!category) return { ok: false, error: 'Categoria não encontrada.' }

    const buffer = Buffer.from(await file.arrayBuffer())
    const imagePath = await writeCategoryImage(categoryId, buffer)
    await repo.update(categoryId, {
      name: category.name,
      slug: category.slug,
      description: category.description,
      sortOrder: category.sortOrder,
      visible: category.visible,
      imagePath,
    })
    revalidateCategories()
    return { ok: true }
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err)
    return { ok: false, error: `Falha ao salvar imagem: ${msg}` }
  }
}

export async function removeCategoryImageAction(
  categoryId: string
): Promise<{ ok: true } | { ok: false; error: string }> {
  const auth = await requireAdmin()
  if (!auth.ok) return { ok: false, error: auth.error }

  try {
    const repo = getCategoryRepository()
    const category = await repo.getById(categoryId)
    if (!category) return { ok: false, error: 'Categoria não encontrada.' }

    await deleteCategoryImage(categoryId)
    await repo.update(categoryId, {
      name: category.name,
      slug: category.slug,
      description: category.description,
      sortOrder: category.sortOrder,
      visible: category.visible,
      imagePath: null,
    })
    revalidateCategories()
    return { ok: true }
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err)
    return { ok: false, error: `Falha ao remover imagem: ${msg}` }
  }
}

export async function toggleCategoryVisibleAction(
  id: string,
  visible: boolean
): Promise<{ ok: true } | { ok: false; error: string }> {
  const auth = await requireAdmin()
  if (!auth.ok) return { ok: false, error: auth.error }

  try {
    const repo = getCategoryRepository()
    const category = await repo.getById(id)
    if (!category) return { ok: false, error: 'Categoria não encontrada' }

    await repo.update(id, {
      name: category.name,
      slug: category.slug,
      description: category.description,
      sortOrder: category.sortOrder,
      visible,
    })
    revalidateCategories()
    return { ok: true }
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Falha ao atualizar visibilidade'
    return { ok: false, error: message }
  }
}
