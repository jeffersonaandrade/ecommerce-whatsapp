import 'server-only'

import {
  CommercialPolicy,
  CommercialProductPolicyOverride,
  PolicySalesChannel,
} from '@/types/commercial-policy'
import { getCommercialPolicyRepository } from './get-commercial-policy-repository'

export async function getStorefrontCommercialPolicies(
  channel: PolicySalesChannel = 'retail'
): Promise<CommercialPolicy[]> {
  const repo = getCommercialPolicyRepository()
  return repo.getStorefrontEligible(channel)
}

export async function getAllCommercialPoliciesAdmin(): Promise<CommercialPolicy[]> {
  const repo = getCommercialPolicyRepository()
  return repo.getAll()
}

export async function getCommercialPolicyById(
  id: string
): Promise<CommercialPolicy | undefined> {
  const repo = getCommercialPolicyRepository()
  return repo.getById(id)
}

export async function getPolicyOverridesForProducts(
  productIds: string[]
): Promise<CommercialProductPolicyOverride[]> {
  const repo = getCommercialPolicyRepository()
  return repo.getOverridesForProducts(productIds)
}
