import 'server-only'

import type { User } from '@supabase/supabase-js'
import { getDataProvider } from '@/lib/data/provider'
import { createServerSupabaseClient } from '@/lib/supabase/server'

export type RequireAdminResult =
  | { ok: true; user?: User }
  | { ok: false; error: string }

export async function requireAdmin(): Promise<RequireAdminResult> {
  if (getDataProvider() !== 'supabase') {
    return { ok: true }
  }

  const supabase = await createServerSupabaseClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    return { ok: false, error: 'Não autenticado' }
  }

  const role = user.app_metadata?.role
  if (role !== 'admin') {
    return { ok: false, error: 'Acesso negado' }
  }

  return { ok: true, user }
}
