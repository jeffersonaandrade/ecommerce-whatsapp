import {
  CommercialRule,
  CommercialRuleInput,
  CommercialRuleUpdateInput,
} from '@/types/commercial-rule'

export interface CommercialRuleRepository {
  getAll(): Promise<CommercialRule[]>
  getStorefrontEligible(): Promise<CommercialRule[]>
  getById(id: string): Promise<CommercialRule | undefined>
  create(input: CommercialRuleInput): Promise<CommercialRule>
  update(id: string, input: CommercialRuleUpdateInput): Promise<CommercialRule>
}
