import { CommercialRule, QuantityDiscountConfig } from '@/types/commercial-rule'
import { PricedCartLine } from '@/types/cart-pricing'
import { AppliedCommercialRule } from '@/types/cart-pricing'

export type PromotionEvaluation = {
  eligible: boolean
  eligibleQuantity: number
  discountGroups: number
  discountAmount: number
}

export function evaluateQuantityDiscount(
  rule: CommercialRule,
  lines: PricedCartLine[]
): PromotionEvaluation {
  const config = rule.config as QuantityDiscountConfig
  const eligibleQuantity = lines.reduce((sum, line) => sum + line.quantity, 0)
  const discountGroups = Math.floor(eligibleQuantity / config.requiredQuantity)
  const discountAmount = discountGroups * config.discountAmount

  return {
    eligible: discountGroups > 0,
    eligibleQuantity,
    discountGroups,
    discountAmount,
  }
}

export function evaluatePromotion(
  rule: CommercialRule,
  lines: PricedCartLine[]
): PromotionEvaluation | null {
  if (rule.type === 'quantity_discount') {
    return evaluateQuantityDiscount(rule, lines)
  }
  return null
}

export function applyPromotion(
  rules: CommercialRule[],
  lines: PricedCartLine[],
  merchandiseSubtotal: number
): { commercialDiscount: number; appliedRule?: AppliedCommercialRule } {
  for (const rule of rules) {
    const result = evaluatePromotion(rule, lines)
    if (!result?.eligible || result.discountAmount <= 0) continue

    const commercialDiscount = Math.min(result.discountAmount, merchandiseSubtotal)
    return {
      commercialDiscount,
      appliedRule: {
        ruleId: rule.id,
        ruleName: rule.name,
        ruleType: rule.type,
        eligibleQuantity: result.eligibleQuantity,
        discountGroups: result.discountGroups,
        discountAmount: commercialDiscount,
      },
    }
  }

  return { commercialDiscount: 0 }
}
