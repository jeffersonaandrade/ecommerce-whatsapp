'use server'

import { revalidatePath } from 'next/cache'
import { requireAdmin } from '@/lib/auth/require-admin'
import { getDataProvider } from '@/lib/data/provider'
import { getProductsPublicUrl } from '@/lib/supabase/env'
import { ProductStatus } from '@/types/product'
import {
  buildProductImageFilename,
  writeProductImage,
} from './product-image-storage'
import { getCategoryRepository } from './get-category-repository'
import { getProductRepository } from './get-product-repository'
import { ProductInput } from './product-repository'
import { validateProductInput, type ProductValidationError } from './product-utils'

export type ProductActionError = ProductValidationError

export type ProductFormPayload = {
  name: string
  slug?: string
  shortDescription?: string
  longDescription: string
  price: number
  promotionalPrice?: number | null
  category: string
  club?: string
  images: string[]
  variations: Array<{
    id?: string
    size?: string
    color?: string
    sku: string
    stock: number
  }>
  status: ProductStatus
}

function toProductInput(payload: ProductFormPayload): ProductInput {
  return {
    name: payload.name,
    slug: payload.slug,
    shortDescription: payload.shortDescription,
    longDescription: payload.longDescription,
    price: payload.price,
    promotionalPrice: payload.promotionalPrice ?? undefined,
    category: payload.category,
    club: payload.club,
    images: payload.images,
    variations: payload.variations,
    status: payload.status,
  }
}

function revalidateCatalog() {
  revalidatePath('/')
  revalidatePath('/products')
  revalidatePath('/admin')
  revalidatePath('/admin/products')
  revalidatePath('/admin/categories')
}

export async function createProductAction(
  payload: ProductFormPayload
): Promise<{ ok: true; id: string } | { ok: false; errors: ProductActionError[] }> {
  const auth = await requireAdmin()
  if (!auth.ok) {
    return { ok: false, errors: [{ field: 'form', message: auth.error }] }
  }

  try {
    const repo = getProductRepository()
    const input = toProductInput(payload)
    const catalog = await repo.getAll()
    const categories = await getCategoryRepository().getAll()
    const errors = validateProductInput(input, catalog, undefined, categories)
    if (errors.length > 0) {
      return { ok: false, errors }
    }

    const product = await repo.create(input)
    revalidateCatalog()
    return { ok: true, id: product.id }
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Falha ao criar produto'
    return { ok: false, errors: [{ field: 'form', message }] }
  }
}

export async function updateProductAction(
  id: string,
  payload: ProductFormPayload
): Promise<{ ok: true } | { ok: false; errors: ProductActionError[] }> {
  const auth = await requireAdmin()
  if (!auth.ok) {
    return { ok: false, errors: [{ field: 'form', message: auth.error }] }
  }

  const repo = getProductRepository()
  const input = toProductInput(payload)
  const catalog = await repo.getAll()
  const categories = await getCategoryRepository().getAll()
  const errors = validateProductInput(input, catalog, id, categories)
  if (errors.length > 0) {
    return { ok: false, errors }
  }

  await repo.update(id, input)
  revalidateCatalog()
  return { ok: true }
}

export async function deleteProductAction(
  id: string
): Promise<{ ok: true } | { ok: false; error: string }> {
  const auth = await requireAdmin()
  if (!auth.ok) {
    return { ok: false, error: auth.error }
  }

  try {
    await getProductRepository().delete(id)
    revalidateCatalog()
    return { ok: true }
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Falha ao remover produto'
    return { ok: false, error: message }
  }
}

const PRODUCT_IMAGE_MAX_BYTES = 5 * 1024 * 1024
const PRODUCT_IMAGE_MIME = ['image/png', 'image/jpeg', 'image/webp'] as const

function mimeToExt(mime: string): string {
  if (mime === 'image/png') return 'png'
  if (mime === 'image/jpeg') return 'jpg'
  if (mime === 'image/webp') return 'webp'
  return 'jpg'
}

export async function uploadProductImageAction(
  formData: FormData
): Promise<{ ok: true; url: string } | { ok: false; error: string }> {
  const auth = await requireAdmin()
  if (!auth.ok) {
    return { ok: false, error: auth.error }
  }

  if (getDataProvider() !== 'supabase') {
    return {
      ok: false,
      error: 'Upload disponível apenas com DATA_PROVIDER=supabase.',
    }
  }

  const file = formData.get('image')
  if (!(file instanceof File) || file.size === 0) {
    return { ok: false, error: 'Selecione uma imagem válida.' }
  }

  if (file.size > PRODUCT_IMAGE_MAX_BYTES) {
    return { ok: false, error: 'Imagem deve ter no máximo 5 MB.' }
  }

  if (!PRODUCT_IMAGE_MIME.includes(file.type as (typeof PRODUCT_IMAGE_MIME)[number])) {
    return { ok: false, error: 'Formato aceito: PNG, JPG ou WebP.' }
  }

  const productSlug = String(formData.get('productSlug') ?? '').trim()

  try {
    const buffer = Buffer.from(await file.arrayBuffer())
    const ext = mimeToExt(file.type)
    const filename = buildProductImageFilename(productSlug, ext)
    await writeProductImage(filename, buffer)
    return { ok: true, url: getProductsPublicUrl(filename) }
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Falha ao enviar imagem.'
    return { ok: false, error: message }
  }
}

export async function bulkSetProductStatusAction(
  ids: string[],
  status: ProductStatus
): Promise<{ ok: true; count: number } | { ok: false; error: string }> {
  await requireAdmin()
  if (!ids.length) return { ok: false, error: 'Nenhum produto selecionado.' }
  try {
    await getProductRepository().bulkSetStatus(ids, status)
    revalidateCatalog()
    return { ok: true, count: ids.length }
  } catch (err) {
    return { ok: false, error: err instanceof Error ? err.message : 'Erro ao atualizar.' }
  }
}

export async function bulkSetProductCategoryAction(
  ids: string[],
  category: string
): Promise<{ ok: true; count: number } | { ok: false; error: string }> {
  await requireAdmin()
  if (!ids.length) return { ok: false, error: 'Nenhum produto selecionado.' }
  if (!category.trim()) return { ok: false, error: 'Categoria inválida.' }
  try {
    await getProductRepository().bulkSetCategory(ids, category.trim())
    revalidateCatalog()
    return { ok: true, count: ids.length }
  } catch (err) {
    return { ok: false, error: err instanceof Error ? err.message : 'Erro ao atualizar.' }
  }
}

export async function bulkDeleteProductsAction(
  ids: string[]
): Promise<{ ok: true; count: number } | { ok: false; error: string }> {
  await requireAdmin()
  if (!ids.length) return { ok: false, error: 'Nenhum produto selecionado.' }
  try {
    await getProductRepository().deleteMany(ids)
    revalidateCatalog()
    return { ok: true, count: ids.length }
  } catch (err) {
    return { ok: false, error: err instanceof Error ? err.message : 'Erro ao excluir.' }
  }
}
