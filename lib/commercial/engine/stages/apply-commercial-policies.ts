import type {
  CommercialPolicy,
  CommercialProductPolicyOverride,
  CommercialSalesChannels,
} from '@/types/commercial-policy'
import { isChannelEnabled } from '../sales-channel-defaults'
import {
  evaluateCommercialPolicies,
  type PolicyEvaluationContext,
} from '../evaluate-policy'
import type { BasePricesStageResult, PoliciesStageResult, SalesChannel } from '../types'
import type { TraceBuilder } from '../trace-builder'

export type ApplyPoliciesInput = {
  salesChannel: SalesChannel
  salesChannels: CommercialSalesChannels
  policies: CommercialPolicy[]
  overrides: CommercialProductPolicyOverride[]
}

export function applyCommercialPolicies(
  base: BasePricesStageResult,
  input: ApplyPoliciesInput,
  trace: TraceBuilder
): PoliciesStageResult {
  const channelEnabled = isChannelEnabled(input.salesChannels, input.salesChannel)

  const ctx: PolicyEvaluationContext = {
    salesChannel: input.salesChannel,
    channelEnabled,
    policies: input.policies,
    overrides: input.overrides,
  }

  const result = evaluateCommercialPolicies(base.lines, ctx)

  if (result.policyDiscount > 0 && result.appliedPolicy) {
    trace.append({
      stage: 'policy',
      policyId: result.appliedPolicy.id,
      label: result.appliedPolicy.name,
      amount: -result.policyDiscount,
      status: 'applied',
      source: 'policy',
      metadata: {
        channel: result.appliedPolicy.channel,
        minQty: result.appliedPolicy.conditions.minQty,
        eligibilityStrategy:
          result.appliedPolicy.conditions.eligibilityStrategy ?? 'cart_total',
        merchandiseDiscountBase: result.merchandiseDiscountBase,
      },
    })
  }

  return {
    policyDiscount: result.policyDiscount,
    policyIds: result.policyIds,
    appliedPolicy: result.appliedPolicy,
    merchandiseDiscountBase: result.merchandiseDiscountBase,
    lines: result.lines,
  }
}
