'use client'

import type { AdminOnboardingState } from '@/types/admin-onboarding'
import { useAdminOnboardingContext } from '@/components/admin/onboarding/admin-onboarding-provider'

export function useAdminOnboarding() {
  return useAdminOnboardingContext()
}
