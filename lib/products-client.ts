import { Product } from '@/types/product'
import { getClientCatalogCache } from '@/lib/catalog/client-catalog-cache'

function readCatalog(): Product[] {
  return getClientCatalogCache() ?? []
}

export function getProductById(id: string): Product | undefined {
  const product = readCatalog().find((p) => p.id === id)
  if (!product || product.status !== 'active') return undefined
  return product
}
