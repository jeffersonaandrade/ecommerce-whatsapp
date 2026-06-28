import { cartItemKey } from '@/lib/cart-storage'
import { CartPricing } from '@/types/cart-pricing'
import { CartItem } from '@/types/product'

/**
 * Garante que linhas precificadas mantenham os addons do carrinho ao montar o intent.
 * Recupera nome/número/observação quando a linha tem taxa de personalização mas perdeu os addons.
 */
export function enrichPricingWithCartItems(
  pricing: CartPricing,
  items: CartItem[]
): CartPricing {
  const itemsByKey = new Map(
    items.map((item) => [cartItemKey(item.productId, item.variationId, item.addons), item])
  )

  return {
    ...pricing,
    lines: pricing.lines.map((line) => {
      if (line.addons?.personalization) return line

      const exactItem = itemsByKey.get(
        cartItemKey(line.productId, line.variationId, line.addons)
      )
      if (exactItem?.addons?.personalization) {
        return { ...line, addons: exactItem.addons }
      }

      if (line.addonsUnitTotal <= 0) return line

      const personalizedItem = items.find(
        (item) =>
          item.productId === line.productId &&
          item.variationId === line.variationId &&
          item.addons?.personalization
      )

      if (!personalizedItem?.addons) return line
      return { ...line, addons: personalizedItem.addons }
    }),
  }
}
