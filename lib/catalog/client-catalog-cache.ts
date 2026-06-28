import { Product } from '@/types/product'
import type { ProductCartLite } from '@/lib/products-types'
import { cartLiteToProduct } from '@/lib/catalog/cart-lite-mapper'

let memoryCache: Product[] | null = null

export function getClientCatalogCache(): Product[] | null {
  return memoryCache
}

export function setCatalogCache(products: Product[]): void {
  memoryCache = products
}

export function mergeCatalogCache(products: Product[]): void {
  if (!products.length) return
  if (!memoryCache?.length) {
    memoryCache = products
    return
  }
  const byId = new Map(memoryCache.map((product) => [product.id, product]))
  for (const product of products) {
    byId.set(product.id, product)
  }
  memoryCache = [...byId.values()]
}

export function mergeCatalogCacheFromLite(items: ProductCartLite[]): void {
  mergeCatalogCache(items.map(cartLiteToProduct))
}

export async function fetchCatalogProductsByIds(ids: string[]): Promise<void> {
  const uniqueIds = [...new Set(ids.map((id) => id.trim()).filter(Boolean))]
  if (!uniqueIds.length) return

  const res = await fetch(`/api/products?ids=${encodeURIComponent(uniqueIds.join(','))}`)
  if (!res.ok) return

  const products = (await res.json()) as ProductCartLite[]
  mergeCatalogCacheFromLite(products)
}
