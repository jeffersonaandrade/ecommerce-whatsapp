import { applyCommercialPolicies } from './stages/apply-commercial-policies'
import { appendSkippedStageTrace } from './stages/apply-accumulation-gate'
import { applyAutoRules, applyManualRules } from './stages/apply-rules'
import { buildAdjustmentTrace } from './stages/build-adjustment-trace'
import { calculateFreight } from './stages/calculate-freight'
import { resolveBasePrices } from './stages/resolve-base-prices'
import { resolveAccumulationGates } from './resolve-accumulation'
import { createTraceBuilder } from './trace-builder'
import {
  COMMERCIAL_ENGINE_VERSION,
  type CommercialEngineInput,
  type CommercialResult,
  type RulesStageResult,
} from './types'
import type { CommercialSalesChannels } from '@/types/commercial-policy'

const DEFAULT_SALES_CHANNELS: CommercialSalesChannels = {
  retail: true,
  wholesale: false,
  distributor: false,
}

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
        merchandiseDiscountBase: 0,
        displaySubtotal: 0,
        runningTotal: 0,
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

  const accumulation = resolveAccumulationGates(
    salesChannel,
    salesChannels,
    policies.appliedPolicy
  )

  if (accumulation.stageGates.allowAdjustments) {
    buildAdjustmentTrace(base.adjustments, traceBuilder)
  } else if (base.adjustments > 0) {
    appendSkippedStageTrace(
      traceBuilder,
      'adjustment',
      'Personalização',
      'Canal ou política bloqueia acumulação de ajustes',
      { source: accumulation.source, policyId: accumulation.policyId }
    )
  }

  let runningTotal = base.displaySubtotal - policies.policyDiscount

  const subtotalAfterPolicy = Math.max(0, runningTotal)

  let autoRules: RulesStageResult = { ruleDiscount: 0, ruleIds: [] }
  if (accumulation.stageGates.allowAutoRules) {
    autoRules = applyAutoRules(
      input.commercialRules,
      policies.lines,
      subtotalAfterPolicy,
      traceBuilder
    )
    runningTotal = Math.max(0, runningTotal - autoRules.ruleDiscount)
  } else if (input.commercialRules.length > 0) {
    appendSkippedStageTrace(
      traceBuilder,
      'rule',
      'Promoções automáticas',
      'Canal ou política bloqueia acumulação de promoções',
      {
        source: accumulation.source,
        policyId: accumulation.policyId,
        salesChannel,
      }
    )
  }

  const subtotalAfterAuto = Math.max(0, subtotalAfterPolicy - autoRules.ruleDiscount)

  let manualRules: RulesStageResult = { ruleDiscount: 0, ruleIds: [] }
  if (accumulation.stageGates.allowManualRules) {
    manualRules = applyManualRules(
      input.commercialRules,
      policies.lines,
      subtotalAfterAuto,
      traceBuilder,
      input.couponCode
    )
    runningTotal = Math.max(0, runningTotal - manualRules.ruleDiscount)
  } else if (input.couponCode) {
    appendSkippedStageTrace(
      traceBuilder,
      'rule',
      'Cupom',
      'Canal ou política bloqueia acumulação de cupons',
      {
        source: accumulation.source,
        policyId: accumulation.policyId,
        couponCode: input.couponCode,
      }
    )
  }

  const ruleDiscount = autoRules.ruleDiscount + manualRules.ruleDiscount
  const ruleIds = [...autoRules.ruleIds, ...manualRules.ruleIds]
  const totalDiscount = policies.policyDiscount + ruleDiscount

  const freight = calculateFreight(
    traceBuilder,
    policies.lines.length > 0,
    accumulation.stageGates.allowFreight,
    accumulation
  )

  const total = Math.max(0, base.merchandiseSubtotal - totalDiscount)

  return {
    engineVersion: COMMERCIAL_ENGINE_VERSION,
    lines: policies.lines,
    subtotals: {
      merchandiseBase: base.merchandiseBase,
      merchandiseDiscountBase: policies.merchandiseDiscountBase,
      displaySubtotal: base.displaySubtotal,
      runningTotal,
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
