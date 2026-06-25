import { createBrowserClient } from '@supabase/ssr'

export function createBrowserSupabaseClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
  if (!url || !key) {
    throw new Error('Supabase browser client requires NEXT_PUBLIC_SUPABASE_URL and ANON_KEY')
  }
  return createBrowserClient(url, key)
}

export function isSupabaseAuthEnabled(): boolean {
  return (
    process.env.NEXT_PUBLIC_DATA_PROVIDER === 'supabase' ||
    process.env.NEXT_PUBLIC_SUPABASE_URL !== undefined
  ) && Boolean(process.env.NEXT_PUBLIC_SUPABASE_URL)
}
