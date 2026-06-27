// @vitest-environment jsdom

import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import {
  DEFAULT_WAIT_FOR_TARGET,
  TOUR_RESUME_STORAGE_KEY,
  clearTourResume,
  readTourResume,
  waitForTarget,
  writeTourResume,
} from './tour-controller'

describe('tour-controller storage', () => {
  beforeEach(() => {
    sessionStorage.clear()
  })

  afterEach(() => {
    sessionStorage.clear()
  })

  it('writes and reads resume payload by stepId', () => {
    writeTourResume({ phase: 3, stepId: 'settings-form' })
    expect(readTourResume()).toEqual({ phase: 3, stepId: 'settings-form' })
  })

  it('clears resume payload', () => {
    writeTourResume({ phase: 3, stepId: 'settings-form' })
    clearTourResume()
    expect(sessionStorage.getItem(TOUR_RESUME_STORAGE_KEY)).toBeNull()
  })

  it('rejects invalid resume payload', () => {
    sessionStorage.setItem(TOUR_RESUME_STORAGE_KEY, JSON.stringify({ phase: 3, stepId: 'invalid' }))
    expect(readTourResume()).toBeNull()
  })
})

describe('waitForTarget', () => {
  beforeEach(() => {
    document.body.innerHTML = ''
  })

  it('returns element when present immediately', async () => {
    const target = document.createElement('div')
    target.setAttribute('data-onboarding', 'settings-form')
    document.body.appendChild(target)

    const found = await waitForTarget('[data-onboarding="settings-form"]', {
      timeout: 500,
      interval: 50,
    })
    expect(found).toBe(target)
  })

  it('returns null after timeout when missing', async () => {
    vi.useFakeTimers()
    const promise = waitForTarget('[data-onboarding="missing"]', {
      timeout: 300,
      interval: 100,
    })
    await vi.advanceTimersByTimeAsync(350)
    await expect(promise).resolves.toBeNull()
    vi.useRealTimers()
  })

  it('exports default wait options', () => {
    expect(DEFAULT_WAIT_FOR_TARGET.timeout).toBe(2500)
    expect(DEFAULT_WAIT_FOR_TARGET.interval).toBe(100)
  })
})

describe('createTourController resume failure', () => {
  beforeEach(() => {
    sessionStorage.clear()
    document.body.innerHTML = ''
  })

  it('calls onResumeFailed when target is missing', async () => {
    const { createTourController } = await import('./tour-controller')
    const onResumeFailed = vi.fn()
    const controller = createTourController({
      reducedMotion: true,
      migrationToolsEnabled: false,
      onNavigate: vi.fn(),
      onTourActiveChange: vi.fn(),
      onResumeFailed,
      onTourComplete: vi.fn(),
    })

    await controller.resume('settings-form')
    expect(onResumeFailed).toHaveBeenCalledWith('settings-form')
  })
})
