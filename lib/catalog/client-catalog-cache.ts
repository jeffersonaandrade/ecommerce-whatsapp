import { Product } from '@/types/product'

let memoryCache: Product[] | null = null

export function getClientCatalogCache(): Product[] | null {
  return memoryCache
}

export function setCatalogCache(products: Product[]): void {
  memoryCache = products
}
