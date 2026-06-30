import type {
  PolicySalesChannel,
  PolicyStageGates,
  SalesChannelConfig,
  CommercialSalesChannels,
} from '@/types/commercial-policy'

export const DEFAULT_RETAIL_STAGE_GATES: PolicyStageGates = {
  allowAutoRules: true,
  allowManualRules: true,
  allowOtherPolicies: false,
  allowAdjustments: true,
  allowFreight: true,
}

export const DEFAULT_WHOLESALE_STAGE_GATES: PolicyStageGates = {
  allowAutoRules: false,
  allowManualRules: true,
  allowOtherPolicies: false,
  allowAdjustments: true,
  allowFreight: true,
}

export const DEFAULT_DISTRIBUTOR_STAGE_GATES: PolicyStageGates = {
  allowAutoRules: false,
  allowManualRules: false,
  allowOtherPolicies: false,
  allowAdjustments: true,
  allowFreight: false,
}

const CHANNEL_DEFAULT_GATES: Record<PolicySalesChannel, PolicyStageGates> = {
  retail: DEFAULT_RETAIL_STAGE_GATES,
  wholesale: DEFAULT_WHOLESALE_STAGE_GATES,
  distributor: DEFAULT_DISTRIBUTOR_STAGE_GATES,
}

export function defaultStageGatesForChannel(channel: PolicySalesChannel): PolicyStageGates {
  return { ...CHANNEL_DEFAULT_GATES[channel] }
}

export function isChannelEnabled(
  channels: CommercialSalesChannels | undefined,
  channel: PolicySalesChannel
): boolean {
  if (!channels) return channel === 'retail'
  const config = channels[channel]
  if (typeof config === 'boolean') return config
  return config?.enabled ?? channel === 'retail'
}

export function resolveChannelStageGates(
  channels: CommercialSalesChannels | undefined,
  channel: PolicySalesChannel
): PolicyStageGates {
  const fallback = defaultStageGatesForChannel(channel)
  if (!channels) return fallback

  const config = channels[channel]
  if (typeof config === 'boolean') {
    return config ? fallback : { ...fallback, allowAutoRules: false, allowManualRules: false }
  }

  const cfg = config as SalesChannelConfig
  return {
    ...fallback,
    ...cfg.stageGates,
  }
}

export function mergeStageGates(
  channelGates: PolicyStageGates,
  policyGates?: Partial<PolicyStageGates>
): PolicyStageGates {
  if (!policyGates) return channelGates
  return {
    allowAutoRules: policyGates.allowAutoRules ?? channelGates.allowAutoRules,
    allowManualRules: policyGates.allowManualRules ?? channelGates.allowManualRules,
    allowOtherPolicies: policyGates.allowOtherPolicies ?? channelGates.allowOtherPolicies,
    allowAdjustments: policyGates.allowAdjustments ?? channelGates.allowAdjustments,
    allowFreight: policyGates.allowFreight ?? channelGates.allowFreight,
  }
}
