import 'server-only'

import { Product } from '@/types/product'
import { getProductRepository } from './get-product-repository'

/** Catálogo lite paginado para import (sem long_description). */
export async function fetchImportCatalogSnapshot(): Promise<Product[]> {
  const repo = getProductRepository()
  const pageSize = 500
  const products: Product[] = []
  let page = 1

  while (true) {
    const result = await repo.query({
      fields: 'list',
      pagination: { page, pageSize },
    })
    products.push(...result.products)
    if (page >= result.totalPages) break
    page++
  }

  return products
}
