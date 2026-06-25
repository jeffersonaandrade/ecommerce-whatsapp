'use client'

import { useCallback, useEffect, useState } from 'react'
import {
  DEMO_ADMIN_SESSION_EVENT,
  clearDemoAdminFlag,
  hasDemoAdminSession,
} from '@/lib/admin/demo-session'

export function useDemoAdminSession() {
  const [isDemoLoggedIn, setIsDemoLoggedIn] = useState(false)

  useEffect(() => {
    function sync() {
      setIsDemoLoggedIn(hasDemoAdminSession())
    }

    sync()
    window.addEventListener(DEMO_ADMIN_SESSION_EVENT, sync)
    window.addEventListener('storage', sync)

    return () => {
      window.removeEventListener(DEMO_ADMIN_SESSION_EVENT, sync)
      window.removeEventListener('storage', sync)
    }
  }, [])

  const logout = useCallback(() => {
    clearDemoAdminFlag()
  }, [])

  return { isDemoLoggedIn, logout }
}
