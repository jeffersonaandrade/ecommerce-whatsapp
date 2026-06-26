import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'

const root = path.join(path.dirname(fileURLToPath(import.meta.url)), '../..')
export const BRANDING_SOURCE_DIR = path.join(root, 'deploy/branding')

export const BRANDING_LOGO_FILENAMES = ['logo.jpeg', 'logo.jpg', 'logo.png', 'logo.webp']

export function resolveBrandingLogoSourcePath() {
  for (const name of BRANDING_LOGO_FILENAMES) {
    const candidate = path.join(BRANDING_SOURCE_DIR, name)
    if (fs.existsSync(candidate)) {
      return candidate
    }
  }
  return null
}

export function readBrandingLogoSourceBuffer() {
  const logoPath = resolveBrandingLogoSourcePath()
  if (!logoPath) return null
  return fs.readFileSync(logoPath)
}
