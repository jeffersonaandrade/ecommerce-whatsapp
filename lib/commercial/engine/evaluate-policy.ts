import type {
  CommercialPolicy,
  CommercialProductPolicyOverride,
  EligibilityStrategy,
  PolicyAction,
} from '@/types/commercial-policy'
import type { PricedLine } from './types'

export type PolicyEvaluationContext = {
  salesChannel: CommercialPolicy['channel']
  channelEnabled: boolean
  policies: CommercialPolicy[]
  overrides: CommercialProductPolicyOverride[]
}

export type PolicyEvaluationResult = {
  policyDiscount: number
  policyIds: string[]
  appliedPolicy?: CommercialPolicy
  merchandiseDiscountBase: number
  lines: PricedLine[]
}

function totalQuantity(lines: PricedLine[]): number {
  return lines.reduce((sum, line) => sum + line.quantity, 0)
}

function eligibilityStrategy(policy: CommercialPolicy): EligibilityStrategy {
  return policy.conditions.eligibilityStrategy ?? 'cart_total'
}

function isProductExcluded(
  productId: string,
  policyId: string,
  overrides: CommercialProductPolicyOverride[]
): boolean {
  return overrides.some(
    (o) =>
      o.productId === productId &&
      (o.policyId === null || o.policyId === policyId) &&
      o.actions.some((a) => a.type === 'exclude_from_policy')
  )
}

function isLineEligibleByQty(
  line: PricedLine,
  policy: CommercialPolicy,
  lines: PricedLine[]
): boolean {
  const minQty = policy.conditions.minQty
  if (minQty == null || minQty <= 0) return true

  const strategy = eligibilityStrategy(policy)
  if (strategy === 'per_product') {
    return line.quantity >= minQty
  }

  return totalQuantity(lines) >= minQty
}

function isPolicyQtyEligible(policy: CommercialPolicy, lines: PricedLine[]): boolean {
  const minQty = policy.conditions.minQty
  if (minQty == null || minQty <= 0) return true

  const strategy = eligibilityStrategy(policy)
  if (strategy === 'per_product') {
    return lines.some((line) => line.quantity >= minQty)
  }

  return totalQuantity(lines) >= minQty
}

function eligibleBaseForPolicy(
  lines: PricedLine[],
  policy: CommercialPolicy,
  overrides: CommercialProductPolicyOverride[]
): number {
  return lines.reduce((sum, line) => {
    if (isProductExcluded(line.productId, policy.id, overrides)) return sum
    if (!isLineEligibleByQty(line, policy, lines)) return sum
    return sum + line.lineProductSubtotal
  }, 0)
}

function computeDiscountFromActions(
  actions: PolicyAction[],
  eligibleBase: number
): number {
  let discount = 0

  for (const action of actions) {
    if (action.type === 'discount_percent' && action.value != null && action.value > 0) {
      discount += (eligibleBase * action.value) / 100
    }
    if (action.type === 'discount_fixed' && action.value != null && action.value > 0) {
      discount += action.value
    }
  }

  return Math.min(discount, eligibleBase)
}

function allocatePolicyDiscountToLines(
  lines: PricedLine[],
  policy: CommercialPolicy,
  overrides: CommercialProductPolicyOverride[],
  policyDiscount: number,
  eligibleBase: number
): PricedLine[] {
  if (policyDiscount <= 0 || eligibleBase <= 0) {
    return lines.map((line) => ({
      ...line,
      lineDiscountEligibleBase: isProductExcluded(line.productId, policy.id, overrides)
        ? 0
        : isLineEligibleByQty(line, policy, lines)
          ? line.lineProductSubtotal
          : 0,
      lineDiscountTotal: 0,
      lineDisplayTotal: line.lineMerchandiseTotal,
    }))
  }

  return lines.map((line) => {
    const excluded = isProductExcluded(line.productId, policy.id, overrides)
    const qtyEligible = isLineEligibleByQty(line, policy, lines)
    const lineEligibleBase =
      excluded || !qtyEligible ? 0 : line.lineProductSubtotal
    const lineDiscountTotal =
      lineEligibleBase > 0
        ? Math.round((policyDiscount * lineEligibleBase) / eligibleBase * 100) / 100
        : 0

    return {
      ...line,
      lineDiscountEligibleBase: lineEligibleBase,
      lineDiscountTotal,
      lineDisplayTotal: line.lineMerchandiseTotal - lineDiscountTotal,
    }
  })
}

function isPolicyEligible(
  policy: CommercialPolicy,
  lines: PricedLine[],
  ctx: PolicyEvaluationContext
): boolean {
  if (!ctx.channelEnabled) return false
  if (policy.channel !== ctx.salesChannel) return false
  if (!isPolicyQtyEligible(policy, lines)) return false

  const eligibleBase = eligibleBaseForPolicy(lines, policy, ctx.overrides)
  if (eligibleBase <= 0) return false

  const discount = computeDiscountFromActions(policy.actions, eligibleBase)
  return discount > 0
}

export function evaluateCommercialPolicies(
  lines: PricedLine[],
  ctx: PolicyEvaluationContext
): PolicyEvaluationResult {
  const merchandiseDiscountBase = lines.reduce(
    (sum, line) => sum + line.lineProductSubtotal,
    0
  )

  if (lines.length === 0 || ctx.policies.length === 0) {
    return {
      policyDiscount: 0,
      policyIds: [],
      merchandiseDiscountBase,
      lines,
    }
  }

  for (const policy of [...ctx.policies].sort(
    (a, b) => b.priority - a.priority || a.createdAt.localeCompare(b.createdAt)
  )) {
    if (!isPolicyEligible(policy, lines, ctx)) continue

    const eligibleBase = eligibleBaseForPolicy(lines, policy, ctx.overrides)
    const policyDiscount = computeDiscountFromActions(policy.actions, eligibleBase)

    if (policyDiscount <= 0) continue

    const updatedLines = allocatePolicyDiscountToLines(
      lines,
      policy,
      ctx.overrides,
      policyDiscount,
      eligibleBase
    )

    return {
      policyDiscount,
      policyIds: [policy.id],
      appliedPolicy: policy,
      merchandiseDiscountBase: eligibleBase,
      lines: updatedLines,
    }
  }

  return {
    policyDiscount: 0,
    policyIds: [],
    merchandiseDiscountBase,
    lines,
  }
}
