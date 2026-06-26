import 'server-only'

import path from 'path'
import { getDataProvider } from '@/lib/data/provider'
import { createAdminClient } from '@/lib/supabase/admin'
import { writeBrandingFile } from '@/lib/store/branding-storage'

const CONTENT_TYPES: Record<string, string> = {
  '.webp': 'image/webp',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
}

function categoryImageFilename(categoryId: string): string {
  return `categories/${categoryId}.webp`
}

export async function writeCategoryImage(categoryId: string, buffer: Buffer): Promise<string> {
  const filename = categoryImageFilename(categoryId)
  await writeBrandingFile(filename, buffer)
  return filename
}

export async function deleteCategoryImage(categoryId: string): Promise<void> {
  const filename = categoryImageFilename(categoryId)

  if (getDataProvider() === 'supabase') {
    const supabase = createAdminClient()
    await supabase.storage.from('branding').remove([filename])
    return
  }

  try {
    const fs = await import('fs')
    const { getBrandingDir } = await import('@/lib/store/settings-storage')
    const filePath = path.join(getBrandingDir(), filename)
    if (fs.existsSync(filePath)) fs.unlinkSync(filePath)
  } catch {
    // ignore — file may not exist
  }
}

export { categoryImageUrl } from './category-image-url'
