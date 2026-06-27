import type { AdminOnboardingState, OnboardingStepId } from '@/types/admin-onboarding'
import { createDefaultOnboardingState } from './defaults'

function uniqueSteps(steps: OnboardingStepId[]): OnboardingStepId[] {
  return [...new Set(steps)]
}

export function mergeOnboardingState(
  current: AdminOnboardingState,
  partial: Partial<AdminOnboardingState>
): AdminOnboardingState {
  const now = new Date().toISOString()
  const manual = partial.manuallyCompletedSteps
    ? uniqueSteps(partial.manuallyCompletedSteps)
    : current.manuallyCompletedSteps

  const merged: AdminOnboardingState = {
    ...current,
    ...partial,
    manuallyCompletedSteps: manual,
    updatedAt: now,
  }

  if (merged.tourCompleted && !merged.completedAt) {
    merged.completedAt = now
  }

  return merged
}

export function restartTourState(current: AdminOnboardingState): AdminOnboardingState {
  return mergeOnboardingState(current, {
    skipped: false,
    tourStarted: false,
    tourCompleted: false,
    currentStep: null,
  })
}

export function resetDeploymentState(): AdminOnboardingState {
  return createDefaultOnboardingState()
}

export function addManualStep(
  current: AdminOnboardingState,
  stepId: OnboardingStepId
): AdminOnboardingState {
  return mergeOnboardingState(current, {
    manuallyCompletedSteps: uniqueSteps([...current.manuallyCompletedSteps, stepId]),
  })
}
