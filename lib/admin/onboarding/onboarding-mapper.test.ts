import { describe, expect, it } from 'vitest'
import type { AdminOnboardingState } from '@/types/admin-onboarding'
import { createDefaultOnboardingState } from './defaults'
import { onboardingStateToJson, parseOnboardingState } from './onboarding-mapper'

describe('parseOnboardingState', () => {
  it('returns defaults for empty object', () => {
    expect(parseOnboardingState({})).toEqual(createDefaultOnboardingState())
  })

  it('returns defaults for invalid input', () => {
    expect(parseOnboardingState(null)).toEqual(createDefaultOnboardingState())
    expect(parseOnboardingState('invalid')).toEqual(createDefaultOnboardingState())
  })

  it('parses v1 state with manual steps', () => {
    const parsed = parseOnboardingState({
      version: 1,
      skipped: true,
      tourStarted: true,
      tourCompleted: false,
      currentStep: 'products',
      manuallyCompletedSteps: ['review-storefront', 'invalid-step', 'first-sale'],
      completedAt: null,
      updatedAt: '2026-06-24T12:00:00.000Z',
    })

    expect(parsed).toEqual({
      version: 1,
      skipped: true,
      tourStarted: true,
      tourCompleted: false,
      currentStep: 'products',
      manuallyCompletedSteps: ['review-storefront', 'first-sale'],
      completedAt: null,
      updatedAt: '2026-06-24T12:00:00.000Z',
    })
  })
})

describe('onboardingStateToJson', () => {
  it('round-trips through parse', () => {
    const state: AdminOnboardingState = {
      ...createDefaultOnboardingState(),
      skipped: true,
      manuallyCompletedSteps: ['first-sale'],
      updatedAt: '2026-06-24T12:00:00.000Z',
    }
    const json = onboardingStateToJson(state)
    const parsed = parseOnboardingState(json)
    expect(parsed.skipped).toBe(true)
    expect(parsed.manuallyCompletedSteps).toEqual(['first-sale'])
    expect(parsed.updatedAt).toBe('2026-06-24T12:00:00.000Z')
  })
})
