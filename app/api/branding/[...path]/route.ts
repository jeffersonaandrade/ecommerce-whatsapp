import { readBrandingFile } from '@/lib/store/branding-storage'
import { resolveBrandingFilename } from '@/lib/store/branding-url'
import { BRANDING_CACHE_CONTROL } from '@/lib/store/build-metadata'

const MIME: Record<string, string> = {
  '.webp': 'image/webp',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
}

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ path: string[] }> }
) {
  try {
    const { path: segments } = await params
    if (segments.some((segment) => segment === '..' || segment.includes('\0'))) {
      return new Response('Not found', { status: 404 })
    }

    const filename = segments.join('/')
    const resolved = resolveBrandingFilename(filename)
    if (!resolved) {
      return new Response('Not found', { status: 404 })
    }
    const buffer = await readBrandingFile(resolved)

    if (!buffer) {
      return new Response('Not found', { status: 404 })
    }

    const ext = resolved.slice(resolved.lastIndexOf('.')).toLowerCase()
    const contentType = MIME[ext] ?? 'application/octet-stream'

    return new Response(new Uint8Array(buffer), {
      headers: {
        'Content-Type': contentType,
        'Cache-Control': BRANDING_CACHE_CONTROL,
      },
    })
  } catch (error) {
    console.error('[api/branding]', error)
    return new Response('Internal server error', { status: 500 })
  }
}
