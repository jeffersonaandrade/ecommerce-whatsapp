export type CommercialRuleKind = 'promotion'

export type CommercialRuleTrigger = 'auto' | 'manual'

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

export type CommercialRuleConditions = {
  minSubtotal?: number
  minQty?: number
  categoryIds?: string[]
  productIds?: string[]
}

export type CommercialActionType = 'discount_percent' | 'discount_fixed'

export type CommercialAction = {
  type: CommercialActionType
  value: number
}

export type CommercialRule = {
  id: string
  kind: CommercialRuleKind
  name: string
  trigger: CommercialRuleTrigger
  code?: string | null
  type: CommercialRuleType
  status: CommercialRuleStatus
  priority: number
  stackable: false
  appliesTo: CommercialRuleAppliesTo
  startsAt?: string | null
  endsAt?: string | null
  config: CommercialRuleConfig
  conditions: CommercialRuleConditions
  actions: CommercialAction[]
  usageLimit?: number | null
  usageCount: number
  createdAt: string
  updatedAt: string
}

export type CommercialRuleInput = {
  name: string
  trigger?: CommercialRuleTrigger
  code?: string | null
  type?: CommercialRuleType
  status: CommercialRuleStatus
  priority: number
  appliesTo?: CommercialRuleAppliesTo
  startsAt?: string | null
  endsAt?: string | null
  config?: CommercialRuleConfig
  conditions?: CommercialRuleConditions
  actions?: CommercialAction[]
  usageLimit?: number | null
}

export type CommercialRuleUpdateInput = Partial<CommercialRuleInput> & {
  usageCount?: number
}

export type CouponRuleInput = {
  name: string
  code: string
  status: CommercialRuleStatus
  priority?: number
  startsAt?: string | null
  endsAt?: string | null
  conditions?: CommercialRuleConditions
  actions: CommercialAction[]
  usageLimit?: number | null
}
