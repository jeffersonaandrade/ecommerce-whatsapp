/**
 * Smoke test local Supabase — runner interno.
 * Nunca imprime secrets; só status PASS/FAIL por etapa.
 */
import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'
import { createClient } from '@supabase/supabase-js'

const root = path.join(path.dirname(fileURLToPath(import.meta.url)), '..')

function loadEnv() {
  const file = path.join(root, '.env.local')
  const env = {}
  for (const line of fs.readFileSync(file, 'utf8').split(/\r?\n/)) {
    const m = line.match(/^([A-Za-z_][A-Za-z0-9_]*)=(.*)$/)
    if (m) env[m[1]] = m[2].trim()
  }
  return env
}

function statBaseline() {
  const paths = [
    'storage/store-settings.json',
    'storage/catalog.json',
    'storage/branding',
  ]
  const out = {}
  for (const rel of paths) {
    const p = path.join(root, rel)
    if (!fs.existsSync(p)) {
      out[rel] = null
      continue
    }
    const st = fs.statSync(p)
    if (st.isDirectory()) {
      out[rel] = Object.fromEntries(
        fs.readdirSync(p).map((name) => {
          const f = path.join(p, name)
          return [name, fs.statSync(f).mtimeMs]
        })
      )
    } else {
      out[rel] = st.mtimeMs
    }
  }
  return out
}

function baselineChanged(before, after) {
  const touched = []
  for (const key of Object.keys(before)) {
    if (JSON.stringify(before[key]) !== JSON.stringify(after[key])) {
      touched.push(key)
    }
  }
  return touched
}

const env = loadEnv()
const url = env.NEXT_PUBLIC_SUPABASE_URL
const anon = env.NEXT_PUBLIC_SUPABASE_ANON_KEY
const service = env.SUPABASE_SERVICE_ROLE_KEY
const email = env.ADMIN_EMAIL
const password = env.ADMIN_PASSWORD

const results = []
const fail = (step, msg) => {
  results.push({ step, status: 'FAIL', msg })
}
const pass = (step, msg = '') => {
  results.push({ step, status: 'PASS', msg })
}

if (!url || !anon || !service) {
  console.log('FAIL preflight missing supabase env')
  process.exit(1)
}

const baselineBefore = statBaseline()
const admin = createClient(url, service, {
  auth: { persistSession: false, autoRefreshToken: false },
})

try {
  const authClient = createClient(url, anon)
  const { data, error } = await authClient.auth.signInWithPassword({
    email,
    password,
  })
  if (error || !data.session) fail('auth_login', error?.message ?? 'no session')
  else pass('auth_login')
} catch (e) {
  fail('auth_login', String(e.message ?? e))
}

try {
  const { count: pc } = await admin
    .from('products')
    .select('*', { count: 'exact', head: true })
    .eq('status', 'active')
  const { count: vc } = await admin
    .from('product_variations')
    .select('*', { count: 'exact', head: true })
  const { data: settings } = await admin
    .from('store_settings')
    .select('store_name')
    .eq('id', 'default')
    .single()
  if (pc === 6 && vc === 22 && settings?.store_name) {
    pass('read_seed', `products=${pc} variations=${vc}`)
  } else {
    fail('read_seed', `products=${pc} variations=${vc}`)
  }
} catch (e) {
  fail('read_seed', String(e.message ?? e))
}

const smokeStoreName = 'Smoke Test Local 2026'
try {
  const { data: current } = await admin
    .from('store_settings')
    .select('*')
    .eq('id', 'default')
    .single()
  const { error } = await admin.from('store_settings').upsert({
    ...current,
    store_name: smokeStoreName,
    updated_at: new Date().toISOString(),
  })
  if (error) throw error
  const { data: verify } = await admin
    .from('store_settings')
    .select('store_name')
    .eq('id', 'default')
    .single()
  if (verify?.store_name === smokeStoreName) pass('settings_write')
  else fail('settings_write', 'verify mismatch')
} catch (e) {
  fail('settings_write', String(e.message ?? e))
}

const testProductId = 'smoke-test-product'
try {
  await admin.from('product_variations').delete().eq('id', 'smoke-var-1')
  await admin.from('products').delete().eq('id', testProductId)

  const { error: createErr } = await admin.from('products').insert({
    id: testProductId,
    slug: 'smoke-test-produto',
    name: 'Smoke Test Produto',
    short_description: 'teste',
    long_description: 'teste smoke',
    price: 99.99,
    category: 'Acessórios',
    images: [],
    status: 'active',
  })
  if (createErr) throw createErr

  await admin.from('product_variations').insert({
    id: 'smoke-var-1',
    product_id: testProductId,
    size: 'M',
    sku: 'SMOKE-SKU-001',
    stock: 5,
  })

  const { error: updateErr } = await admin
    .from('products')
    .update({ name: 'Smoke Test Produto Editado' })
    .eq('id', testProductId)
  if (updateErr) throw updateErr

  const { data: listed } = await admin
    .from('products')
    .select('name')
    .eq('id', testProductId)
    .single()
  if (listed?.name !== 'Smoke Test Produto Editado') throw new Error('update not persisted')

  await admin.from('product_variations').delete().eq('id', 'smoke-var-1')
  await admin.from('products').delete().eq('id', testProductId)
  pass('product_crud')
} catch (e) {
  fail('product_crud', String(e.message ?? e))
}

try {
  const png = Buffer.from(
    'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8z8BQDwAEhQGAhKmMIQAAAABJRU5ErkJggg==',
    'base64'
  )
  const testFile = `smoke-logo-${Date.now()}.png`
  const { error: upErr } = await admin.storage
    .from('branding')
    .upload(testFile, png, { upsert: true, contentType: 'image/png' })
  if (upErr) throw upErr

  const publicUrl = `${url}/storage/v1/object/public/branding/${testFile}`
  const res = await fetch(publicUrl)
  if (!res.ok) throw new Error(`public url ${res.status}`)

  await admin.storage.from('branding').remove([testFile])
  pass('storage_branding')
} catch (e) {
  fail('storage_branding', String(e.message ?? e))
}

try {
  await admin.from('product_variations').delete().eq('id', 'smoke-csv-v1')
  await admin.from('products').delete().eq('id', 'smoke-csv-1')
  const { error } = await admin.from('products').upsert(
    {
      id: 'smoke-csv-1',
      slug: 'camisa-tecnica-1',
      name: 'Camisa Técnica Premium',
      short_description: 'CSV smoke',
      long_description: 'Import smoke test',
      price: 129.9,
      promotional_price: 99.9,
      category: 'Camisas',
      images: ['https://cdn.exemplo.com/camisa-tech-azul-frente.jpg'],
      status: 'active',
    },
    { onConflict: 'id' }
  )
  if (error) throw error
  await admin.from('product_variations').upsert(
    {
      id: 'smoke-csv-v1',
      product_id: 'smoke-csv-1',
      size: 'M',
      sku: 'CAM-TECH-P-M',
      stock: 15,
    },
    { onConflict: 'id' }
  )
  const { data } = await admin
    .from('products')
    .select('slug')
    .eq('slug', 'camisa-tecnica-1')
    .single()
  if (data?.slug !== 'camisa-tecnica-1') throw new Error('csv product missing')
  await admin.from('product_variations').delete().eq('id', 'smoke-csv-v1')
  await admin.from('products').delete().eq('id', 'smoke-csv-1')
  pass('csv_import_db')
} catch (e) {
  fail('csv_import_db', String(e.message ?? e))
}

try {
  const { buildWhatsAppMessage } = await import('../lib/purchase-intent/build-whatsapp-message.ts')
  const { data: settings } = await admin
    .from('store_settings')
    .select('site_url, whatsapp_phone, whatsapp_message_prefix')
    .eq('id', 'default')
    .single()
  const msg = buildWhatsAppMessage({
    siteUrl: settings.site_url,
    whatsappPhone: settings.whatsapp_phone,
    whatsappMessagePrefix: settings.whatsapp_message_prefix ?? '',
    items: [
      {
        productName: 'Smoke Item',
        slug: 'smoke-test',
        sku: 'SMOKE',
        size: 'M',
        quantity: 1,
        unitPrice: 10,
        lineTotal: 10,
      },
    ],
  })
  if (!/#TEMP-\d{8}-\d{4}/.test(msg)) throw new Error('missing TEMP id')
  pass('whatsapp_temp')
} catch (e) {
  fail('whatsapp_temp', String(e.message ?? e))
}

try {
  const { data: current } = await admin
    .from('store_settings')
    .select('*')
    .eq('id', 'default')
    .single()
  await admin.from('store_settings').upsert({
    ...current,
    store_name: 'Loja QA Local 2026',
    updated_at: new Date().toISOString(),
  })
} catch {
  // restore best-effort
}

const baselineAfter = statBaseline()
const touched = baselineChanged(baselineBefore, baselineAfter)
if (touched.length > 0) {
  fail('filesystem_p1', `touched: ${touched.join(', ')}`)
} else {
  pass('filesystem_clean')
}

for (const r of results) {
  console.log(`${r.status} ${r.step}${r.msg ? ' :: ' + r.msg : ''}`)
}

process.exit(results.some((r) => r.status === 'FAIL') ? 1 : 0)
