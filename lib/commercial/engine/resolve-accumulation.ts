import type { CommercialPolicy, PolicyStageGates } from '@/types/commercial-policy'
import type { SalesChannel } from './types'
import type { CommercialSalesChannels } from '@/types/commercial-policy'
import { mergeStageGates, resolveChannelStageGates } from './sales-channel-defaults'

export type ResolvedAccumulation = {
  stageGates: PolicyStageGates
  source: 'channel' | 'policy'
  policyId?: string
}

export function resolveAccumulationGates(
  salesChannel: SalesChannel,
  salesChannels: CommercialSalesChannels | undefined,
  appliedPolicy?: CommercialPolicy
): ResolvedAccumulation {
  const channelGates = resolveChannelStageGates(salesChannels, salesChannel)

  if (appliedPolicy?.accumulation && Object.keys(appliedPolicy.accumulation).length > 0) {
    return {
      stageGates: mergeStageGates(channelGates, appliedPolicy.accumulation),
      source: 'policy',
      policyId: appliedPolicy.id,
    }
  }

  return {
    stageGates: channelGates,
    source: 'channel',
  }
}
