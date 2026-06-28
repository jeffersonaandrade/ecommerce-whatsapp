import { CartItem, Product } from '@/types/product'
import { PersonalizationSettings } from '@/types/personalization-settings'
import { PricedCartLine } from '@/types/cart-pricing'
import { findVariation } from '@/lib/cart-utils'
import { resolveProductPrice } from './resolve-product-price'
import { resolveAddonsUnitTotal } from './resolve-addons-price'

export type ResolveLinePriceContext = {
  getProductById: (id: string) => Product | undefined
  personalizationSettings: PersonalizationSettings
}

export function resolveLinePrice(
  item: CartItem,
  context: ResolveLinePriceContext
): PricedCartLine | null {
  const product = context.getProductById(item.productId)
  if (!product || product.status !== 'active') return null

  const variation = findVariation(product, item.variationId)
  if (!variation || variation.stock <= 0) return null

  const quantity = Math.min(item.quantity, variation.stock)
  const unitPrice = resolveProductPrice(product)
  const addonsUnitTotal = resolveAddonsUnitTotal(
    item.addons,
    product,
    context.personalizationSettings
  )
  const lineMerchandiseTotal = (unitPrice + addonsUnitTotal) * quantity

  return {
    productId: item.productId,
    variationId: item.variationId,
    quantity,
    name: product.name,
    slug: product.slug,
    sku: variation.sku,
    image: product.images[0] ?? '',
    size: variation.size,
    color: variation.color,
    unitPrice,
    addons: item.addons,
    addonsUnitTotal,
    lineMerchandiseTotal,
    maxStock: variation.stock,
  }
}

export function resolveLinePrices(
  items: CartItem[],
  context: ResolveLinePriceContext
): PricedCartLine[] {
  const lines: PricedCartLine[] = []
  for (const item of items) {
    const line = resolveLinePrice(item, context)
    if (line) lines.push(line)
  }
  return lines
}
