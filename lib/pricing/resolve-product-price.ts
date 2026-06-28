import { Product } from '@/types/product'

export function resolveProductPrice(product: Product): number {
  if (
    product.promotionalPrice != null &&
    product.promotionalPrice < product.price
  ) {
    return product.promotionalPrice
  }
  return product.price
}
