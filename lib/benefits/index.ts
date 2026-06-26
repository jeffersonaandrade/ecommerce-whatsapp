import 'server-only'

import { getDataProvider } from '@/lib/data/provider'
import { BenefitItem } from '@/types/benefit-item'
import { getBenefitRepository } from './get-benefit-repository'

export async function getActiveBenefitItems(): Promise<BenefitItem[]> {
  if (getDataProvider() !== 'supabase') return []
  try {
    const repo = getBenefitRepository()
    return await repo.getActive()
  } catch {
    return []
  }
}

export async function getAllBenefitItems(): Promise<BenefitItem[]> {
  if (getDataProvider() !== 'supabase') return []
  const repo = getBenefitRepository()
  return repo.getAll()
}

export async function getBenefitItemById(id: string): Promise<BenefitItem | undefined> {
  if (getDataProvider() !== 'supabase') return undefined
  const repo = getBenefitRepository()
  return repo.getById(id)
}
