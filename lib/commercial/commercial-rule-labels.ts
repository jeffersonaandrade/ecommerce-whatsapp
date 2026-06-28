import { CommercialRuleStatus } from '@/types/commercial-rule'

export const COMMERCIAL_RULE_STATUS_LABELS: Record<CommercialRuleStatus, string> = {
  draft: 'Rascunho',
  scheduled: 'Agendada',
  active: 'Ativa',
  expired: 'Expirada',
  archived: 'Arquivada',
}

export function commercialRuleStatusClass(status: CommercialRuleStatus): string {
  switch (status) {
    case 'active':
      return 'bg-green-50 text-green-800'
    case 'scheduled':
      return 'bg-blue-50 text-blue-800'
    case 'expired':
      return 'bg-amber-50 text-amber-800'
    case 'archived':
      return 'bg-soft-cloud text-mute'
    default:
      return 'bg-soft-cloud text-ink'
  }
}
