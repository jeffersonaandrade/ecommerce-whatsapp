import { PolicySalesChannel, EligibilityStrategy } from '@/types/commercial-policy'

export const POLICY_CHANNEL_LABELS: Record<PolicySalesChannel, string> = {
  retail: 'Varejo',
  wholesale: 'Atacado',
  distributor: 'Distribuidor',
}

export const ELIGIBILITY_STRATEGY_LABELS: Record<EligibilityStrategy, string> = {
  cart_total: 'Quantidade total do carrinho',
  per_product: 'Quantidade por produto',
}

export const STAGE_GATE_LABELS = {
  allowAutoRules: 'Permitir promoções automáticas',
  allowManualRules: 'Permitir cupons',
  allowOtherPolicies: 'Permitir outras políticas',
  allowAdjustments: 'Permitir personalização/ajustes',
  allowFreight: 'Permitir frete',
} as const

export function policyChannelClass(channel: PolicySalesChannel): string {
  switch (channel) {
    case 'wholesale':
      return 'bg-blue-50 text-blue-800'
    case 'distributor':
      return 'bg-purple-50 text-purple-800'
    default:
      return 'bg-soft-cloud text-ink'
  }
}

export function formatPolicySummary(
  minQty: number | undefined,
  discountType: 'discount_percent' | 'discount_fixed',
  discountValue: number,
  eligibilityStrategy?: EligibilityStrategy
): string {
  const strategy =
    eligibilityStrategy === 'per_product' ? 'por produto' : 'carrinho'
  const qtyPart =
    minQty && minQty > 1 ? `${minQty}+ (${strategy}) → ` : ''
  const discountPart =
    discountType === 'discount_percent'
      ? `${discountValue}%`
      : `R$ ${discountValue.toFixed(2)}`
  return `${qtyPart}${discountPart}`
}
