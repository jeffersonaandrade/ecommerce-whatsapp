import { applyPromotion } from '@/lib/pricing/apply-promotion'
import type { CommercialRule } from '@/types/commercial-rule'
import type { PricedLine, RulesStageResult } from '../types'
import type { TraceBuilder } from '../trace-builder'

function isAutoRule(_rule: CommercialRule): boolean {
  // V1 legado: todas as rules existentes são promoções automáticas
  return true
}

function isManualRule(_rule: CommercialRule): boolean {
  // Fase 1: cupons manuais ainda não existem no schema legado
  return false
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

/** Fase 1: noop — cupons (trigger=manual) entram na Fase 3 */
export function applyManualRules(
  _rules: CommercialRule[],
  _lines: PricedLine[],
  _subtotalAfterAuto: number,
  _trace: TraceBuilder,
  _couponCode?: string
): RulesStageResult {
  return {
    ruleDiscount: 0,
    ruleIds: [],
  }
}

export function filterManualRules(rules: CommercialRule[]): CommercialRule[] {
  return rules.filter(isManualRule)
}
