import { applyPromotion } from '@/lib/pricing/apply-promotion'
import type { CommercialRule } from '@/types/commercial-rule'
import type { CommercialError, PricedLine, RulesStageResult } from '../types'
import type { TraceBuilder } from '../trace-builder'
import type { Product } from '@/types/product'
import { normalizeCouponCode } from '@/lib/commercial/commercial-rule-mapper'
import {
  evaluateManualCoupon,
  type ManualCouponContext,
} from '../evaluate-manual-coupon'

function isAutoRule(rule: CommercialRule): boolean {
  return (rule.trigger ?? 'auto') === 'auto'
}

function isManualRule(rule: CommercialRule): boolean {
  return rule.trigger === 'manual'
}

export function applyAutoRules(
  rules: CommercialRule[],
  lines: PricedLine[],
  merchandiseSubtotal: number,
  trace: TraceBuilder
): RulesStageResult {
  const autoRules = rules.filter(isAutoRule)
  const { commercialDiscount, appliedRule } = applyPromotion(
    autoRules,
    lines,
    merchandiseSubtotal
  )

  if (commercialDiscount > 0 && appliedRule) {
    trace.append({
      stage: 'rule',
      ruleId: appliedRule.ruleId,
      label: appliedRule.ruleName,
      amount: -commercialDiscount,
      status: 'applied',
      source: 'rule',
      metadata: {
        ruleType: appliedRule.ruleType,
        eligibleQuantity: appliedRule.eligibleQuantity,
        discountGroups: appliedRule.discountGroups,
      },
    })
  }

  return {
    ruleDiscount: commercialDiscount,
    ruleIds: appliedRule ? [appliedRule.ruleId] : [],
    appliedRule,
  }
}

export type ApplyManualRulesContext = ManualCouponContext & {
  getProductById: (id: string) => Product | undefined
}

export function applyManualRules(
  rules: CommercialRule[],
  lines: PricedLine[],
  subtotalAfterAuto: number,
  trace: TraceBuilder,
  couponCode: string | undefined,
  ctx: ApplyManualRulesContext
): RulesStageResult {
  if (!couponCode?.trim()) {
    return { ruleDiscount: 0, ruleIds: [], errors: [] }
  }

  const normalized = normalizeCouponCode(couponCode)
  const result = evaluateManualCoupon(rules, lines, normalized, ctx)

  if (result.errors.length > 0) {
    const primary = result.errors[0]!
    trace.append({
      stage: 'error',
      label: `Cupom ${normalized}`,
      amount: 0,
      status: 'skipped',
      source: 'coupon',
      skipReason: primary.message,
      metadata: { code: primary.code, couponCode: normalized },
    })
    return { ruleDiscount: 0, ruleIds: [], errors: result.errors }
  }

  if (result.discount > 0 && result.ruleId) {
    const capped = Math.min(result.discount, subtotalAfterAuto)
    trace.append({
      stage: 'rule',
      ruleId: result.ruleId,
      label: `Cupom ${result.couponName ?? normalized}`,
      amount: -capped,
      status: 'applied',
      source: 'coupon',
      metadata: { couponCode: result.appliedCouponCode },
    })

    return {
      ruleDiscount: capped,
      ruleIds: [result.ruleId],
      appliedCouponCode: result.appliedCouponCode,
      errors: [],
    }
  }

  return { ruleDiscount: 0, ruleIds: [], errors: result.errors }
}

export function filterManualRules(rules: CommercialRule[]): CommercialRule[] {
  return rules.filter(isManualRule)
}
