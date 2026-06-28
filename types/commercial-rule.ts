export type CommercialRuleKind = 'promotion'

export type CommercialRuleStatus =
  | 'draft'
  | 'scheduled'
  | 'active'
  | 'expired'
  | 'archived'

export type CommercialRuleType = 'quantity_discount'

export type CommercialRuleAppliesTo = 'all_products'

export type QuantityDiscountConfig = {
  requiredQuantity: number
  discountAmount: number
}

export type CommercialRuleConfig = QuantityDiscountConfig

export type CommercialRule = {
  id: string
  kind: CommercialRuleKind
  name: string
  type: CommercialRuleType
  status: CommercialRuleStatus
  priority: number
  stackable: false
  appliesTo: CommercialRuleAppliesTo
  startsAt?: string | null
  endsAt?: string | null
  config: CommercialRuleConfig
  createdAt: string
  updatedAt: string
}

export type CommercialRuleInput = {
  name: string
  type: CommercialRuleType
  status: CommercialRuleStatus
  priority: number
  appliesTo?: CommercialRuleAppliesTo
  startsAt?: string | null
  endsAt?: string | null
  config: CommercialRuleConfig
}

export type CommercialRuleUpdateInput = Partial<CommercialRuleInput>
