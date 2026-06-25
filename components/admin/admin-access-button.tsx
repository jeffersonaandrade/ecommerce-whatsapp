'use client'

import Link from 'next/link'
import { getButtonClassName } from '@/components/ui/button'
import { useDemoAdminSession } from '@/lib/admin/use-demo-admin-session'
import { useSupabaseAdminSession } from '@/lib/admin/use-supabase-admin-session'
import { isSupabaseAuthMode } from '@/lib/auth/mode'

export function AdminAccessButton() {
  const supabaseAuth = isSupabaseAuthMode()
  const demo = useDemoAdminSession()
  const supabase = useSupabaseAdminSession()

  const isLoggedIn = supabaseAuth ? supabase.isLoggedIn : demo.isDemoLoggedIn
  const logout = supabaseAuth ? supabase.logout : demo.logout

  if (isLoggedIn) {
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
