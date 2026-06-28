'use server'

import { revalidatePath, updateTag } from 'next/cache'
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
import {
  mimeToImageExt,
  validateImageFile,
} from '@/lib/media/validate-image-file'

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
  personalizationEnabled?: boolean
  personalizationPrice?: number | null
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
    personalizationEnabled: payload.personalizationEnabled ?? false,
    personalizationPrice: payload.personalizationPrice ?? null,
  }
}

function revalidateCatalog() {
  revalidatePath('/')
  revalidatePath('/products')
  revalidatePath('/admin')
  revalidatePath('/admin/products')
  revalidatePath('/admin/categories')
  updateTag('storefront')
}

function revalidateProduct(slug: string) {
  revalidateCatalog()
  updateTag(`product-${slug}`)
  revalidatePath(`/products/${slug}`)
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
    const categoryRepo = getCategoryRepository()
    const input = toProductInput(payload)
    const skus = input.variations.map((v) => v.sku.trim()).filter(Boolean)
    const [conflictingSkus, categories] = await Promise.all([
      repo.findConflictingSkus(skus),
      categoryRepo.getAll(),
    ])
    const errors = validateProductInput(
      input,
      [],
      undefined,
      categories,
      conflictingSkus
    )
    if (errors.length > 0) {
      return { ok: false, errors }
    }

    const product = await repo.create(input)
    revalidateProduct(product.slug)
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
  const categoryRepo = getCategoryRepository()
  const input = toProductInput(payload)
  const skus = input.variations.map((v) => v.sku.trim()).filter(Boolean)
  const [conflictingSkus, categories] = await Promise.all([
    repo.findConflictingSkus(skus, id),
    categoryRepo.getAll(),
  ])
  const errors = validateProductInput(input, [], id, categories, conflictingSkus)
  if (errors.length > 0) {
    return { ok: false, errors }
  }

  const product = await repo.update(id, input)
  revalidateProduct(product.slug)
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
  const fileError = validateImageFile(file instanceof File ? file : new File([], ''), {
    allowExtensionFallback: false,
  })
  if (fileError) {
    return { ok: false, error: fileError }
  }

  const validFile = file as File

  const productSlug = String(formData.get('productSlug') ?? '').trim()

  try {
    const buffer = Buffer.from(await validFile.arrayBuffer())
    const ext = mimeToImageExt(validFile.type)
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
