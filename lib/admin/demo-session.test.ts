import { beforeEach, describe, expect, it, vi } from 'vitest'
import {
  DEMO_ADMIN_SESSION_EVENT,
  DEMO_ADMIN_SESSION_KEY,
  clearDemoAdminFlag,
  hasDemoAdminSession,
  setDemoAdminFlag,
} from '@/lib/admin/demo-session'

function createLocalStorageMock() {
  let store: Record<string, string> = {}

  return {
    getItem: (key: string) => (key in store ? store[key] : null),
    setItem: (key: string, value: string) => {
      store[key] = value
    },
    removeItem: (key: string) => {
      delete store[key]
    },
    clear: () => {
      store = {}
    },
  }
}

describe('demo-session', () => {
  const dispatchEvent = vi.fn()

  beforeEach(() => {
    vi.stubGlobal('localStorage', createLocalStorageMock())
    localStorage.clear()
    dispatchEvent.mockClear()
    vi.stubGlobal('window', { dispatchEvent } as unknown as Window)
  })

  it('setDemoAdminFlag grava flag no localStorage', () => {
    setDemoAdminFlag()
    expect(localStorage.getItem(DEMO_ADMIN_SESSION_KEY)).toBe('1')
  })

  it('clearDemoAdminFlag remove a flag', () => {
    setDemoAdminFlag()
    clearDemoAdminFlag()
    expect(localStorage.getItem(DEMO_ADMIN_SESSION_KEY)).toBeNull()
  })

  it('hasDemoAdminSession retorna true quando flag existe', () => {
    expect(hasDemoAdminSession()).toBe(false)
    setDemoAdminFlag()
    expect(hasDemoAdminSession()).toBe(true)
  })

  it('setDemoAdminFlag dispara evento de mudança', () => {
    setDemoAdminFlag()
    expect(dispatchEvent).toHaveBeenCalledWith(expect.objectContaining({ type: DEMO_ADMIN_SESSION_EVENT }))
  })

  it('clearDemoAdminFlag dispara evento de mudança', () => {
    setDemoAdminFlag()
    dispatchEvent.mockClear()
    clearDemoAdminFlag()
    expect(dispatchEvent).toHaveBeenCalledWith(expect.objectContaining({ type: DEMO_ADMIN_SESSION_EVENT }))
  })
})
