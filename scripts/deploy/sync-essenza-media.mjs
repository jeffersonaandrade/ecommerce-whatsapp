/**
 * Sincroniza mídia demo da Essenza para Supabase Storage.
 * - Produtos: bucket `products` + URLs públicas em products.images
 * - Banners: bucket `branding` em banners/{id}-desktop.webp + path correto no banco
 *
 * Uso: node scripts/deploy/sync-essenza-media.mjs
 */
import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import sharp from 'sharp'
import { createClient } from '@supabase/supabase-js'
import { loadClientEnv } from '../operator/client-env.mjs'

const root = path.join(path.dirname(fileURLToPath(import.meta.url)), '../..')
const demoDir = path.join(root, 'public/demo/essenza')
const CLIENT = 'essenza'

const BANNERS = [
  { id: 'banner-arabes', source: 'essenza-arabic-oud.jpg' },
  { id: 'banner-kits', source: 'essenza-gift-set.jpg' },
]

function requireEnv(name) {
  const value = process.env[name]?.trim()
  if (!value) {
    console.error(`Missing env: ${name}`)
    process.exit(1)
  }
  return value
}

function mimeFor(filePath) {
  const ext = path.extname(filePath).toLowerCase()
  if (ext === '.webp') return 'image/webp'
  if (ext === '.png') return 'image/png'
  if (ext === '.jpg' || ext === '.jpeg') return 'image/jpeg'
  return 'application/octet-stream'
}

function productsPublicUrl(baseUrl, storagePath) {
  return `${baseUrl.replace(/\/$/, '')}/storage/v1/object/public/products/${storagePath}`
}

async function uploadBuffer(supabase, bucket, storagePath, body, contentType) {
  const { error } = await supabase.storage.from(bucket).upload(storagePath, body, {
    upsert: true,
    contentType,
  })
  if (error) throw new Error(`${bucket}/${storagePath}: ${error.message}`)
}

async function toWebpBuffer(filePath) {
  return sharp(fs.readFileSync(filePath)).rotate().webp({ quality: 85 }).toBuffer()
}

async function syncProducts(supabase, supabaseUrl) {
  const { data: products, error } = await supabase
    .from('products')
    .select('id, slug, images')
    .order('slug')

  if (error) throw new Error(error.message)
  if (!products?.length) {
    console.log('Nenhum produto encontrado.')
    return
  }

  let ok = 0
  for (const product of products) {
    const localPath = (product.images ?? []).find((img) => img.startsWith('/demo/essenza/'))
    if (!localPath) {
      console.log(`SKIP ${product.slug} — sem path local /demo/essenza/`)
      continue
    }

    const filename = path.basename(localPath)
    const absolutePath = path.join(demoDir, filename)
    if (!fs.existsSync(absolutePath)) {
      throw new Error(`Arquivo ausente: ${absolutePath}`)
    }

    const ext = path.extname(filename).toLowerCase().replace('.jpeg', '.jpg') || '.jpg'
    const storagePath = `${product.id}/cover${ext}`
    const body = fs.readFileSync(absolutePath)

    await uploadBuffer(supabase, 'products', storagePath, body, mimeFor(absolutePath))

    const publicUrl = productsPublicUrl(supabaseUrl, storagePath)
    const { error: updateError } = await supabase
      .from('products')
      .update({ images: [publicUrl] })
      .eq('id', product.id)

    if (updateError) throw new Error(updateError.message)

    ok++
    console.log(`OK  produto ${product.slug} → ${storagePath}`)
  }

  console.log(`Produtos sincronizados: ${ok}/${products.length}`)
}

async function syncBanners(supabase) {
  for (const banner of BANNERS) {
    const absolutePath = path.join(demoDir, banner.source)
    if (!fs.existsSync(absolutePath)) {
      throw new Error(`Arquivo ausente: ${absolutePath}`)
    }

    const storagePath = `banners/${banner.id}-desktop.webp`
    const webp = await toWebpBuffer(absolutePath)

    await uploadBuffer(supabase, 'branding', storagePath, webp, 'image/webp')

    const { error: updateError } = await supabase
      .from('banner_slides')
      .update({
        desktop_image_path: storagePath,
        updated_at: new Date().toISOString(),
      })
      .eq('id', banner.id)

    if (updateError) throw new Error(updateError.message)

    console.log(`OK  banner ${banner.id} → ${storagePath}`)
  }
}

async function main() {
  loadClientEnv(CLIENT)

  const supabaseUrl = requireEnv('NEXT_PUBLIC_SUPABASE_URL')
  const serviceKey = requireEnv('SUPABASE_SERVICE_ROLE_KEY')
  const supabase = createClient(supabaseUrl, serviceKey, {
    auth: { persistSession: false, autoRefreshToken: false },
  })

  if (!fs.existsSync(demoDir)) {
    console.error(`Pasta demo ausente: ${demoDir}`)
    process.exit(1)
  }

  console.log(`Essenza media sync → ${supabaseUrl}`)
  await syncProducts(supabase, supabaseUrl)
  await syncBanners(supabase)
  console.log('Concluído. Rode também: npm run branding:sync -- --client essenza')
}

main().catch((err) => {
  console.error(err)
  process.exit(1)
})
