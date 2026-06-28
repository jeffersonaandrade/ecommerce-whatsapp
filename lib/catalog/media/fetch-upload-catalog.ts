import 'server-only'

import { queryProductsAdmin } from '@/lib/products'
import type { MediaMapProduct } from './types'

/** Catálogo lite paginado para aba Upload da Central de Mídia. */
export async function fetchMediaUploadCatalog(): Promise<MediaMapProduct[]> {
  const pageSize = 500
  const products: MediaMapProduct[] = []
  let page = 1

  while (true) {
    const result = await queryProductsAdmin({
      fields: 'list',
      pagination: { page, pageSize },
    })

    products.push(
      ...result.products.map((p) => ({
        id: p.id,
        name: p.name,
        slug: p.slug,
        sku: p.variations[0]?.sku ?? null,
        images: p.images,
        productStatus: p.status,
      }))
    )

    if (page >= result.totalPages) break
    page++
  }

  return products
}
