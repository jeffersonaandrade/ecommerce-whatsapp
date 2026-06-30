import type { PoliciesStageResult } from '../types'

/** Fase 1: noop — policies de canal entram na Fase 2 */
export function applyCommercialPolicies(): PoliciesStageResult {
  return {
    policyDiscount: 0,
    policyIds: [],
  }
}
