import type { ProductFilters, ProductQuery, ProductQueryResult } from '@/lib/query'

const LIST_IDS_PAGE_SIZE = 500

export async function listProductIdsByQuery(
  query: (q: ProductQuery) => Promise<ProductQueryResult>,
  filters: ProductFilters
): Promise<string[]> {
  const idSet = new Set<string>()
  let page = 1

  while (true) {
    const result = await query({
      filters,
      pagination: { page, pageSize: LIST_IDS_PAGE_SIZE },
      fields: 'list',
    })

    for (const product of result.products) {
      idSet.add(product.id)
    }

    if (page >= result.totalPages) break
    page += 1
  }

  return [...idSet]
}
