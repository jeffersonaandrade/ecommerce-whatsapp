import 'server-only'

import { getDataProvider } from '@/lib/data/provider'
import { createAdminClient } from '@/lib/supabase/admin'
import fs from 'fs'
import path from 'path'
import { resolveBrandingFilename } from './branding-url'
import { getBrandingDir } from './settings-storage'

const BRANDING_BUCKET = 'branding'

export async function writeBrandingFile(filename: string, buffer: Buffer): Promise<void> {
  if (getDataProvider() === 'supabase') {
    const supabase = createAdminClient()
    const ext = path.extname(filename).toLowerCase()
    const contentType =
      ext === '.webp'
        ? 'image/webp'
        : ext === '.png'
          ? 'image/png'
          : ext === '.jpg' || ext === '.jpeg'
            ? 'image/jpeg'
            : 'application/octet-stream'

    const { error } = await supabase.storage
      .from(BRANDING_BUCKET)
      .upload(filename, buffer, { upsert: true, contentType })

    if (error) throw new Error(`branding upload failed: ${error.message}`)
    return
  }

  const dir = getBrandingDir()
  fs.mkdirSync(dir, { recursive: true })
  fs.writeFileSync(path.join(dir, filename), buffer)
}

export async function readBrandingFileBuffer(filename: string): Promise<Buffer | null> {
  if (getDataProvider() === 'supabase') {
    const supabase = createAdminClient()
    const { data, error } = await supabase.storage.from(BRANDING_BUCKET).download(filename)
    if (error || !data) return null
    return Buffer.from(await data.arrayBuffer())
  }

  const filePath = path.join(getBrandingDir(), filename)
  if (!fs.existsSync(filePath)) return null
  return fs.readFileSync(filePath)
}

export function brandingFileExists(filename: string): boolean {
  if (getDataProvider() === 'supabase') {
    return true
  }
  return fs.existsSync(path.join(getBrandingDir(), filename))
}

export async function readBrandingFile(filename: string): Promise<Buffer | null> {
  const safe = resolveBrandingFilename(filename)
  if (!safe) return null
  return readBrandingFileBuffer(safe)
}

export async function resolveExistingBrandingPath(
  filename: string | null | undefined
): Promise<string | null> {
  if (!filename) return null
  const safe = resolveBrandingFilename(filename)
  if (!safe) return null

  if (getDataProvider() === 'supabase') {
    const buffer = await readBrandingFileBuffer(safe)
    return buffer ? filename : null
  }

  return brandingFileExists(safe) ? filename : null
}
