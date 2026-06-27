import 'server-only'

import type { AdminOnboardingState } from '@/types/admin-onboarding'
import { mergeOnboardingState } from './merge-onboarding-state'
import { OnboardingRepository } from './onboarding-repository-interface'
import { loadOnboardingFromDisk, persistOnboarding } from './onboarding-storage'

export const jsonOnboardingRepository: OnboardingRepository = {
  async get(): Promise<AdminOnboardingState> {
    return loadOnboardingFromDisk()
  },

  async update(partial: Partial<AdminOnboardingState>): Promise<AdminOnboardingState> {
    const current = loadOnboardingFromDisk()
    const next = mergeOnboardingState(current, partial)
    persistOnboarding(next)
    return next
  },
}
