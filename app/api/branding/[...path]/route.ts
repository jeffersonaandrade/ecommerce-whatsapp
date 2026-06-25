import { readBrandingFile } from '@/lib/store/generate-branding'

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
  const { path: segments } = await params
  const filename = segments.join('/')
  const buffer = readBrandingFile(filename)

  if (!buffer) {
    return new Response('Not found', { status: 404 })
  }

  const ext = filename.slice(filename.lastIndexOf('.')).toLowerCase()
  const contentType = MIME[ext] ?? 'application/octet-stream'

  return new Response(new Uint8Array(buffer), {
    headers: {
      'Content-Type': contentType,
      'Cache-Control': 'public, max-age=3600',
    },
  })
}
