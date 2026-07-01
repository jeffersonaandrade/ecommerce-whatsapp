/**
 * Fail-closed: produção exige DATA_PROVIDER=supabase.
 * JSON mode permanece permitido em desenvolvimento (NODE_ENV !== 'production').
 */
export function isProductionNonSupabaseRuntime(): boolean {
  if (process.env.NODE_ENV !== 'production') return false
  const provider = process.env.DATA_PROVIDER?.trim().toLowerCase() ?? ''
  return provider !== 'supabase'
}

export function productionNonSupabaseMessage(context?: string): string {
  const suffix = context ? ` (${context})` : ''
  return `Production requires DATA_PROVIDER=supabase${suffix}. JSON/dev provider is not allowed in production.`
}

/** Lança se produção estiver configurada sem Supabase. */
export function assertProductionSupabaseRuntime(context?: string): void {
  if (isProductionNonSupabaseRuntime()) {
    throw new Error(productionNonSupabaseMessage(context))
  }
}
