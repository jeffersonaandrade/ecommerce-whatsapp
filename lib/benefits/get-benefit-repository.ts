import { getDataProvider } from '@/lib/data/provider'
import { BenefitRepository } from './benefit-repository'

export function getBenefitRepository(): BenefitRepository {
  if (getDataProvider() !== 'supabase') {
    throw new Error('Benefícios editáveis requerem DATA_PROVIDER=supabase.')
  }
  const { supabaseBenefitRepository } = require('./supabase-benefit-repository')
  return supabaseBenefitRepository
}
