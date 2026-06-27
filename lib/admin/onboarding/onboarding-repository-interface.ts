import type { AdminOnboardingState } from '@/types/admin-onboarding'

export interface OnboardingRepository {
  get(): Promise<AdminOnboardingState>
  update(partial: Partial<AdminOnboardingState>): Promise<AdminOnboardingState>
}
