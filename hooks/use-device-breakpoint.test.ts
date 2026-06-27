/**
 * @vitest-environment jsdom
 */
import { describe, expect, it, vi, beforeEach, afterEach } from 'vitest'
import { renderHook, act } from '@testing-library/react'
import { DEVICE_BREAKPOINT_QUERY, useDeviceBreakpoint } from './use-device-breakpoint'

function createMatchMedia(matches: boolean) {
  return vi.fn().mockImplementation((query: string) => ({
    matches: query === DEVICE_BREAKPOINT_QUERY ? matches : false,
    media: query,
    onchange: null,
    addEventListener: vi.fn(),
    removeEventListener: vi.fn(),
    dispatchEvent: vi.fn(),
  }))
}

describe('useDeviceBreakpoint', () => {
  const originalMatchMedia = window.matchMedia

  beforeEach(() => {
    window.matchMedia = createMatchMedia(false)
  })

  afterEach(() => {
    window.matchMedia = originalMatchMedia
  })

  it('returns isMobile false on desktop viewport after hydrate', () => {
    const { result } = renderHook(() => useDeviceBreakpoint())
    expect(result.current.isReady).toBe(true)
    expect(result.current.isMobile).toBe(false)
  })

  it('returns isMobile true when matchMedia matches', () => {
    window.matchMedia = createMatchMedia(true)
    const { result } = renderHook(() => useDeviceBreakpoint())
    expect(result.current.isMobile).toBe(true)
  })

  it('updates when media query changes', () => {
    let listener: (() => void) | null = null
    window.matchMedia = vi.fn().mockImplementation((query: string) => ({
      matches: false,
      media: query,
      addEventListener: (_: string, cb: () => void) => {
        listener = cb
      },
      removeEventListener: vi.fn(),
    }))

    const { result } = renderHook(() => useDeviceBreakpoint())
    expect(result.current.isMobile).toBe(false)

    window.matchMedia = createMatchMedia(true)
    act(() => {
      listener?.()
    })

    expect(result.current.isMobile).toBe(true)
  })
})
