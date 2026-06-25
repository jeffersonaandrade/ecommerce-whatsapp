'use client'

import Link from 'next/link'
import { getButtonClassName } from '@/components/ui/button'
import { useDemoAdminSession } from '@/lib/admin/use-demo-admin-session'

export function AdminAccessButton() {
  const { isDemoLoggedIn, logout } = useDemoAdminSession()

  if (isDemoLoggedIn) {
    return (
      <div className="flex items-center gap-2 sm:gap-3">
        <Link href="/admin" className={getButtonClassName('outline', 'sm')}>
          Admin
        </Link>
        <button
          type="button"
          onClick={logout}
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
