import type { AdminOnboardingState } from '@/types/admin-onboarding'

export const ONBOARDING_STATE_VERSION = 1 as const

export function createDefaultOnboardingState(): AdminOnboardingState {
  return {
    version: ONBOARDING_STATE_VERSION,
    skipped: false,
    tourStarted: false,
    tourCompleted: false,
    currentStep: null,
    manuallyCompletedSteps: [],
    completedAt: null,
    updatedAt: null,
  }
}
