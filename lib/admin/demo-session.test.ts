import { beforeEach, describe, expect, it, vi } from 'vitest'
import {
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
  beforeEach(() => {
    vi.stubGlobal('window', {} as Window)
    vi.stubGlobal('localStorage', createLocalStorageMock())
    localStorage.clear()
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
})
