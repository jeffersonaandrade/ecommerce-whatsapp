import 'server-only'

import { getCommercialRuleRepository } from './get-commercial-rule-repository'
import { CommercialRule } from '@/types/commercial-rule'

export async function getStorefrontCommercialRules(): Promise<CommercialRule[]> {
  const repo = getCommercialRuleRepository()
  return repo.getStorefrontEligible()
}

export async function getAllCommercialRulesAdmin(): Promise<CommercialRule[]> {
  const repo = getCommercialRuleRepository()
  return repo.getAll()
}

export async function getCommercialRuleById(
  id: string
): Promise<CommercialRule | undefined> {
  const repo = getCommercialRuleRepository()
  return repo.getById(id)
}
