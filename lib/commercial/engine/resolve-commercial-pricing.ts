import { applyCommercialPolicies } from './stages/apply-commercial-policies'
import { applyAutoRules, applyManualRules } from './stages/apply-rules'
import { buildAdjustmentTrace } from './stages/build-adjustment-trace'
import { calculateFreight } from './stages/calculate-freight'
import { resolveBasePrices } from './stages/resolve-base-prices'
import { createTraceBuilder } from './trace-builder'
import {
  COMMERCIAL_ENGINE_VERSION,
  type CommercialEngineInput,
  type CommercialResult,
} from './types'

const DEFAULT_SALES_CHANNELS = {
  retail: true,
  wholesale: false,
  distributor: false,
} as const

export function resolveCommercialPricing(
  input: CommercialEngineInput
): CommercialResult {
  const traceBuilder = createTraceBuilder()
  const salesChannel = input.salesChannel ?? 'retail'
  const salesChannels = input.salesChannels ?? DEFAULT_SALES_CHANNELS

  if (input.items.length === 0) {
    return {
      engineVersion: COMMERCIAL_ENGINE_VERSION,
      lines: [],
      subtotals: {
        merchandiseBase: 0,
        policyDiscount: 0,
        ruleDiscount: 0,
        freight: null,
        adjustments: 0,
      },
      discounts: { total: 0 },
      total: 0,
      applied: {
        policyIds: [],
        ruleIds: [],
        couponCode: input.couponCode,
      },
      trace: [],
      errors: [],
    }
  }

  const base = resolveBasePrices(input, traceBuilder)
  const policies = applyCommercialPolicies(
    base,
    {
      salesChannel,
      salesChannels,
      policies: input.commercialPolicies ?? [],
      overrides: input.policyOverrides ?? [],
    },
    traceBuilder
  )
  buildAdjustmentTrace(base.adjustments, traceBuilder)

  const subtotalAfterPolicy = Math.max(
    0,
    base.merchandiseSubtotal - policies.policyDiscount
  )

  const autoRules = applyAutoRules(
    input.commercialRules,
    base.lines,
    subtotalAfterPolicy,
    traceBuilder
  )

  const subtotalAfterAuto = Math.max(0, subtotalAfterPolicy - autoRules.ruleDiscount)

  const manualRules = applyManualRules(
    input.commercialRules,
    base.lines,
    subtotalAfterAuto,
    traceBuilder,
    input.couponCode
  )

  const ruleDiscount = autoRules.ruleDiscount + manualRules.ruleDiscount
  const ruleIds = [...autoRules.ruleIds, ...manualRules.ruleIds]
  const totalDiscount = policies.policyDiscount + ruleDiscount

  const freight = calculateFreight(traceBuilder, base.lines.length > 0)

  const total = Math.max(0, base.merchandiseSubtotal - totalDiscount)

  return {
    engineVersion: COMMERCIAL_ENGINE_VERSION,
    lines: base.lines,
    subtotals: {
      merchandiseBase: base.merchandiseBase,
      policyDiscount: policies.policyDiscount,
      ruleDiscount,
      freight: freight.freight,
      adjustments: base.adjustments,
    },
    discounts: {
      total: totalDiscount,
    },
    total,
    applied: {
      policyIds: policies.policyIds,
      ruleIds,
      couponCode: input.couponCode,
      appliedRule: autoRules.appliedRule,
    },
    trace: traceBuilder.trace,
    errors: [],
  }
}
