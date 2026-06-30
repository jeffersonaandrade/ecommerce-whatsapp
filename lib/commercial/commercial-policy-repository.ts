import {
  CommercialPolicy,
  CommercialPolicyInput,
  CommercialPolicyUpdateInput,
  CommercialProductPolicyOverride,
  CommercialProductPolicyOverrideInput,
} from '@/types/commercial-policy'

export type CommercialPolicyRepository = {
  getAll(): Promise<CommercialPolicy[]>
  getStorefrontEligible(channel: CommercialPolicy['channel']): Promise<CommercialPolicy[]>
  getById(id: string): Promise<CommercialPolicy | undefined>
  create(input: CommercialPolicyInput): Promise<CommercialPolicy>
  update(id: string, input: CommercialPolicyUpdateInput): Promise<CommercialPolicy>
  getOverridesForProducts(productIds: string[]): Promise<CommercialProductPolicyOverride[]>
  createOverride(
    input: CommercialProductPolicyOverrideInput
  ): Promise<CommercialProductPolicyOverride>
  deleteOverride(id: string): Promise<void>
}
