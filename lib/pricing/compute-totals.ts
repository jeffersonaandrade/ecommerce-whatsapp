import { CartItem } from '@/types/product'
import { CommercialRule } from '@/types/commercial-rule'
import { PersonalizationSettings } from '@/types/personalization-settings'
import { Product } from '@/types/product'
import { CartPricing } from '@/types/cart-pricing'
import { applyPromotion } from './apply-promotion'
import { resolveLinePrices } from './resolve-line-price'

export type ComputeTotalsContext = {
  getProductById: (id: string) => Product | undefined
  personalizationSettings: PersonalizationSettings
  commercialRules: CommercialRule[]
}

export function computeTotals(
  items: CartItem[],
  context: ComputeTotalsContext
): CartPricing {
  const lineContext = {
    getProductById: context.getProductById,
    personalizationSettings: context.personalizationSettings,
  }

  const lines = resolveLinePrices(items, lineContext)
  const merchandiseSubtotal = lines.reduce((sum, line) => sum + line.lineMerchandiseTotal, 0)
  const addonsSubtotal = lines.reduce(
    (sum, line) => sum + line.addonsUnitTotal * line.quantity,
    0
  )

  const { commercialDiscount, appliedRule } = applyPromotion(
    context.commercialRules,
    lines,
    merchandiseSubtotal
  )

  const cartTotal = Math.max(0, merchandiseSubtotal - commercialDiscount)

  return {
    lines,
    merchandiseSubtotal,
    addonsSubtotal,
    commercialDiscount,
    appliedRule,
    cartTotal,
  }
}
