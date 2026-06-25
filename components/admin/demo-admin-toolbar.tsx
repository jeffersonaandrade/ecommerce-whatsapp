'use client'

import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useDemoAdminSession } from '@/lib/admin/use-demo-admin-session'

export function DemoAdminToolbar() {
  const router = useRouter()
  const { isDemoLoggedIn, logout } = useDemoAdminSession()

  function handleLogout() {
    logout()
    router.push('/admin/login')
  }

  if (isDemoLoggedIn) {
    return (
      <button
        type="button"
        onClick={handleLogout}
        className="text-sm text-gray-400 transition-colors hover:text-white"
      >
        Sair
      </button>
    )
  }

  return (
    <div className="flex items-center gap-3 text-sm text-gray-500">
      <span>Ambiente de demonstração</span>
      <Link href="/admin/login" className="text-gray-400 transition-colors hover:text-white">
        Entrar
      </Link>
    </div>
  )
}
