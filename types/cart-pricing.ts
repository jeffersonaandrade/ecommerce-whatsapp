import type { CartAddons } from '@/types/cart-addons'
import type { CommercialRuleType } from '@/types/commercial-rule'
import type { CommercialTrace } from '@/lib/commercial/engine/types'

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
  /** Preço do produto × qty (sem personalização) */
  lineProductSubtotal: number
  /** Personalização/acréscimos × qty */
  lineAdjustmentTotal: number
  /** Base elegível para desconto de policy (produto) */
  lineDiscountEligibleBase: number
  /** Desconto de policy alocado na linha */
  lineDiscountTotal: number
  /** Total exibido da linha após descontos de policy */
  lineDisplayTotal: number
  maxStock: number
}

export type CartPricing = {
  lines: PricedCartLine[]
  merchandiseSubtotal: number
  addonsSubtotal: number
  commercialDiscount: number
  appliedRule?: AppliedCommercialRule
  appliedCouponCode?: string
  pricingErrors?: { code: string; message: string }[]
  cartTotal: number
  trace: CommercialTrace
}
