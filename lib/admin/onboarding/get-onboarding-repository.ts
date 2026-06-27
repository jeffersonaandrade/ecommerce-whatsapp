import 'server-only'

import { getDataProvider } from '@/lib/data/provider'
import { jsonOnboardingRepository } from './json-onboarding-repository'
import { OnboardingRepository } from './onboarding-repository-interface'
import { supabaseOnboardingRepository } from './supabase-onboarding-repository'

export function getOnboardingRepository(): OnboardingRepository {
  return getDataProvider() === 'supabase'
    ? supabaseOnboardingRepository
    : jsonOnboardingRepository
}

export async function getOnboardingState() {
  return getOnboardingRepository().get()
}

export async function updateOnboardingState(partial: Parameters<OnboardingRepository['update']>[0]) {
  return getOnboardingRepository().update(partial)
}
