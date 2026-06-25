'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { useRouter, useSearchParams } from 'next/navigation'
import { getButtonClassName } from '@/components/ui/button'
import {
  DEMO_ADMIN_CREDENTIALS,
  setDemoAdminFlag,
} from '@/lib/admin/demo-session'
import { isSupabaseAuthMode } from '@/lib/auth/mode'
import { createBrowserSupabaseClient } from '@/lib/supabase/browser'

export function AdminLoginForm() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const supabaseAuth = isSupabaseAuthMode()
  const [toast, setToast] = useState<string | null>(null)
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    if (searchParams.get('error') === 'unauthorized') {
      setToast('Acesso negado. Esta conta não tem permissão de administrador.')
    }
  }, [searchParams])

  function fillDemoCredentials() {
    if (supabaseAuth) return
    setEmail(DEMO_ADMIN_CREDENTIALS.email)
    setPassword(DEMO_ADMIN_CREDENTIALS.password)
  }

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setLoading(true)

    if (supabaseAuth) {
      try {
        const supabase = createBrowserSupabaseClient()
        const { error } = await supabase.auth.signInWithPassword({ email, password })
        if (error) {
          setToast(error.message)
          setLoading(false)
          return
        }
        setToast('Acesso liberado.')
        window.setTimeout(() => {
          setToast(null)
          router.push('/admin')
          router.refresh()
        }, 800)
      } catch {
        setToast('Falha ao entrar. Tente novamente.')
        setLoading(false)
      }
      return
    }

    setDemoAdminFlag()
    setToast('Acesso liberado.')
    window.setTimeout(() => {
      setToast(null)
      router.push('/admin')
    }, 1500)
    setLoading(false)
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
          <p className="mt-2 text-sm text-mute">
            {supabaseAuth ? 'Acesso administrativo' : 'Ambiente de demonstração'}
          </p>

          <form onSubmit={handleSubmit} className="mt-8 space-y-4">
            <label className="block text-sm font-medium text-ink">
              E-mail
              <input
                type="email"
                name="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                autoComplete="username"
                required
                className="mt-1 w-full rounded-lg border border-hairline px-3 py-2 text-sm"
                placeholder={supabaseAuth ? 'admin@loja.com' : 'admin@demo.com'}
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
                required
                className="mt-1 w-full rounded-lg border border-hairline px-3 py-2 text-sm"
                placeholder="••••••••"
              />
            </label>
            {!supabaseAuth && (
              <button
                type="button"
                onClick={fillDemoCredentials}
                className={getButtonClassName('outline', 'md', 'w-full')}
              >
                Usar credenciais de demonstração
              </button>
            )}
            <button
              type="submit"
              disabled={loading}
              className={getButtonClassName('default', 'md', 'w-full')}
            >
              {loading ? 'Entrando...' : 'Entrar'}
            </button>
          </form>
        </div>
      </div>
    </div>
  )
}
