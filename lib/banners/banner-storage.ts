import 'server-only'

import { writeBrandingFile } from '@/lib/store/branding-storage'
import { getDataProvider } from '@/lib/data/provider'
import { createAdminClient } from '@/lib/supabase/admin'
import path from 'path'
import type { BannerImageSide } from './banner-image-url'

function bannerFilename(slideId: string, side: BannerImageSide): string {
  return `banners/${slideId}-${side}.webp`
}

export async function writeBannerImage(
  slideId: string,
  side: BannerImageSide,
  buffer: Buffer
): Promise<string> {
  const filename = bannerFilename(slideId, side)
  await writeBrandingFile(filename, buffer)
  return filename
}

export async function deleteBannerImages(slideId: string): Promise<void> {
  const files = [bannerFilename(slideId, 'desktop'), bannerFilename(slideId, 'mobile')]

  if (getDataProvider() === 'supabase') {
    const supabase = createAdminClient()
    await supabase.storage.from('branding').remove(files)
    return
  }

  try {
    const fs = await import('fs')
    const { getBrandingDir } = await import('@/lib/store/settings-storage')
    const dir = getBrandingDir()
    for (const f of files) {
      const fp = path.join(dir, f)
      if (fs.existsSync(fp)) fs.unlinkSync(fp)
    }
  } catch {
    // ignore
  }
}

export type { BannerImageSide } from './banner-image-url'
export { bannerImageUrl } from './banner-image-url'
