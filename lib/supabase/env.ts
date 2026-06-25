export function getSupabaseUrl(): string {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL?.trim()
  if (!url) throw new Error('Missing NEXT_PUBLIC_SUPABASE_URL')
  return url
}

function readPublicSupabaseKey(): string | undefined {
  return (
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY?.trim() ||
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY?.trim()
  )
}

export function hasPublicSupabaseKey(): boolean {
  return Boolean(readPublicSupabaseKey())
}

export function getSupabaseAnonKey(): string {
  const key = readPublicSupabaseKey()
  if (!key) {
    throw new Error(
      'Missing NEXT_PUBLIC_SUPABASE_ANON_KEY or NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY'
    )
  }
  return key
}

export function getSupabaseServiceRoleKey(): string {
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY?.trim()
  if (!key) throw new Error('Missing SUPABASE_SERVICE_ROLE_KEY')
  return key
}

export function getBrandingPublicUrl(path: string): string {
  const base = getSupabaseUrl()
  const safe = path.replace(/^\/+/, '')
  return `${base}/storage/v1/object/public/branding/${safe}`
}

export function getProductsPublicUrl(path: string): string {
  const base = getSupabaseUrl()
  const safe = path.replace(/^\/+/, '')
  return `${base}/storage/v1/object/public/products/${safe}`
}
