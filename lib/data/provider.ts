import { hasPublicSupabaseKey } from '@/lib/supabase/env'

export type DataProvider = 'json' | 'supabase'

export function getDataProvider(): DataProvider {
  const value = process.env.DATA_PROVIDER?.trim().toLowerCase()
  if (value === 'supabase') return 'supabase'
  return 'json'
}

export function isSupabaseConfigured(): boolean {
  return Boolean(process.env.NEXT_PUBLIC_SUPABASE_URL?.trim() && hasPublicSupabaseKey())
}

export function assertSupabaseEnv(): void {
  if (!process.env.NEXT_PUBLIC_SUPABASE_URL?.trim()) {
    throw new Error('NEXT_PUBLIC_SUPABASE_URL is required when DATA_PROVIDER=supabase')
  }
  if (!hasPublicSupabaseKey()) {
    throw new Error(
      'NEXT_PUBLIC_SUPABASE_ANON_KEY or NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY is required when DATA_PROVIDER=supabase'
    )
  }
}
