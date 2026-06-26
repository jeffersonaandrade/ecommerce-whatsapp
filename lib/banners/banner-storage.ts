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

export async function deleteBannerImage(
  slideId: string,
  side: BannerImageSide
): Promise<void> {
  const file = bannerFilename(slideId, side)

  if (getDataProvider() === 'supabase') {
    const supabase = createAdminClient()
    await supabase.storage.from('branding').remove([file])
    return
  }

  try {
    const fs = await import('fs')
    const { getBrandingDir } = await import('@/lib/store/settings-storage')
    const filePath = path.join(getBrandingDir(), file)
    if (fs.existsSync(filePath)) fs.unlinkSync(filePath)
  } catch {
    // ignore
  }
}

export async function deleteBannerImages(slideId: string): Promise<void> {
  await deleteBannerImage(slideId, 'desktop')
  await deleteBannerImage(slideId, 'mobile')
}

export type { BannerImageSide } from './banner-image-url'
export { bannerImageUrl } from './banner-image-url'
