import { getProductById } from '@/lib/products'
import { CartItem, Product, ProductVariation } from '@/types/product'

export function resolveProductPrice(product: Product): number {
  if (
    product.promotionalPrice != null &&
    product.promotionalPrice < product.price
  ) {
    return product.promotionalPrice
  }
  return product.price
}

export type CartLine = {
  productId: string
  variationId: string
  quantity: number
  name: string
  slug: string
  image: string
  size?: string
  color?: string
  unitPrice: number
  lineTotal: number
  maxStock: number
}

export function findVariation(
  product: Product,
  variationId: string
): ProductVariation | undefined {
  return product.variations.find((v) => v.id === variationId)
}

export function findDefaultVariation(product: Product): ProductVariation | undefined {
  return product.variations.find((v) => v.stock > 0)
}

export function resolveVariationBySelection(
  product: Product,
  size?: string,
  color?: string
): ProductVariation | undefined {
  const match = product.variations.find(
    (v) =>
      v.stock > 0 &&
      (size == null || v.size === size) &&
      (color == null || v.color === color)
  )
  return match ?? findDefaultVariation(product)
}

export function resolveCartLines(items: CartItem[]): CartLine[] {
  const lines: CartLine[] = []

  for (const item of items) {
    const product = getProductById(item.productId)
    if (!product || product.status !== 'active') continue

    const variation = findVariation(product, item.variationId)
    if (!variation || variation.stock <= 0) continue

    const quantity = Math.min(item.quantity, variation.stock)
    const unitPrice = resolveProductPrice(product)

    lines.push({
      productId: item.productId,
      variationId: item.variationId,
      quantity,
      name: product.name,
      slug: product.slug,
      image: product.images[0] ?? '',
      size: variation.size,
      color: variation.color,
      unitPrice,
      lineTotal: unitPrice * quantity,
      maxStock: variation.stock,
    })
  }

  return lines
}

export function calculateSubtotal(lines: CartLine[]): number {
  return lines.reduce((sum, line) => sum + line.lineTotal, 0)
}

export function calculateItemCount(items: CartItem[]): number {
  return items.reduce((sum, item) => sum + item.quantity, 0)
}

export function cartItemKey(productId: string, variationId: string): string {
  return `${productId}:${variationId}`
}
