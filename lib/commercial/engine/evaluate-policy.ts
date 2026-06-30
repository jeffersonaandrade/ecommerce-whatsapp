import type {
  CommercialPolicy,
  CommercialProductPolicyOverride,
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
}

function totalQuantity(lines: PricedLine[]): number {
  return lines.reduce((sum, line) => sum + line.quantity, 0)
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

function eligibleBaseForPolicy(
  lines: PricedLine[],
  policy: CommercialPolicy,
  overrides: CommercialProductPolicyOverride[]
): number {
  return lines.reduce((sum, line) => {
    if (isProductExcluded(line.productId, policy.id, overrides)) return sum
    return sum + line.unitPrice * line.quantity
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

function isPolicyEligible(
  policy: CommercialPolicy,
  lines: PricedLine[],
  ctx: PolicyEvaluationContext
): boolean {
  if (!ctx.channelEnabled) return false
  if (policy.channel !== ctx.salesChannel) return false

  const minQty = policy.conditions.minQty
  if (minQty != null && minQty > 0 && totalQuantity(lines) < minQty) {
    return false
  }

  const eligibleBase = eligibleBaseForPolicy(lines, policy, ctx.overrides)
  if (eligibleBase <= 0) return false

  const discount = computeDiscountFromActions(policy.actions, eligibleBase)
  return discount > 0
}

export function evaluateCommercialPolicies(
  lines: PricedLine[],
  ctx: PolicyEvaluationContext
): PolicyEvaluationResult {
  if (lines.length === 0 || ctx.policies.length === 0) {
    return { policyDiscount: 0, policyIds: [] }
  }

  for (const policy of [...ctx.policies].sort(
    (a, b) => b.priority - a.priority || a.createdAt.localeCompare(b.createdAt)
  )) {
    if (!isPolicyEligible(policy, lines, ctx)) continue

    const eligibleBase = eligibleBaseForPolicy(lines, policy, ctx.overrides)
    const policyDiscount = computeDiscountFromActions(policy.actions, eligibleBase)

    if (policyDiscount <= 0) continue

    return {
      policyDiscount,
      policyIds: [policy.id],
      appliedPolicy: policy,
    }
  }

  return { policyDiscount: 0, policyIds: [] }
}
