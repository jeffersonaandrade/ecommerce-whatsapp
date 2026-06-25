import 'server-only'

import path from 'path'
import { generateSlug } from '@/lib/formatters'
import { getDataProvider } from '@/lib/data/provider'
import { createAdminClient } from '@/lib/supabase/admin'

const PRODUCTS_BUCKET = 'products'

const CONTENT_TYPES: Record<string, string> = {
  '.webp': 'image/webp',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
}

export function buildProductImageFilename(slug: string, ext: string): string {
  const normalizedExt = ext.replace(/^\./, '').toLowerCase()
  const safeExt = normalizedExt === 'jpeg' ? 'jpg' : normalizedExt
  const base = slug.trim() ? generateSlug(slug) || 'draft' : 'draft'
  const date = new Date().toISOString().slice(0, 10).replace(/-/g, '')
  const random = Math.random().toString(36).slice(2, 8)
  return `${base}-${date}-${random}.${safeExt}`
}

export async function writeProductImage(filename: string, buffer: Buffer): Promise<void> {
  if (getDataProvider() !== 'supabase') {
    throw new Error('Upload de imagem de produto requer DATA_PROVIDER=supabase.')
  }

  const supabase = createAdminClient()
  const ext = path.extname(filename).toLowerCase()
  const contentType = CONTENT_TYPES[ext] ?? 'application/octet-stream'

  const { error } = await supabase.storage
    .from(PRODUCTS_BUCKET)
    .upload(filename, buffer, { upsert: false, contentType })

  if (error) {
    throw new Error(`products upload failed: ${error.message}`)
  }
}
