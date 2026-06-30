import type { AppliedCommercialRule, PricedCartLine } from '@/types/cart-pricing'
import type { CommercialRule } from '@/types/commercial-rule'
import type { PersonalizationSettings } from '@/types/personalization-settings'
import type { CartItem, Product } from '@/types/product'

/** Versão do algoritmo — incrementar quando pipeline ou ADRs mudarem */
export const COMMERCIAL_ENGINE_VERSION = 1

export type SalesChannel = 'retail' | 'wholesale' | 'distributor'

export type CommercialTraceStage =
  | 'base'
  | 'policy'
  | 'rule'
  | 'freight'
  | 'adjustment'
  | 'error'

export type CommercialTraceEntry = {
  stage: CommercialTraceStage
  sequence: number
  ruleId?: string
  policyId?: string
  label: string
  amount: number
  metadata?: Record<string, unknown>
}

export type CommercialTrace = CommercialTraceEntry[]

export type CommercialError = {
  code: string
  message: string
}

/** V1: mesmo shape de PricedCartLine */
export type PricedLine = PricedCartLine

export type CommercialEngineInput = {
  items: CartItem[]
  getProductById: (id: string) => Product | undefined
  personalizationSettings: PersonalizationSettings
  commercialRules: CommercialRule[]
  salesChannel?: SalesChannel
  couponCode?: string
}

export type CommercialResult = {
  engineVersion: typeof COMMERCIAL_ENGINE_VERSION
  lines: PricedLine[]
  subtotals: {
    merchandiseBase: number
    policyDiscount: number
    ruleDiscount: number
    freight: number | null
    adjustments: number
  }
  discounts: {
    total: number
  }
  total: number
  applied: {
    policyIds: string[]
    ruleIds: string[]
    couponCode?: string
    appliedRule?: AppliedCommercialRule
  }
  trace: CommercialTrace
  errors: CommercialError[]
}

export type BasePricesStageResult = {
  lines: PricedLine[]
  merchandiseBase: number
  adjustments: number
  merchandiseSubtotal: number
}

export type PoliciesStageResult = {
  policyDiscount: number
  policyIds: string[]
}

export type RulesStageResult = {
  ruleDiscount: number
  ruleIds: string[]
  appliedRule?: AppliedCommercialRule
}

export type FreightStageResult = {
  freight: number | null
}
