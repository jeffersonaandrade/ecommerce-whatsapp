import { describe, expect, it } from 'vitest'
import {
  FULL_TOUR_STEPS,
  INTRO_TOUR_STEPS,
  findStepIndex,
  getNextStepId,
  getStepById,
  getTourStepsForPhase,
  resolveApplicableSteps,
  resolveNavigationAfterStep,
} from './tour-steps'

describe('tour-steps', () => {
  it('returns full tour for phase 3', () => {
    expect(getTourStepsForPhase(3)).toHaveLength(8)
    expect(getTourStepsForPhase(2)).toHaveLength(8)
  })

  it('has unique step ids', () => {
    const ids = FULL_TOUR_STEPS.map((step) => step.id)
    expect(new Set(ids).size).toBe(ids.length)
  })

  it('intro flow uses nav-loja before settings', () => {
    expect(findStepIndex('nav-loja', INTRO_TOUR_STEPS)).toBe(1)
    expect(getNextStepId('nav-loja', INTRO_TOUR_STEPS)).toBe('settings-form')
    expect(getStepById('nav-loja')?.target).toBe('[data-onboarding="nav-loja"]')
  })

  it('resolves step by id', () => {
    expect(getStepById('settings-form')?.route).toBe('/admin/settings')
    expect(getStepById('missing' as 'settings-form')).toBeUndefined()
  })

  it('uses only data-onboarding targets', () => {
    for (const step of FULL_TOUR_STEPS) {
      expect(step.target).toMatch(/^\[data-onboarding="[^"]+"\]$/)
    }
  })

  it('includes import and media in applicable steps', () => {
    const applicable = resolveApplicableSteps(FULL_TOUR_STEPS)
    expect(applicable.map((s) => s.id)).toContain('import-wizard')
    expect(applicable.map((s) => s.id)).toContain('media-center')
    expect(applicable).toHaveLength(8)
  })

  it('navigates from settings to import', () => {
    const target = resolveNavigationAfterStep('settings-form')
    expect(target).toEqual({ path: '/admin/import', resumeStepId: 'import-wizard' })
  })

  it('navigates from import to media', () => {
    const target = resolveNavigationAfterStep('import-wizard')
    expect(target).toEqual({ path: '/admin/products/media', resumeStepId: 'media-center' })
  })
})
