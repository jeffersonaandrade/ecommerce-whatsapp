import { CommercialRule } from '@/types/commercial-rule'

export function isWithinDateRange(
  rule: CommercialRule,
  now: Date = new Date()
): boolean {
  if (rule.startsAt) {
    const start = new Date(rule.startsAt)
    if (now < start) return false
  }
  if (rule.endsAt) {
    const end = new Date(rule.endsAt)
    if (now > end) return false
  }
  return true
}

export function isRuleStorefrontEligible(
  rule: CommercialRule,
  now: Date = new Date()
): boolean {
  if (rule.kind !== 'promotion') return false
  if (rule.status !== 'active' && rule.status !== 'scheduled') return false
  return isWithinDateRange(rule, now)
}
