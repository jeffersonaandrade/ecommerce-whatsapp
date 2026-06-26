import 'server-only'

import sharp, { type Color, type Sharp } from 'sharp'
import { OG_IMAGE_FILENAME } from './branding-url'
import { writeBrandingFile } from './branding-storage'
import { getDataProvider } from '@/lib/data/provider'
import { getBrandingPublicUrl } from '@/lib/supabase/env'

export type GeneratedBranding = {
  logoPath: string
  ogImagePath: string
}

// Re-export for callers that already import from this module.
export {
  readBrandingFile,
  resolveExistingBrandingPath,
} from './branding-storage'

const FAVICON_SIZES = [16, 32, 180, 192, 512] as const
const LOGO_MAX_SIZE = 512

/** Preserva logos horizontais (ex.: faixa com texto) sem crop agressivo. */
function resizeContainedSquare(image: Sharp, size: number, background: Color) {
  return image.clone().resize(size, size, { fit: 'contain', background })
}

/** Preserva a proporção original (quadrada ou horizontal) — sem trim que corta letterboxing. */
async function buildHeaderLogoWebp(image: Sharp): Promise<Buffer> {
  const logoBackground: Color = { r: 0, g: 0, b: 0, alpha: 0 }

  return image
    .clone()
    .rotate()
    .resize(LOGO_MAX_SIZE, LOGO_MAX_SIZE, {
      fit: 'inside',
      background: logoBackground,
    })
    .webp({ quality: 90 })
    .toBuffer()
}

async function writeProcessedImage(
  image: Sharp,
  filename: string,
  processor: () => Promise<Buffer>
): Promise<void> {
  const buffer = await processor()
  await writeBrandingFile(filename, buffer)
}

export async function generateBrandingFromLogo(
  fileBuffer: Buffer
): Promise<GeneratedBranding> {
  const image = sharp(fileBuffer).rotate()
  const logoPath = 'logo.webp'
  const faviconBackground: Color = { r: 0, g: 0, b: 0, alpha: 1 }
  const ogImagePath = OG_IMAGE_FILENAME

  const tasks: Promise<void>[] = [
    writeProcessedImage(image, logoPath, () => buildHeaderLogoWebp(image)),
    writeProcessedImage(image, ogImagePath, () =>
      image.clone().resize(1200, 630, { fit: 'cover', position: 'centre' }).jpeg({ quality: 85 }).toBuffer()
    ),
  ]

  for (const size of FAVICON_SIZES) {
    const name =
      size === 180
        ? 'apple-touch-icon.png'
        : size === 192
          ? 'android-192.png'
          : size === 512
            ? 'android-512.png'
            : `favicon-${size}.png`
    tasks.push(
      writeProcessedImage(image, name, () =>
        resizeContainedSquare(image, size, faviconBackground).png().toBuffer()
      )
    )
  }

  await Promise.all(tasks)

  return { logoPath, ogImagePath }
}

export async function saveHeroImage(fileBuffer: Buffer): Promise<string> {
  const heroPath = 'hero.webp'
  const buffer = await sharp(fileBuffer)
    .rotate()
    .resize(1920, 1080, { fit: 'cover', position: 'centre' })
    .webp({ quality: 85 })
    .toBuffer()
  await writeBrandingFile(heroPath, buffer)
  return heroPath
}

export function getBrandingAssetPublicUrl(filename: string): string | null {
  if (getDataProvider() !== 'supabase') return null
  return getBrandingPublicUrl(filename)
}
