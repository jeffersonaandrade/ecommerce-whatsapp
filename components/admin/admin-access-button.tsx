'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { getButtonClassName } from '@/components/ui/button'
import {
  clearDemoAdminFlag,
  hasDemoAdminSession,
} from '@/lib/admin/demo-session'

export function AdminAccessButton() {
  const [isDemoLoggedIn, setIsDemoLoggedIn] = useState(false)

  useEffect(() => {
    setIsDemoLoggedIn(hasDemoAdminSession())
  }, [])

  function handleLogout() {
    clearDemoAdminFlag()
    setIsDemoLoggedIn(false)
  }

  if (isDemoLoggedIn) {
    return (
      <div className="flex items-center gap-2 sm:gap-3">
        <Link href="/admin" className={getButtonClassName('outline', 'sm')}>
          Admin
        </Link>
        <button
          type="button"
          onClick={handleLogout}
          className="text-sm font-medium text-mute transition-colors hover:text-ink"
        >
          Sair
        </button>
      </div>
    )
  }

  return (
    <Link href="/admin/login" className={getButtonClassName('outline', 'sm')}>
      Entrar
    </Link>
  )
}
