/**
 * Publica a logo de deploy/branding/logo.* no Supabase Storage e atualiza store_settings.
 * Uso: npm run branding:sync (requer NEXT_PUBLIC_SUPABASE_URL + SUPABASE_SERVICE_ROLE_KEY)
 */
import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'
import { createClient } from '@supabase/supabase-js'
import {
  generateBrandingAssets,
  LOGO_FILENAME,
  OG_IMAGE_FILENAME,
} from './generate-branding-assets.mjs'
import { readBrandingLogoSourceBuffer, resolveBrandingLogoSourcePath } from './resolve-branding-logo.mjs'

const root = path.join(path.dirname(fileURLToPath(import.meta.url)), '../..')

function requireEnv(name) {
  const value = process.env[name]
  if (!value?.trim()) {
    console.error(`Missing env: ${name}`)
    process.exit(1)
  }
  return value.trim()
}

function loadEnvLocal() {
  const envPath = path.join(root, '.env.local')
  if (!fs.existsSync(envPath)) return
  for (const line of fs.readFileSync(envPath, 'utf8').split(/\r?\n/)) {
    const m = line.match(/^([A-Za-z_][A-Za-z0-9_]*)=(.*)$/)
    if (m && process.env[m[1]] === undefined) {
      process.env[m[1]] = m[2].trim()
    }
  }
}

function mimeFor(filename) {
  const ext = path.extname(filename).toLowerCase()
  if (ext === '.webp') return 'image/webp'
  if (ext === '.png') return 'image/png'
  if (ext === '.jpg' || ext === '.jpeg') return 'image/jpeg'
  return 'application/octet-stream'
}

async function main() {
  loadEnvLocal()

  const logoPath = resolveBrandingLogoSourcePath()
  if (!logoPath) {
    console.error('Nenhuma logo em deploy/branding/ (esperado: logo.jpeg, logo.jpg, logo.png ou logo.webp)')
    process.exit(1)
  }

  const sourceBuffer = readBrandingLogoSourceBuffer()
  const files = await generateBrandingAssets(sourceBuffer)

  const url = requireEnv('NEXT_PUBLIC_SUPABASE_URL')
  const serviceKey = requireEnv('SUPABASE_SERVICE_ROLE_KEY')
  const supabase = createClient(url, serviceKey, {
    auth: { persistSession: false, autoRefreshToken: false },
  })

  console.log(`Fonte: ${path.relative(root, logoPath)}`)
  for (const [filename, body] of files.entries()) {
    const { error } = await supabase.storage
      .from('branding')
      .upload(filename, body, { upsert: true, contentType: mimeFor(filename) })
    if (error) {
      console.error(`Upload failed (${filename}):`, error.message)
      process.exit(1)
    }
    console.log(`Uploaded branding/${filename}`)
  }

  const { error: settingsError } = await supabase
    .from('store_settings')
    .update({
      logo_path: LOGO_FILENAME,
      og_image_path: OG_IMAGE_FILENAME,
      updated_at: new Date().toISOString(),
    })
    .eq('id', 'default')

  if (settingsError) {
    console.error('store_settings update failed:', settingsError.message)
    process.exit(1)
  }

  console.log('Branding sync complete.')
}

main().catch((err) => {
  console.error(err)
  process.exit(1)
})
