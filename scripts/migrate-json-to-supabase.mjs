import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'
import { createClient } from '@supabase/supabase-js'

const root = path.join(path.dirname(fileURLToPath(import.meta.url)), '..')
const storageDir = path.join(root, 'storage')
const brandingDir = path.join(storageDir, 'branding')

function requireEnv(name) {
  const value = process.env[name]
  if (!value?.trim()) {
    console.error(`Missing env: ${name}`)
    process.exit(1)
  }
  return value.trim()
}

function loadJson(filePath, fallbackPath) {
  const src = fs.existsSync(filePath) ? filePath : fallbackPath
  if (!fs.existsSync(src)) {
    console.error(`File not found: ${src}`)
    process.exit(1)
  }
  return JSON.parse(fs.readFileSync(src, 'utf-8'))
}

function storeSettingsToRow(settings) {
  return {
    id: 'default',
    store_name: settings.storeName,
    description: settings.description ?? '',
    site_url: settings.siteUrl ?? '',
    whatsapp_phone: settings.whatsappPhone ?? '',
    whatsapp_message_prefix: settings.whatsappMessagePrefix ?? '',
    email: settings.email ?? '',
    instagram: settings.instagram ?? '',
    facebook: settings.facebook ?? '',
    phone: settings.phone ?? '',
    logo_path: settings.logoPath ?? null,
    og_image_path: settings.ogImagePath ?? null,
    primary_color: settings.primaryColor ?? '#111111',
    secondary_color: settings.secondaryColor ?? '#f5f5f5',
    hero_image_path: settings.heroImagePath ?? null,
    hero_headline: settings.heroHeadline ?? '',
    hero_headline_line2: settings.heroHeadlineLine2 ?? '',
    hero_subheadline: settings.heroSubheadline ?? '',
    hero_cta_label: settings.heroCtaLabel ?? '',
    hero_cta_href: settings.heroCtaHref ?? '/products',
    about_text: settings.aboutText ?? '',
    address: settings.address ?? '',
    city_state: settings.cityState ?? '',
    business_hours: settings.businessHours ?? '',
    exchange_policy_text: settings.exchangePolicyText ?? '',
    updated_at: settings.updatedAt ?? new Date().toISOString(),
  }
}

function productToRow(product) {
  return {
    id: product.id,
    slug: product.slug,
    name: product.name,
    short_description: product.shortDescription ?? '',
    long_description: product.longDescription ?? '',
    price: product.price,
    promotional_price: product.promotionalPrice ?? null,
    category: product.category ?? '',
    club: product.club ?? null,
    images: product.images ?? [],
    status: product.status,
    updated_at: new Date().toISOString(),
  }
}

function variationsToRows(product) {
  return product.variations.map((v) => ({
    id: v.id,
    product_id: product.id,
    size: v.size ?? null,
    color: v.color ?? null,
    sku: v.sku,
    stock: v.stock ?? 0,
  }))
}

function mimeFor(filename) {
  const ext = path.extname(filename).toLowerCase()
  if (ext === '.webp') return 'image/webp'
  if (ext === '.png') return 'image/png'
  if (ext === '.jpg' || ext === '.jpeg') return 'image/jpeg'
  return 'application/octet-stream'
}

async function uploadBranding(supabase) {
  if (!fs.existsSync(brandingDir)) {
    console.log('No branding directory — skip uploads')
    return
  }

  const files = fs.readdirSync(brandingDir).filter((f) => f !== '.gitkeep')
  for (const filename of files) {
    const filePath = path.join(brandingDir, filename)
    if (!fs.statSync(filePath).isFile()) continue
    const body = fs.readFileSync(filePath)
    const { error } = await supabase.storage
      .from('branding')
      .upload(filename, body, { upsert: true, contentType: mimeFor(filename) })
    if (error) {
      console.error(`Branding upload failed (${filename}):`, error.message)
      process.exit(1)
    }
    console.log(`Uploaded branding/${filename}`)
  }
}

async function main() {
  const url = requireEnv('NEXT_PUBLIC_SUPABASE_URL')
  const serviceKey = requireEnv('SUPABASE_SERVICE_ROLE_KEY')
  const supabase = createClient(url, serviceKey, {
    auth: { persistSession: false, autoRefreshToken: false },
  })

  const settings = loadJson(
    path.join(storageDir, 'store-settings.json'),
    path.join(root, 'deploy', 'netlify', 'store-settings.json')
  )
  const products = loadJson(
    path.join(storageDir, 'catalog.json'),
    path.join(storageDir, 'catalog.seed.json')
  )

  console.log('Upserting store_settings...')
  const { error: settingsError } = await supabase
    .from('store_settings')
    .upsert(storeSettingsToRow(settings), { onConflict: 'id' })
  if (settingsError) {
    console.error('store_settings failed:', settingsError.message)
    process.exit(1)
  }

  console.log(`Upserting ${products.length} products...`)
  for (const product of products) {
    const { error: productError } = await supabase
      .from('products')
      .upsert(productToRow(product), { onConflict: 'id' })
    if (productError) {
      console.error(`Product ${product.id} failed:`, productError.message)
      process.exit(1)
    }

    const variations = variationsToRows(product)
    if (variations.length > 0) {
      const { error: varError } = await supabase
        .from('product_variations')
        .upsert(variations, { onConflict: 'id' })
      if (varError) {
        console.error(`Variations for ${product.id} failed:`, varError.message)
        process.exit(1)
      }
    }
  }

  await uploadBranding(supabase)
  console.log('Migration complete.')
}

main().catch((err) => {
  console.error(err)
  process.exit(1)
})
