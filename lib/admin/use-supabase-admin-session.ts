'use client'

import { useEffect, useState } from 'react'
import { createBrowserSupabaseClient } from '@/lib/supabase/browser'
import { isSupabaseAuthMode } from '@/lib/auth/mode'

export function useSupabaseAdminSession() {
  const [isLoggedIn, setIsLoggedIn] = useState(false)

  useEffect(() => {
    if (!isSupabaseAuthMode()) return

    const supabase = createBrowserSupabaseClient()

    supabase.auth.getSession().then(({ data }) => {
      setIsLoggedIn(Boolean(data.session))
    })

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setIsLoggedIn(Boolean(session))
    })

    return () => subscription.unsubscribe()
  }, [])

  async function logout() {
    if (!isSupabaseAuthMode()) return
    const supabase = createBrowserSupabaseClient()
    await supabase.auth.signOut()
    window.location.href = '/admin/login'
  }

  return { isLoggedIn, logout }
}
