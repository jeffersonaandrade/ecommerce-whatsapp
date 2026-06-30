export type PolicySalesChannel = 'retail' | 'wholesale' | 'distributor'

export type EligibilityStrategy = 'cart_total' | 'per_product'

export type PolicyConditions = {
  minQty?: number
  /** Padrão: cart_total (qty total do carrinho) */
  eligibilityStrategy?: EligibilityStrategy
}

export type PolicyStageGates = {
  allowAutoRules: boolean
  allowManualRules: boolean
  allowOtherPolicies: boolean
  allowAdjustments: boolean
  allowFreight: boolean
}

/** Override parcial de gates — policy vencedora sobrescreve defaults do canal */
export type PolicyAccumulation = Partial<PolicyStageGates>

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
  /** Gates de acumulação — sobrescreve defaults do canal quando policy vence */
  accumulation?: PolicyAccumulation
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

export type SalesChannelConfig = {
  enabled: boolean
  stageGates?: Partial<PolicyStageGates>
}

export type CommercialSalesChannels = {
  retail: boolean | SalesChannelConfig
  wholesale: boolean | SalesChannelConfig
  distributor: boolean | SalesChannelConfig
}

export type CommercialPolicyInput = {
  name: string
  channel: PolicySalesChannel
  priority: number
  enabled: boolean
  isDefault: boolean
  conditions: PolicyConditions
  actions: PolicyAction[]
  accumulation?: PolicyAccumulation
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
