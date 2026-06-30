import { CommercialPolicy } from '@/types/commercial-policy'

export function isPolicyStorefrontEligible(
  policy: CommercialPolicy,
  now: Date = new Date()
): boolean {
  if (!policy.enabled) return false

  if (policy.startsAt && new Date(policy.startsAt) > now) return false
  if (policy.endsAt && new Date(policy.endsAt) < now) return false

  return true
}
