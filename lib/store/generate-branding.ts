import 'server-only'

import sharp, { type Color, type Sharp } from 'sharp'
import { OG_IMAGE_FILENAME, resolveBrandingFilename } from './branding-url'
import {
  brandingFileExists,
  readBrandingFileBuffer,
  writeBrandingFile,
} from './branding-storage'
import { getDataProvider } from '@/lib/data/provider'
import { getBrandingPublicUrl } from '@/lib/supabase/env'

export type GeneratedBranding = {
  logoPath: string
  ogImagePath: string
}

const FAVICON_SIZES = [16, 32, 180, 192, 512] as const
const LOGO_MAX_WIDTH = 512
const LOGO_MAX_HEIGHT = 128

/** Preserva logos horizontais (ex.: faixa com texto) sem crop agressivo. */
function resizeContainedSquare(image: Sharp, size: number, background: Color) {
  return image.clone().resize(size, size, { fit: 'contain', background })
}

/** Remove letterboxing e gera asset retangular para o header (não canvas quadrado). */
async function buildHeaderLogoWebp(image: Sharp): Promise<Buffer> {
  const logoBackground: Color = { r: 0, g: 0, b: 0, alpha: 0 }
  let prepared = image.clone().rotate()

  try {
    prepared = prepared.trim({ threshold: 15 })
  } catch {
    // Mantém original se trim falhar (ex.: imagem uniforme).
  }

  return prepared
    .resize(LOGO_MAX_WIDTH, LOGO_MAX_HEIGHT, {
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

  await writeProcessedImage(image, logoPath, () => buildHeaderLogoWebp(image))

  const faviconBackground: Color = { r: 0, g: 0, b: 0, alpha: 1 }

  for (const size of FAVICON_SIZES) {
    const name =
      size === 180
        ? 'apple-touch-icon.png'
        : size === 192
          ? 'android-192.png'
          : size === 512
            ? 'android-512.png'
            : `favicon-${size}.png`
    await writeProcessedImage(image, name, () =>
      resizeContainedSquare(image, size, faviconBackground).png().toBuffer()
    )
  }

  const ogImagePath = OG_IMAGE_FILENAME
  await writeProcessedImage(image, ogImagePath, () =>
    image.clone().resize(1200, 630, { fit: 'cover', position: 'centre' }).jpeg({ quality: 85 }).toBuffer()
  )

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

export async function readBrandingFile(filename: string): Promise<Buffer | null> {
  const safe = resolveBrandingFilename(filename)
  return readBrandingFileBuffer(safe)
}

export async function resolveExistingBrandingPath(
  filename: string | null | undefined
): Promise<string | null> {
  if (!filename) return null
  const safe = resolveBrandingFilename(filename)

  if (getDataProvider() === 'supabase') {
    const buffer = await readBrandingFileBuffer(safe)
    return buffer ? filename : null
  }

  return brandingFileExists(safe) ? filename : null
}

export function getBrandingAssetPublicUrl(filename: string): string | null {
  if (getDataProvider() !== 'supabase') return null
  return getBrandingPublicUrl(filename)
}
