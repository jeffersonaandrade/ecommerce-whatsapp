import { resolveCommercialPricing } from '@/lib/commercial/engine/resolve-commercial-pricing'
import { CartItem } from '@/types/product'
import { CommercialRule } from '@/types/commercial-rule'
import {
  CommercialPolicy,
  CommercialProductPolicyOverride,
  CommercialSalesChannels,
} from '@/types/commercial-policy'
import { PersonalizationSettings } from '@/types/personalization-settings'
import { Product } from '@/types/product'
import { CartPricing } from '@/types/cart-pricing'

export type ComputeTotalsContext = {
  getProductById: (id: string) => Product | undefined
  personalizationSettings: PersonalizationSettings
  commercialRules: CommercialRule[]
  commercialPolicies?: CommercialPolicy[]
  policyOverrides?: CommercialProductPolicyOverride[]
  salesChannels?: CommercialSalesChannels
}

export function computeTotals(
  items: CartItem[],
  context: ComputeTotalsContext
): CartPricing {
  const result = resolveCommercialPricing({
    items,
    getProductById: context.getProductById,
    personalizationSettings: context.personalizationSettings,
    commercialRules: context.commercialRules,
    commercialPolicies: context.commercialPolicies,
    policyOverrides: context.policyOverrides,
    salesChannels: context.salesChannels,
    salesChannel: 'retail',
  })

  const merchandiseSubtotal =
    result.subtotals.merchandiseBase + result.subtotals.adjustments

  return {
    lines: result.lines,
    merchandiseSubtotal,
    addonsSubtotal: result.subtotals.adjustments,
    commercialDiscount: result.discounts.total,
    appliedRule: result.applied.appliedRule,
    cartTotal: result.total,
  }
}
