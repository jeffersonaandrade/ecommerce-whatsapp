'use server'

import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'
import { ProductStatus } from '@/types/product'
import { getProductRepository } from './json-product-repository'
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
  const repo = getProductRepository()
  const input = toProductInput(payload)
  const errors = validateProductInput(input, repo.getAll())
  if (errors.length > 0) {
    return { ok: false, errors: errors.map((e) => e.message) }
  }

  const product = repo.create(input)
  revalidateCatalog()
  redirect(`/admin/products/${product.id}/edit?created=1`)
}

export async function updateProductAction(
  id: string,
  payload: ProductFormPayload
): Promise<{ ok: true } | { ok: false; errors: string[] }> {
  const repo = getProductRepository()
  const input = toProductInput(payload)
  const errors = validateProductInput(input, repo.getAll(), id)
  if (errors.length > 0) {
    return { ok: false, errors: errors.map((e) => e.message) }
  }

  repo.update(id, input)
  revalidateCatalog()
  return { ok: true }
}

export async function deleteProductAction(id: string): Promise<void> {
  getProductRepository().delete(id)
  revalidateCatalog()
  redirect('/admin/products')
}
