import { describe, expect, it } from 'vitest'
import { createDefaultOnboardingState } from './defaults'
import {
  addManualStep,
  mergeOnboardingState,
  resetDeploymentState,
  restartTourState,
} from './merge-onboarding-state'

describe('mergeOnboardingState', () => {
  it('merges skip flag and sets updatedAt', () => {
    const current = createDefaultOnboardingState()
    const merged = mergeOnboardingState(current, { skipped: true })
    expect(merged.skipped).toBe(true)
    expect(merged.updatedAt).toBeTruthy()
  })

  it('sets completedAt when tourCompleted becomes true', () => {
    const current = createDefaultOnboardingState()
    const merged = mergeOnboardingState(current, { tourCompleted: true })
    expect(merged.completedAt).toBeTruthy()
  })
})

describe('restartTourState', () => {
  it('resets tour flags but keeps manual progress', () => {
    const current = mergeOnboardingState(createDefaultOnboardingState(), {
      skipped: true,
      tourStarted: true,
      tourCompleted: true,
      currentStep: 'banner-desktop',
      manuallyCompletedSteps: ['review-storefront'],
    })

    const restarted = restartTourState(current)

    expect(restarted.skipped).toBe(false)
    expect(restarted.tourStarted).toBe(false)
    expect(restarted.tourCompleted).toBe(false)
    expect(restarted.currentStep).toBeNull()
    expect(restarted.manuallyCompletedSteps).toEqual(['review-storefront'])
  })
})

describe('resetDeploymentState', () => {
  it('returns fresh defaults', () => {
    const dirty = mergeOnboardingState(createDefaultOnboardingState(), {
      skipped: true,
      tourStarted: true,
      manuallyCompletedSteps: ['first-sale', 'review-storefront'],
    })

    const reset = resetDeploymentState()

    expect(reset).toEqual(createDefaultOnboardingState())
    expect(reset.manuallyCompletedSteps).toEqual([])
    expect(dirty.skipped).toBe(true)
  })
})

describe('addManualStep', () => {
  it('deduplicates manual steps', () => {
    const once = addManualStep(createDefaultOnboardingState(), 'review-storefront')
    const twice = addManualStep(once, 'review-storefront')
    expect(twice.manuallyCompletedSteps).toEqual(['review-storefront'])
  })
})
