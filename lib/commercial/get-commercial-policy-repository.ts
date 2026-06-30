import { getDataProvider } from '@/lib/data/provider'
import { jsonCommercialPolicyRepository } from './json-commercial-policy-repository'
import { supabaseCommercialPolicyRepository } from './supabase-commercial-policy-repository'
import { CommercialPolicyRepository } from './commercial-policy-repository'

export function getCommercialPolicyRepository(): CommercialPolicyRepository {
  return getDataProvider() === 'supabase'
    ? supabaseCommercialPolicyRepository
    : jsonCommercialPolicyRepository
}
