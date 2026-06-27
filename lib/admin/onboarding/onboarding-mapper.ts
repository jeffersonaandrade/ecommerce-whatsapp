import type { AdminOnboardingState, OnboardingStepId } from '@/types/admin-onboarding'
import { ONBOARDING_STATE_VERSION, createDefaultOnboardingState } from './defaults'

const STEP_IDS: OnboardingStepId[] = [
  'store-settings',
  'products',
  'review-media',
  'categories',
  'banner-desktop',
  'banner-mobile',
  'review-storefront',
  'first-sale',
  'complete',
]

function isStepId(value: unknown): value is OnboardingStepId {
  return typeof value === 'string' && STEP_IDS.includes(value as OnboardingStepId)
}

export function parseOnboardingState(raw: unknown): AdminOnboardingState {
  const defaults = createDefaultOnboardingState()
  if (!raw || typeof raw !== 'object') return defaults

  const record = raw as Record<string, unknown>
  const manual = Array.isArray(record.manuallyCompletedSteps)
    ? record.manuallyCompletedSteps.filter(isStepId)
    : []

  return {
    version: ONBOARDING_STATE_VERSION,
    skipped: record.skipped === true,
    tourStarted: record.tourStarted === true,
    tourCompleted: record.tourCompleted === true,
    currentStep: isStepId(record.currentStep) ? record.currentStep : null,
    manuallyCompletedSteps: manual,
    completedAt: typeof record.completedAt === 'string' ? record.completedAt : null,
    updatedAt: typeof record.updatedAt === 'string' ? record.updatedAt : null,
  }
}

export function onboardingStateToJson(state: AdminOnboardingState): Record<string, unknown> {
  return {
    version: state.version,
    skipped: state.skipped,
    tourStarted: state.tourStarted,
    tourCompleted: state.tourCompleted,
    currentStep: state.currentStep,
    manuallyCompletedSteps: state.manuallyCompletedSteps,
    completedAt: state.completedAt,
    updatedAt: state.updatedAt,
  }
}
