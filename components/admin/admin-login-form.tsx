'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { getButtonClassName } from '@/components/ui/button'
import {
  DEMO_ADMIN_CREDENTIALS,
  setDemoAdminFlag,
} from '@/lib/admin/demo-session'

export function AdminLoginForm() {
  const router = useRouter()
  const [toast, setToast] = useState<string | null>(null)
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')

  function fillDemoCredentials() {
    setEmail(DEMO_ADMIN_CREDENTIALS.email)
    setPassword(DEMO_ADMIN_CREDENTIALS.password)
  }

  function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setDemoAdminFlag()
    setToast('Acesso liberado.')
    window.setTimeout(() => {
      setToast(null)
      router.push('/admin')
    }, 1500)
  }

  return (
    <div className="flex flex-1 items-center justify-center px-4 py-16">
      <div className="relative w-full max-w-md">
        {toast && (
          <div
            role="status"
            className="absolute -top-16 left-0 right-0 rounded-lg border border-hairline bg-canvas px-4 py-3 text-sm text-ink shadow-sm"
          >
            {toast}
          </div>
        )}

        <div className="rounded-xl border border-hairline bg-canvas p-8 shadow-sm">
          <Link
            href="/"
            className="text-sm text-mute transition-colors hover:text-ink"
          >
            ← Voltar ao site
          </Link>
          <h1 className="mt-4 font-display text-2xl font-bold uppercase tracking-tight text-ink">
            Entrar
          </h1>
          <p className="mt-2 text-sm text-mute">Ambiente de demonstração</p>

          <form onSubmit={handleSubmit} className="mt-8 space-y-4">
            <label className="block text-sm font-medium text-ink">
              E-mail
              <input
                type="email"
                name="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                autoComplete="username"
                className="mt-1 w-full rounded-lg border border-hairline px-3 py-2 text-sm"
                placeholder="admin@demo.com"
              />
            </label>
            <label className="block text-sm font-medium text-ink">
              Senha
              <input
                type="password"
                name="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                autoComplete="current-password"
                className="mt-1 w-full rounded-lg border border-hairline px-3 py-2 text-sm"
                placeholder="••••••••"
              />
            </label>
            <button
              type="button"
              onClick={fillDemoCredentials}
              className={getButtonClassName('outline', 'md', 'w-full')}
            >
              Usar credenciais de demonstração
            </button>
            <button type="submit" className={getButtonClassName('default', 'md', 'w-full')}>
              Entrar
            </button>
          </form>
        </div>
      </div>
    </div>
  )
}
