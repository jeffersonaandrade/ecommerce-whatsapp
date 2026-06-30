'use server'

import { requireAdmin } from '@/lib/auth/require-admin'
import { getProductRepository } from '@/lib/catalog/get-product-repository'
import type { Product } from '@/types/product'
import type { ProductStatus } from '@/types/product'

export type ProductPickerItem = {
  id: string
  name: string
  sku: string | null
  status: ProductStatus
}

function toPickerItem(product: Product): ProductPickerItem {
  const sku = product.variations.find((v) => v.sku.trim())?.sku ?? null
  return {
    id: product.id,
    name: product.name,
    sku,
    status: product.status,
  }
}

export async function searchProductsForPickerAction(
  query: string
): Promise<
  { ok: true; items: ProductPickerItem[] } | { ok: false; error: string }
> {
  const auth = await requireAdmin()
  if (!auth.ok) return { ok: false, error: auth.error }

  const term = query.trim()
  if (term.length < 2) return { ok: true, items: [] }

  const result = await getProductRepository().query({
    filters: { search: term },
    sort: { by: 'name', dir: 'asc' },
    pagination: { page: 1, pageSize: 20 },
    fields: 'list',
  })

  return { ok: true, items: result.products.map(toPickerItem) }
}

export async function getProductsForPickerByIdsAction(
  ids: string[]
): Promise<
  { ok: true; items: ProductPickerItem[] } | { ok: false; error: string }
> {
  const auth = await requireAdmin()
  if (!auth.ok) return { ok: false, error: auth.error }

  const uniqueIds = [...new Set(ids.map((id) => id.trim()).filter(Boolean))]
  if (uniqueIds.length === 0) return { ok: true, items: [] }

  const products = await getProductRepository().getByIdsAdmin(uniqueIds)
  const byId = new Map(products.map((product) => [product.id, product]))

  const items = uniqueIds.map((id) => {
    const product = byId.get(id)
    if (product) return toPickerItem(product)
    return {
      id,
      name: 'Produto não encontrado',
      sku: null,
      status: 'unavailable' as ProductStatus,
    }
  })

  return { ok: true, items }
}
