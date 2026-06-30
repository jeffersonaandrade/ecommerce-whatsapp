export type PolicySalesChannel = 'retail' | 'wholesale' | 'distributor'

export type PolicyConditions = {
  minQty?: number
}

export type PolicyActionType =
  | 'discount_percent'
  | 'discount_fixed'
  | 'exclude_from_policy'

export type PolicyAction = {
  type: PolicyActionType
  value?: number
}

export type CommercialPolicy = {
  id: string
  name: string
  channel: PolicySalesChannel
  priority: number
  enabled: boolean
  isDefault: boolean
  conditions: PolicyConditions
  actions: PolicyAction[]
  startsAt?: string | null
  endsAt?: string | null
  createdAt: string
  updatedAt: string
}

export type CommercialProductPolicyOverride = {
  id: string
  productId: string
  policyId: string | null
  conditions: PolicyConditions
  actions: PolicyAction[]
  createdAt: string
  updatedAt: string
}

export type CommercialSalesChannels = {
  retail: boolean
  wholesale: boolean
  distributor: boolean
}

export type CommercialPolicyInput = {
  name: string
  channel: PolicySalesChannel
  priority: number
  enabled: boolean
  isDefault: boolean
  conditions: PolicyConditions
  actions: PolicyAction[]
  startsAt?: string | null
  endsAt?: string | null
}

export type CommercialPolicyUpdateInput = Partial<CommercialPolicyInput>

export type CommercialProductPolicyOverrideInput = {
  productId: string
  policyId: string | null
  conditions?: PolicyConditions
  actions: PolicyAction[]
}
