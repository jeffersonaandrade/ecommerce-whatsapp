import { MediaFilter, MediaStatus } from './types'

export const PRODUCTS_PUBLIC_PATH = '/storage/v1/object/public/products/'

export function normalizeSupabaseBaseUrl(supabaseUrl?: string): string {
  const base = (supabaseUrl ?? process.env.NEXT_PUBLIC_SUPABASE_URL ?? '').trim()
  return base.replace(/\/$/, '')
}

export function isProductsStorageUrl(url: string, supabaseUrl?: string): boolean {
  const base = normalizeSupabaseBaseUrl(supabaseUrl)
  if (!base) return false

  try {
    const parsed = new URL(url.trim())
    const expected = new URL(base)
    return (
      parsed.protocol === 'https:' &&
      parsed.host === expected.host &&
      parsed.pathname.includes(PRODUCTS_PUBLIC_PATH)
    )
  } catch {
    return false
  }
}

export function extractProductsStoragePath(url: string, supabaseUrl?: string): string | null {
  if (!isProductsStorageUrl(url, supabaseUrl)) return null
  try {
    const parsed = new URL(url.trim())
    const idx = parsed.pathname.indexOf(PRODUCTS_PUBLIC_PATH)
    if (idx === -1) return null
    return decodeURIComponent(parsed.pathname.slice(idx + PRODUCTS_PUBLIC_PATH.length))
  } catch {
    return null
  }
}

export function classifyProductImagesInitial(
  images: string[],
  supabaseUrl?: string
): MediaStatus {
  const urls = images.map((u) => u.trim()).filter(Boolean)
  if (!urls.length) return 'empty'

  const hasExternal = urls.some((url) => !isProductsStorageUrl(url, supabaseUrl))
  if (hasExternal) return 'external'
  return 'storage'
}

export function resolveMediaStatus(
  initial: MediaStatus,
  images: string[],
  probe: Record<string, boolean | undefined>,
  probing: boolean
): MediaStatus {
  if (initial === 'empty') return 'empty'
  if (probing) return 'checking'

  const urls = images.filter(Boolean)
  const results = urls.map((url) => probe[url])

  if (results.some((ok) => ok === false)) return 'broken'
  if (results.some((ok) => ok === undefined)) return 'checking'
  return initial
}

export function matchesMediaFilter(status: MediaStatus, filter: MediaFilter): boolean {
  if (filter === 'all') return true
  return status === filter
}
