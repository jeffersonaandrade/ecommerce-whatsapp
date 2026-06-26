import { describe, expect, it } from 'vitest'
import { buildContentSecurityPolicy, SECURITY_HEADERS } from './security-headers'

describe('security headers', () => {
  it('inclui headers básicos', () => {
    const keys = SECURITY_HEADERS.map((h) => h.key)
    expect(keys).toContain('X-Content-Type-Options')
    expect(keys).toContain('Referrer-Policy')
    expect(keys).toContain('X-Frame-Options')
    expect(keys).toContain('Permissions-Policy')
    expect(keys).toContain('Content-Security-Policy')
  })

  it('CSP permite self e unsplash', () => {
    const csp = buildContentSecurityPolicy()
    expect(csp).toContain("default-src 'self'")
    expect(csp).toContain('https://images.unsplash.com')
    expect(csp).toContain("frame-ancestors 'none'")
  })
})
