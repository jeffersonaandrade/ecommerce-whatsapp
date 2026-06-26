import { describe, expect, it } from 'vitest'
import { createDefaultStoreSettings } from './settings-defaults'
import { buildRootMetadata } from './build-metadata'
import { BRANDING_ICON_FILES } from './branding-url'

describe('buildRootMetadata', () => {
  it('includes versioned favicon and og urls when logo exists', () => {
    const settings = {
      ...createDefaultStoreSettings(),
      logoPath: 'logo.webp',
      ogImagePath: BRANDING_ICON_FILES.og,
      updatedAt: '2026-06-24T22:00:00.000Z',
    }

    const metadata = buildRootMetadata(settings)
    const icons = metadata.icons as {
      icon: Array<{ url: string }>
      apple: Array<{ url: string }>
      other: Array<{ url: string }>
    }

    expect(icons.icon[0].url).toContain('favicon-32.png?v=2026-06-24T22%3A00%3A00.000Z')
    expect(icons.icon[1].url).toContain('favicon-16.png?v=')
    expect(icons.apple[0].url).toContain('apple-touch-icon.png?v=')
    expect(icons.other[0].url).toContain('android-192.png?v=')
    expect(icons.other[1].url).toContain('android-512.png?v=')

    const ogImages = metadata.openGraph?.images as Array<{ url: string }>
    expect(ogImages[0].url).toContain('og-default.jpg?v=2026-06-24T22%3A00%3A00.000Z')
  })

  it('omits custom icons when logo is not configured', () => {
    const settings = createDefaultStoreSettings()
    const metadata = buildRootMetadata(settings)
    expect(metadata.icons).toBeUndefined()
  })
})
