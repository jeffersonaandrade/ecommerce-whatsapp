import 'server-only'

import fs from 'fs'
import path from 'path'
import sharp from 'sharp'
import { OG_IMAGE_FILENAME, resolveBrandingFilename } from './branding-url'
import { getBrandingDir } from './settings-storage'

export type GeneratedBranding = {
  logoPath: string
  ogImagePath: string
}

const FAVICON_SIZES = [16, 32, 180, 192, 512] as const

export async function generateBrandingFromLogo(
  fileBuffer: Buffer
): Promise<GeneratedBranding> {
  const dir = getBrandingDir()
  const image = sharp(fileBuffer).rotate()

  const logoPath = 'logo.webp'
  await image
    .clone()
    .resize(512, 512, { fit: 'cover', position: 'centre' })
    .webp({ quality: 90 })
    .toFile(path.join(dir, logoPath))

  for (const size of FAVICON_SIZES) {
    const name =
      size === 180
        ? 'apple-touch-icon.png'
        : size === 192
          ? 'android-192.png'
          : size === 512
            ? 'android-512.png'
            : `favicon-${size}.png`
    await image
      .clone()
      .resize(size, size, { fit: 'cover', position: 'centre' })
      .png()
      .toFile(path.join(dir, name))
  }

  const ogImagePath = OG_IMAGE_FILENAME
  await image
    .clone()
    .resize(1200, 630, { fit: 'cover', position: 'centre' })
    .jpeg({ quality: 85 })
    .toFile(path.join(dir, ogImagePath))

  return { logoPath, ogImagePath }
}

export async function saveHeroImage(fileBuffer: Buffer): Promise<string> {
  const dir = getBrandingDir()
  const heroPath = 'hero.webp'
  await sharp(fileBuffer)
    .rotate()
    .resize(1920, 1080, { fit: 'cover', position: 'centre' })
    .webp({ quality: 85 })
    .toFile(path.join(dir, heroPath))
  return heroPath
}

export function readBrandingFile(filename: string): Buffer | null {
  const safe = resolveBrandingFilename(filename)
  const filePath = path.join(getBrandingDir(), safe)
  if (!fs.existsSync(filePath)) return null
  return fs.readFileSync(filePath)
}
