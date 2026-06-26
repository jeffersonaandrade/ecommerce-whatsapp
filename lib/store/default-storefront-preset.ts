import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'
import { StoreSettingsInput } from '@/types/store-settings'

export type DefaultStorefrontVisualPreset = Pick<
  StoreSettingsInput,
  | 'description'
  | 'primaryColor'
  | 'secondaryColor'
  | 'heroHeadline'
  | 'heroHeadlineLine2'
  | 'heroSubheadline'
  | 'heroCtaLabel'
  | 'heroCtaHref'
  | 'heroImagePath'
  | 'aboutText'
  | 'address'
  | 'cityState'
  | 'businessHours'
  | 'exchangePolicyText'
>

const root = path.join(path.dirname(fileURLToPath(import.meta.url)), '../..')
const presetDir = path.join(root, 'deploy/netlify')
const presetPath = path.join(presetDir, 'default-storefront-preset.json')

export function getDefaultStorefrontVisualPreset(): DefaultStorefrontVisualPreset {
  const raw = JSON.parse(fs.readFileSync(presetPath, 'utf8')) as DefaultStorefrontVisualPreset
  return { ...raw }
}

export function readDefaultStorefrontHeroBuffer(): Buffer {
  return fs.readFileSync(path.join(presetDir, 'branding/hero.webp'))
}

export function readDefaultStorefrontLogoSourceBuffer(): Buffer {
  const logoPath = path.join(presetDir, 'branding/logo-source.png')
  if (fs.existsSync(logoPath)) {
    return fs.readFileSync(logoPath)
  }
  return readDefaultStorefrontHeroBuffer()
}
