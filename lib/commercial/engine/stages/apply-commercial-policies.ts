import type {
  CommercialPolicy,
  CommercialProductPolicyOverride,
  CommercialSalesChannels,
} from '@/types/commercial-policy'
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
  const channelEnabled = input.salesChannels[input.salesChannel] ?? false

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
      metadata: {
        channel: result.appliedPolicy.channel,
        minQty: result.appliedPolicy.conditions.minQty,
      },
    })
  }

  return {
    policyDiscount: result.policyDiscount,
    policyIds: result.policyIds,
  }
}
