import { readBrandingFile } from '@/lib/store/branding-storage'
import { BRANDING_CACHE_CONTROL } from '@/lib/store/build-metadata'
import { getStoreSettings } from '@/lib/store/settings-repository'

export const size = { width: 32, height: 32 }
export const contentType = 'image/png'

export default async function Icon() {
  const settings = await getStoreSettings()
  const buffer = settings.logoPath ? await readBrandingFile('favicon-32.png') : null

  if (buffer) {
    return new Response(new Uint8Array(buffer), {
      headers: {
        'Content-Type': 'image/png',
        'Cache-Control': BRANDING_CACHE_CONTROL,
      },
    })
  }

  const letter = settings.storeName.charAt(0).toUpperCase()
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 32 32"><rect width="32" height="32" fill="#111"/><text x="16" y="22" text-anchor="middle" fill="#fff" font-size="16" font-family="system-ui,sans-serif" font-weight="700">${letter}</text></svg>`
  return new Response(svg, {
    headers: {
      'Content-Type': 'image/svg+xml',
      'Cache-Control': BRANDING_CACHE_CONTROL,
    },
  })
}
