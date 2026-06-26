export const OG_IMAGE_FILENAME = 'og-default.jpg'

/** Legacy alias — canonical file is og-default.jpg */
export const OG_IMAGE_LEGACY_ALIAS = 'og-default.png'

const BRANDING_ALIASES: Record<string, string> = {
  [OG_IMAGE_LEGACY_ALIAS]: OG_IMAGE_FILENAME,
}

const ALLOWED_BRANDING_PATH = /^[a-zA-Z0-9._/-]+$/

export function resolveBrandingFilename(filename: string): string | null {
  const normalized = filename.replace(/\\/g, '/').trim()
  if (!normalized || normalized.includes('..') || normalized.includes('\0')) {
    return null
  }
  if (!ALLOWED_BRANDING_PATH.test(normalized)) {
    return null
  }

  if (!normalized.includes('/')) {
    const base = normalized
    return BRANDING_ALIASES[base] ?? base
  }

  if (
    normalized.startsWith('banners/') ||
    normalized.startsWith('categories/')
  ) {
    return normalized
  }

  return null
}

export function brandingAssetUrl(
  filename: string | null | undefined,
  version?: string | null
): string | null {
  if (!filename) return null
  const base = `/api/branding/${encodeURIComponent(filename)}`
  if (version) {
    return `${base}?v=${encodeURIComponent(version)}`
  }
  return base
}

export function brandingAssetUrlVersioned(
  filename: string,
  version: string
): string {
  return brandingAssetUrl(filename, version)!
}

export const BRANDING_ICON_FILES = {
  favicon16: 'favicon-16.png',
  favicon32: 'favicon-32.png',
  appleTouch: 'apple-touch-icon.png',
  android192: 'android-192.png',
  android512: 'android-512.png',
  og: OG_IMAGE_FILENAME,
} as const
