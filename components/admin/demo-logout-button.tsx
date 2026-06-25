'use client'

import { useRouter } from 'next/navigation'
import { clearDemoAdminFlag } from '@/lib/admin/demo-session'

export function DemoLogoutButton() {
  const router = useRouter()

  function handleLogout() {
    clearDemoAdminFlag()
    router.push('/admin/login')
  }

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
