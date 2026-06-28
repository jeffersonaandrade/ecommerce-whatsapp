import { Product } from '@/types/product'
import { isProductInStock } from '@/lib/products'

export function pickHomeProductSections(
  allProducts: Product[],
  featuredLimit = 6,
  seeAlsoLimit = 4
): { featured: Product[]; seeAlso: Product[] } {
  const inStock = allProducts.filter(isProductInStock)
  const featured = inStock.slice(0, featuredLimit)
  const featuredIds = new Set(featured.map((p) => p.id))
  const seeAlso = inStock.filter((p) => !featuredIds.has(p.id)).slice(0, seeAlsoLimit)
  return { featured, seeAlso }
}
