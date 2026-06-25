export function isSupabaseAuthMode(): boolean {
  return process.env.NEXT_PUBLIC_DATA_PROVIDER === 'supabase'
}
