'use server'

import { revalidatePath } from 'next/cache'
import { requireAdmin } from '@/lib/auth/require-admin'
import { ProductStatus } from '@/types/product'
import { getProductRepository } from './get-product-repository'
import { ProductInput } from './product-repository'
import { validateProductInput } from './product-utils'

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
): Promise<{ ok: true; id: string } | { ok: false; errors: string[] }> {
  const auth = await requireAdmin()
  if (!auth.ok) {
    return { ok: false, errors: [auth.error] }
  }

  try {
    const repo = getProductRepository()
    const input = toProductInput(payload)
    const catalog = await repo.getAll()
    const errors = validateProductInput(input, catalog)
    if (errors.length > 0) {
      return { ok: false, errors: errors.map((e) => e.message) }
    }

    const product = await repo.create(input)
    revalidateCatalog()
    return { ok: true, id: product.id }
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Falha ao criar produto'
    return { ok: false, errors: [message] }
  }
}

export async function updateProductAction(
  id: string,
  payload: ProductFormPayload
): Promise<{ ok: true } | { ok: false; errors: string[] }> {
  const auth = await requireAdmin()
  if (!auth.ok) {
    return { ok: false, errors: [auth.error] }
  }

  const repo = getProductRepository()
  const input = toProductInput(payload)
  const catalog = await repo.getAll()
  const errors = validateProductInput(input, catalog, id)
  if (errors.length > 0) {
    return { ok: false, errors: errors.map((e) => e.message) }
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
