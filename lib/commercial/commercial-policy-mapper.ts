import type {
  CommercialPolicy,
  CommercialPolicyInput,
  CommercialProductPolicyOverride,
  CommercialProductPolicyOverrideInput,
  CommercialSalesChannels,
  PolicyAccumulation,
  PolicyAction,
  PolicyConditions,
  PolicyStageGates,
  SalesChannelConfig,
} from '@/types/commercial-policy'
import {
  defaultStageGatesForChannel,
  mergeStageGates,
} from '@/lib/commercial/engine/sales-channel-defaults'

export type CommercialPolicyRow = {
  id: string
  name: string
  channel: string
  priority: number
  enabled: boolean
  is_default: boolean
  conditions: PolicyConditions
  actions: PolicyAction[]
  accumulation?: PolicyAccumulation
  starts_at: string | null
  ends_at: string | null
  created_at: string
  updated_at: string
}

export type CommercialProductPolicyOverrideRow = {
  id: string
  product_id: string
  policy_id: string | null
  conditions: PolicyConditions
  actions: PolicyAction[]
  created_at: string
  updated_at: string
}

function parseChannelConfig(
  value: unknown,
  channel: keyof CommercialSalesChannels
): boolean | SalesChannelConfig {
  if (typeof value === 'boolean') return value
  if (value && typeof value === 'object') {
    const raw = value as Partial<SalesChannelConfig>
    return {
      enabled: raw.enabled ?? channel === 'retail',
      stageGates: raw.stageGates,
    }
  }
  return channel === 'retail'
}

function parseSalesChannels(value: unknown): CommercialSalesChannels {
  const raw = value as Record<string, unknown> | null | undefined
  return {
    retail: parseChannelConfig(raw?.retail, 'retail'),
    wholesale: parseChannelConfig(raw?.wholesale, 'wholesale'),
    distributor: parseChannelConfig(raw?.distributor, 'distributor'),
  }
}

export function serializeSalesChannels(
  channels: CommercialSalesChannels
): Record<string, boolean | SalesChannelConfig> {
  return { ...channels }
}

export function resolveSalesChannelStageGates(
  channels: CommercialSalesChannels,
  channel: keyof CommercialSalesChannels
): PolicyStageGates {
  const config = channels[channel]
  const defaults = defaultStageGatesForChannel(channel)
  if (typeof config === 'boolean') {
    return config ? defaults : { ...defaults, allowAutoRules: false, allowManualRules: false }
  }
  return mergeStageGates(defaults, config.stageGates)
}

export function rowToCommercialPolicy(row: CommercialPolicyRow): CommercialPolicy {
  return {
    id: row.id,
    name: row.name,
    channel: row.channel as CommercialPolicy['channel'],
    priority: row.priority,
    enabled: row.enabled,
    isDefault: row.is_default,
    conditions: row.conditions ?? {},
    actions: Array.isArray(row.actions) ? row.actions : [],
    accumulation: row.accumulation ?? undefined,
    startsAt: row.starts_at,
    endsAt: row.ends_at,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  }
}

export function inputToCommercialPolicyRow(
  id: string,
  input: CommercialPolicyInput,
  now: string
): CommercialPolicyRow {
  return {
    id,
    name: input.name,
    channel: input.channel,
    priority: input.priority,
    enabled: input.enabled,
    is_default: input.isDefault,
    conditions: input.conditions ?? {},
    actions: input.actions ?? [],
    accumulation: input.accumulation ?? {},
    starts_at: input.startsAt ?? null,
    ends_at: input.endsAt ?? null,
    created_at: now,
    updated_at: now,
  }
}

export function commercialPolicyToRow(policy: CommercialPolicy): CommercialPolicyRow {
  return {
    id: policy.id,
    name: policy.name,
    channel: policy.channel,
    priority: policy.priority,
    enabled: policy.enabled,
    is_default: policy.isDefault,
    conditions: policy.conditions,
    actions: policy.actions,
    accumulation: policy.accumulation ?? {},
    starts_at: policy.startsAt ?? null,
    ends_at: policy.endsAt ?? null,
    created_at: policy.createdAt,
    updated_at: policy.updatedAt,
  }
}

export function rowToProductPolicyOverride(
  row: CommercialProductPolicyOverrideRow
): CommercialProductPolicyOverride {
  return {
    id: row.id,
    productId: row.product_id,
    policyId: row.policy_id,
    conditions: row.conditions ?? {},
    actions: Array.isArray(row.actions) ? row.actions : [],
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  }
}

export function inputToProductPolicyOverrideRow(
  id: string,
  input: CommercialProductPolicyOverrideInput,
  now: string
): CommercialProductPolicyOverrideRow {
  return {
    id,
    product_id: input.productId,
    policy_id: input.policyId,
    conditions: input.conditions ?? {},
    actions: input.actions ?? [],
    created_at: now,
    updated_at: now,
  }
}

export { parseSalesChannels }
