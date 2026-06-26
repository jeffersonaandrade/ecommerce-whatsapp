import { Product } from '@/types/product'

export function pickHomeProductSections(
  allProducts: Product[],
  featuredLimit = 6,
  seeAlsoLimit = 4
): { featured: Product[]; seeAlso: Product[] } {
  const featured = allProducts.slice(0, featuredLimit)
  const featuredIds = new Set(featured.map((p) => p.id))
  const seeAlso = allProducts.filter((p) => !featuredIds.has(p.id)).slice(0, seeAlsoLimit)
  return { featured, seeAlso }
}
