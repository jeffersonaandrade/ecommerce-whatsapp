import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'

const root = path.join(path.dirname(fileURLToPath(import.meta.url)), '../..')

/** Pasta legacy — preferir `deploy/clients/<slug>/branding/`. */
export const BRANDING_SOURCE_DIR = path.join(root, 'deploy/branding')

export const BRANDING_LOGO_FILENAMES = [
  'logo.jpeg',
  'logo.jpg',
  'logo.png',
  'logo.webp',
] as const

export function resolveClientBrandingDir(clientSlug: string): string {
  return path.join(root, 'deploy/clients', clientSlug, 'branding')
}

export function resolveBrandingLogoSourcePath(options: { clientSlug?: string } = {}): string | null {
  const dirs: string[] = []
  if (options.clientSlug?.trim()) {
    dirs.push(resolveClientBrandingDir(options.clientSlug.trim()))
  }
  dirs.push(BRANDING_SOURCE_DIR)

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

export function readBrandingLogoSourceBuffer(options: { clientSlug?: string } = {}): Buffer | null {
  const logoPath = resolveBrandingLogoSourcePath(options)
  if (!logoPath) return null
  return fs.readFileSync(logoPath)
}
