import { BenefitItem, BenefitItemInput } from '@/types/benefit-item'

export interface BenefitRepository {
  getAll(): Promise<BenefitItem[]>
  getActive(): Promise<BenefitItem[]>
  getById(id: string): Promise<BenefitItem | undefined>
  count(): Promise<number>
  create(input: BenefitItemInput): Promise<BenefitItem>
  update(id: string, input: Partial<BenefitItemInput>): Promise<BenefitItem>
  delete(id: string): Promise<void>
}
