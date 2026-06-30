import { PolicySalesChannel } from '@/types/commercial-policy'

export const POLICY_CHANNEL_LABELS: Record<PolicySalesChannel, string> = {
  retail: 'Varejo',
  wholesale: 'Atacado',
  distributor: 'Distribuidor',
}

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
  discountValue: number
): string {
  const qtyPart = minQty && minQty > 1 ? `${minQty}+ peças → ` : ''
  const discountPart =
    discountType === 'discount_percent'
      ? `${discountValue}%`
      : `R$ ${discountValue.toFixed(2)}`
  return `${qtyPart}${discountPart}`
}
