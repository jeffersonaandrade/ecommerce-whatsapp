import type { CartAddons } from '@/types/cart-addons'
import type { CommercialRuleType } from '@/types/commercial-rule'

export type AppliedCommercialRule = {
  ruleId: string
  ruleName: string
  ruleType: CommercialRuleType
  eligibleQuantity: number
  discountGroups: number
  discountAmount: number
}

export type PricedCartLine = {
  productId: string
  variationId: string
  quantity: number
  name: string
  slug: string
  sku: string
  image: string
  size?: string
  color?: string
  unitPrice: number
  addons?: CartAddons
  addonsUnitTotal: number
  lineMerchandiseTotal: number
  maxStock: number
}

export type CartPricing = {
  lines: PricedCartLine[]
  merchandiseSubtotal: number
  addonsSubtotal: number
  commercialDiscount: number
  appliedRule?: AppliedCommercialRule
  cartTotal: number
}
