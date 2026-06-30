import type { CommercialError, PricedLine } from '@/lib/commercial/engine/types'
import type {
  CommercialAction,
  CommercialRule,
  CommercialRuleConditions,
} from '@/types/commercial-rule'
import type { Product } from '@/types/product'
import { isWithinDateRange } from '@/lib/commercial/rule-eligibility'
import { normalizeCouponCode } from '@/lib/commercial/commercial-rule-mapper'

export type ManualCouponContext = {
  getProductById: (id: string) => Product | undefined
  subtotalAfterPolicy: number
  merchandiseAfterPolicy: number
  autoRuleDiscount: number
  now?: Date
}

export type ManualCouponResult = {
  discount: number
  ruleId?: string
  appliedCouponCode?: string
  couponName?: string
  errors: CommercialError[]
}

function isLineEligibleForCoupon(
  line: PricedLine,
  conditions: CommercialRuleConditions,
  getProductById: (id: string) => Product | undefined
): boolean {
  const product = getProductById(line.productId)
  if (!product) return false

  const categoryIds = conditions.categoryIds ?? []
  const productIds = conditions.productIds ?? []
  const hasCategoryFilter = categoryIds.length > 0
  const hasProductFilter = productIds.length > 0

  if (!hasCategoryFilter && !hasProductFilter) return true

  if (hasProductFilter && productIds.includes(line.productId)) return true
  if (
    hasCategoryFilter &&
    product.categoryId &&
    categoryIds.includes(product.categoryId)
  ) {
    return true
  }

  return false
}

function merchandiseAfterPolicyForLines(lines: PricedLine[]): number {
  return lines.reduce(
    (sum, line) => sum + line.lineProductSubtotal - line.lineDiscountTotal,
    0
  )
}

function eligibleMerchandiseAfterPolicyAndAuto(
  eligibleLines: PricedLine[],
  allLines: PricedLine[],
  ctx: ManualCouponContext
): number {
  const eligibleMerchAfterPolicy = merchandiseAfterPolicyForLines(eligibleLines)
  const allMerchAfterPolicy = ctx.merchandiseAfterPolicy

  if (eligibleMerchAfterPolicy <= 0) return 0
  if (ctx.autoRuleDiscount <= 0 || allMerchAfterPolicy <= 0) {
    return eligibleMerchAfterPolicy
  }

  const autoOnEligible =
    ctx.autoRuleDiscount * (eligibleMerchAfterPolicy / allMerchAfterPolicy)

  return Math.max(0, eligibleMerchAfterPolicy - autoOnEligible)
}

function computeDiscountFromActions(
  actions: CommercialAction[],
  eligibleBase: number
): number {
  let discount = 0

  for (const action of actions) {
    if (action.type === 'discount_percent' && action.value > 0 && action.value <= 100) {
      discount += (eligibleBase * action.value) / 100
    }
    if (action.type === 'discount_fixed' && action.value > 0) {
      discount += action.value
    }
  }

  return Math.min(discount, eligibleBase)
}

function couponError(code: string, message: string): CommercialError {
  return { code, message }
}

export function evaluateManualCoupon(
  rules: CommercialRule[],
  lines: PricedLine[],
  couponCode: string,
  ctx: ManualCouponContext
): ManualCouponResult {
  const normalized = normalizeCouponCode(couponCode)
  if (!normalized) {
    return {
      discount: 0,
      errors: [couponError('COUPON_NOT_FOUND', 'Cupom inválido.')],
    }
  }

  const manualRules = rules.filter((r) => r.trigger === 'manual')
  const rule = manualRules.find(
    (r) => r.code && normalizeCouponCode(r.code) === normalized
  )

  if (!rule) {
    return {
      discount: 0,
      errors: [couponError('COUPON_NOT_FOUND', 'Cupom não encontrado ou inativo.')],
    }
  }

  const now = ctx.now ?? new Date()

  if (rule.status !== 'active') {
    return {
      discount: 0,
      errors: [couponError('COUPON_INACTIVE', 'Cupom inativo.')],
    }
  }

  if (!isWithinDateRange(rule, now)) {
    return {
      discount: 0,
      errors: [couponError('COUPON_EXPIRED', 'Cupom expirado ou fora da vigência.')],
    }
  }

  if (
    rule.usageLimit != null &&
    rule.usageLimit > 0 &&
    rule.usageCount >= rule.usageLimit
  ) {
    return {
      discount: 0,
      errors: [couponError('COUPON_USAGE_LIMIT', 'Limite de uso do cupom atingido.')],
    }
  }

  const conditions = rule.conditions ?? {}
  const eligibleLines = lines.filter((line) =>
    isLineEligibleForCoupon(line, conditions, ctx.getProductById)
  )

  if (eligibleLines.length === 0) {
    return {
      discount: 0,
      errors: [
        couponError('COUPON_NO_ELIGIBLE_ITEMS', 'Nenhum item elegível para este cupom.'),
      ],
    }
  }

  const eligibleQty = eligibleLines.reduce((sum, line) => sum + line.quantity, 0)
  if (conditions.minQty != null && conditions.minQty > 0 && eligibleQty < conditions.minQty) {
    return {
      discount: 0,
      errors: [
        couponError(
          'COUPON_MIN_QTY',
          `Quantidade mínima de ${conditions.minQty} itens elegíveis não atingida.`
        ),
      ],
    }
  }

  const eligibleBase = eligibleMerchandiseAfterPolicyAndAuto(eligibleLines, lines, ctx)

  if (conditions.minSubtotal != null && conditions.minSubtotal > 0) {
    if (eligibleBase < conditions.minSubtotal) {
      return {
        discount: 0,
        errors: [
          couponError(
            'COUPON_MIN_SUBTOTAL',
            `Pedido mínimo de R$ ${conditions.minSubtotal.toFixed(2)} não atingido para itens elegíveis.`
          ),
        ],
      }
    }
  }

  const actions = rule.actions ?? []
  if (actions.length === 0) {
    return {
      discount: 0,
      errors: [couponError('COUPON_INVALID', 'Cupom sem ação de desconto configurada.')],
    }
  }

  const discount = computeDiscountFromActions(actions, eligibleBase)
  if (discount <= 0) {
    return {
      discount: 0,
      errors: [couponError('COUPON_INVALID', 'Cupom não gerou desconto elegível.')],
    }
  }

  return {
    discount,
    ruleId: rule.id,
    appliedCouponCode: normalized,
    couponName: rule.name,
    errors: [],
  }
}
