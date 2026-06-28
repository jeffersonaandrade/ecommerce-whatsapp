import { getDataProvider } from '@/lib/data/provider'
import { jsonCommercialRuleRepository } from './json-commercial-rule-repository'
import { supabaseCommercialRuleRepository } from './supabase-commercial-rule-repository'
import { CommercialRuleRepository } from './commercial-rule-repository'

export function getCommercialRuleRepository(): CommercialRuleRepository {
  return getDataProvider() === 'supabase'
    ? supabaseCommercialRuleRepository
    : jsonCommercialRuleRepository
}
