import sharp from 'sharp'

const FAVICON_SIZES = [16, 32, 180, 192, 512]
export const OG_IMAGE_FILENAME = 'og-default.jpg'
export const LOGO_FILENAME = 'logo.webp'

function resizeContainedSquare(image, size, background) {
  return image.clone().resize(size, size, { fit: 'contain', background })
}

async function buildHeaderLogoWebp(sourceBuffer) {
  const image = sharp(sourceBuffer).rotate()
  const logoBackground = { r: 0, g: 0, b: 0, alpha: 0 }
  let prepared = image.clone()
  try {
    prepared = sharp(await image.clone().trim({ threshold: 15 }).toBuffer())
  } catch {
    // noop
  }
  return prepared
    .resize(512, 128, { fit: 'inside', background: logoBackground })
    .webp({ quality: 90 })
    .toBuffer()
}

/** Gera derivados (logo.webp, favicons, OG) a partir do buffer original da logo. */
export async function generateBrandingAssets(sourceBuffer) {
  const image = sharp(sourceBuffer).rotate()
  const faviconBackground = { r: 0, g: 0, b: 0, alpha: 1 }
  const files = new Map()

  files.set(LOGO_FILENAME, await buildHeaderLogoWebp(sourceBuffer))

  for (const size of FAVICON_SIZES) {
    const name =
      size === 180
        ? 'apple-touch-icon.png'
        : size === 192
          ? 'android-192.png'
          : size === 512
            ? 'android-512.png'
            : `favicon-${size}.png`
    files.set(
      name,
      await resizeContainedSquare(image, size, faviconBackground).png().toBuffer()
    )
  }

  files.set(
    OG_IMAGE_FILENAME,
    await image
      .clone()
      .resize(1200, 630, { fit: 'cover', position: 'centre' })
      .jpeg({ quality: 85 })
      .toBuffer()
  )

  return files
}
