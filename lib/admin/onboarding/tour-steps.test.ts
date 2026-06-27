import { describe, expect, it } from 'vitest'
import {
  PHASE_2_TOUR_STEPS,
  findStepIndex,
  getNextStepId,
  getStepById,
  getTourStepsForPhase,
} from './tour-steps'

describe('tour-steps', () => {
  it('returns phase 2 steps', () => {
    expect(getTourStepsForPhase(2)).toHaveLength(3)
    expect(getTourStepsForPhase(3)).toHaveLength(0)
  })

  it('has unique step ids', () => {
    const ids = PHASE_2_TOUR_STEPS.map((step) => step.id)
    expect(new Set(ids).size).toBe(ids.length)
  })

  it('resolves step by id', () => {
    expect(getStepById('settings-form')?.route).toBe('/admin/settings')
    expect(getStepById('missing' as 'settings-form')).toBeUndefined()
  })

  it('finds step index by id', () => {
    expect(findStepIndex('nav-produtos')).toBe(1)
    expect(findStepIndex('settings-form')).toBe(2)
  })

  it('nav-produtos navigates to settings with resume stepId', () => {
    const step = getStepById('nav-produtos')
    expect(step?.navigateOnNext).toBe('/admin/settings')
    expect(step?.resumeStepId).toBe('settings-form')
    expect(getNextStepId('nav-produtos')).toBe('settings-form')
  })

  it('uses only data-onboarding targets', () => {
    for (const step of PHASE_2_TOUR_STEPS) {
      expect(step.target).toMatch(/^\[data-onboarding="[^"]+"\]$/)
    }
  })
})
