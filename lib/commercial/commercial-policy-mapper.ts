import type {
  CommercialPolicy,
  CommercialPolicyInput,
  CommercialProductPolicyOverride,
  CommercialProductPolicyOverrideInput,
  CommercialSalesChannels,
  PolicyAction,
  PolicyConditions,
} from '@/types/commercial-policy'

export type CommercialPolicyRow = {
  id: string
  name: string
  channel: string
  priority: number
  enabled: boolean
  is_default: boolean
  conditions: PolicyConditions
  actions: PolicyAction[]
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

function parseSalesChannels(value: unknown): CommercialSalesChannels {
  const raw = value as Partial<CommercialSalesChannels> | null | undefined
  return {
    retail: raw?.retail ?? true,
    wholesale: raw?.wholesale ?? false,
    distributor: raw?.distributor ?? false,
  }
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
