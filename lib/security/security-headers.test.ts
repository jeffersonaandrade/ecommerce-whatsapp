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

  it('CSP permite self e https genérico (URLs externas de produto)', () => {
    const csp = buildContentSecurityPolicy()
    expect(csp).toContain("default-src 'self'")
    expect(csp).toMatch(/img-src[^;]*\bhttps:/)
    expect(csp).toContain("frame-ancestors 'none'")
  })
})
