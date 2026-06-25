import { describe, expect, it } from 'vitest'
import {
  BRANDING_ICON_FILES,
  brandingAssetUrl,
  brandingAssetUrlVersioned,
  resolveBrandingFilename,
} from './branding-url'

describe('brandingAssetUrl', () => {
  it('builds api path for filename', () => {
    expect(brandingAssetUrl('favicon-32.png')).toBe('/api/branding/favicon-32.png')
  })

  it('returns null for empty filename', () => {
    expect(brandingAssetUrl(null)).toBeNull()
    expect(brandingAssetUrl(undefined)).toBeNull()
  })

  it('appends cache-bust query when version is provided', () => {
    expect(brandingAssetUrl('favicon-32.png', '2026-06-24T12:00:00.000Z')).toBe(
      '/api/branding/favicon-32.png?v=2026-06-24T12%3A00%3A00.000Z'
    )
  })

  it('versioned helper always includes query', () => {
    expect(brandingAssetUrlVersioned(BRANDING_ICON_FILES.favicon32, 'abc')).toBe(
      '/api/branding/favicon-32.png?v=abc'
    )
  })

  it('maps og-default.png to og-default.jpg', () => {
    expect(resolveBrandingFilename('og-default.png')).toBe('og-default.jpg')
  })
})
