'use client'

import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useDemoAdminSession } from '@/lib/admin/use-demo-admin-session'
import { useSupabaseAdminSession } from '@/lib/admin/use-supabase-admin-session'
import { isSupabaseAuthMode } from '@/lib/auth/mode'

export function DemoAdminToolbar() {
  const router = useRouter()
  const demo = useDemoAdminSession()
  const supabase = useSupabaseAdminSession()
  const supabaseMode = isSupabaseAuthMode()

  async function handleLogout() {
    if (supabaseMode) {
      await supabase.logout()
      return
    }
    demo.logout()
    router.push('/admin/login')
  }

  const isLoggedIn = supabaseMode ? supabase.isLoggedIn : demo.isDemoLoggedIn

  if (isLoggedIn) {
    return (
      <button
        type="button"
        onClick={() => void handleLogout()}
        className="text-sm text-gray-400 transition-colors hover:text-white"
      >
        Sair
      </button>
    )
  }

  return (
    <div className="flex items-center gap-3 text-sm text-gray-500">
      <span>{supabaseMode ? 'Admin' : 'Ambiente de demonstração'}</span>
      <Link href="/admin/login" className="text-gray-400 transition-colors hover:text-white">
        Entrar
      </Link>
    </div>
  )
}
