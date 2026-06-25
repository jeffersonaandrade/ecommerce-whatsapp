'use client'

import { useState } from 'react'
import Link from 'next/link'
import { getButtonClassName } from '@/components/ui/button'

export function AdminLoginForm() {
  const [toast, setToast] = useState<string | null>(null)

  function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setToast('Autenticação será disponibilizada na próxima versão.')
    window.setTimeout(() => setToast(null), 4000)
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
            href="/admin"
            className="text-sm text-mute transition-colors hover:text-ink"
          >
            ← Admin
          </Link>
          <h1 className="mt-4 font-display text-2xl font-bold uppercase tracking-tight text-ink">
            Entrar
          </h1>
          <p className="mt-2 text-sm text-mute">
            Área administrativa — autenticação em breve.
          </p>

          <form onSubmit={handleSubmit} className="mt-8 space-y-4">
            <label className="block text-sm font-medium text-ink">
              E-mail
              <input
                type="email"
                name="email"
                autoComplete="username"
                className="mt-1 w-full rounded-lg border border-hairline px-3 py-2 text-sm"
                placeholder="admin@loja.com"
              />
            </label>
            <label className="block text-sm font-medium text-ink">
              Senha
              <input
                type="password"
                name="password"
                autoComplete="current-password"
                className="mt-1 w-full rounded-lg border border-hairline px-3 py-2 text-sm"
                placeholder="••••••••"
              />
            </label>
            <button type="submit" className={getButtonClassName('default', 'md', 'w-full')}>
              Entrar
            </button>
          </form>
        </div>
      </div>
    </div>
  )
}
