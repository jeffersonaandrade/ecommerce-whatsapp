function supabaseHost(): string | null {
  const raw = process.env.NEXT_PUBLIC_SUPABASE_URL?.trim()
  if (!raw) return null
  try {
    return new URL(raw).host
  } catch {
    return null
  }
}

export function buildContentSecurityPolicy(): string {
  const supabase = supabaseHost()
  // CSV/import pode apontar products.images para qualquer CDN https (ex.: Shopify).
  // Sem https: em img-src, <img>/next/image unoptimized quebram no admin (CSP).
  const imgHosts = ["'self'", 'data:', 'blob:', 'https:']
  const connectHosts = ["'self'"]
  if (supabase) {
    imgHosts.push(`https://${supabase}`)
    connectHosts.push(`https://${supabase}`, `wss://${supabase}`)
  }

  return [
    "default-src 'self'",
    "script-src 'self' 'unsafe-inline' 'unsafe-eval'",
    "style-src 'self' 'unsafe-inline'",
    `img-src ${imgHosts.join(' ')}`,
    `connect-src ${connectHosts.join(' ')}`,
    "font-src 'self'",
    "frame-ancestors 'none'",
    "base-uri 'self'",
    "form-action 'self'",
    "object-src 'none'",
  ].join('; ')
}

export const SECURITY_HEADERS: ReadonlyArray<{ key: string; value: string }> = [
  { key: 'X-Content-Type-Options', value: 'nosniff' },
  { key: 'Referrer-Policy', value: 'strict-origin-when-cross-origin' },
  { key: 'X-Frame-Options', value: 'DENY' },
  {
    key: 'Permissions-Policy',
    value: 'camera=(), microphone=(), geolocation=(), payment=(), usb=()',
  },
  { key: 'Content-Security-Policy', value: buildContentSecurityPolicy() },
]
