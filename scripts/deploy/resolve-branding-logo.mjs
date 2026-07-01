import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'

const root = path.join(path.dirname(fileURLToPath(import.meta.url)), '../..')
export const LEGACY_BRANDING_SOURCE_DIR = path.join(root, 'deploy/branding')

export const BRANDING_LOGO_FILENAMES = ['logo.jpeg', 'logo.jpg', 'logo.png', 'logo.webp']

export function resolveClientBrandingDir(clientSlug) {
  return path.join(root, 'deploy/clients', clientSlug, 'branding')
}

export function resolveBrandingLogoSourcePath(options = {}) {
  const dirs = []
  if (options.clientSlug?.trim()) {
    dirs.push(resolveClientBrandingDir(options.clientSlug.trim()))
  }
  dirs.push(LEGACY_BRANDING_SOURCE_DIR)

  for (const dir of dirs) {
    for (const name of BRANDING_LOGO_FILENAMES) {
      const candidate = path.join(dir, name)
      if (fs.existsSync(candidate)) {
        return candidate
      }
    }
  }
  return null
}

export function readBrandingLogoSourceBuffer(options = {}) {
  const logoPath = resolveBrandingLogoSourcePath(options)
  if (!logoPath) return null
  return fs.readFileSync(logoPath)
}
