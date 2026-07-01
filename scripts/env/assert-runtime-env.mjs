/**
 * Espelho ESM de lib/env/assert-runtime-env.ts para scripts Node (.mjs).
 * Manter regras sincronizadas com o módulo TypeScript.
 */

export function isProductionNonSupabaseRuntime(env = process.env) {
  if (env.NODE_ENV !== 'production') return false
  const provider = env.DATA_PROVIDER?.trim().toLowerCase() ?? ''
  return provider !== 'supabase'
}

export function productionNonSupabaseMessage(context) {
  const suffix = context ? ` (${context})` : ''
  return `Production requires DATA_PROVIDER=supabase${suffix}. JSON/dev provider is not allowed in production.`
}

export function assertProductionSupabaseRuntime(context, env = process.env) {
  if (isProductionNonSupabaseRuntime(env)) {
    throw new Error(productionNonSupabaseMessage(context))
  }
}
