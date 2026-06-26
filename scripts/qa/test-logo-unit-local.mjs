/**
 * QA local — upload logoUnit.jpeg (fluxo admin via Playwright + checklist HTTP).
 * Não loga secrets. Requer servidor em http://localhost:3003
 */
import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'
import sharp from 'sharp'
import { createClient } from '@supabase/supabase-js'
import { chromium } from 'playwright'

const root = path.join(path.dirname(fileURLToPath(import.meta.url)), '../..')
const base = process.env.QA_BASE_URL ?? 'http://localhost:3003'
const logoPath = path.join(root, 'deploy/branding/logo.jpeg')

function loadEnv() {
  const env = {}
  for (const line of fs.readFileSync(path.join(root, '.env.local'), 'utf8').split(/\r?\n/)) {
    const m = line.match(/^([A-Za-z_][A-Za-z0-9_]*)=(.*)$/)
    if (m) env[m[1]] = m[2].trim()
  }
  return env
}

function countBrightPixelsInMiddleRow(buffer, width, height, threshold) {
  const middleY = Math.floor(height / 2)
  const rowStart = middleY * width * 3
  let count = 0
  for (let x = 0; x < width; x += 1) {
    const i = rowStart + x * 3
    const r = buffer[i]
    const g = buffer[i + 1]
    const b = buffer[i + 2]
    if (r > threshold || g > threshold || b > threshold) count += 1
  }
  return count
}

function resizeContainedSquare(image, size, background) {
  return image.clone().resize(size, size, { fit: 'contain', background })
}

async function buildHeaderLogoWebp(sourceBuffer) {
  const image = sharp(sourceBuffer).rotate()
  const logoBackground = { r: 0, g: 0, b: 0, alpha: 0 }
  let prepared = image.clone()
  try {
    prepared = prepared.trim({ threshold: 15 })
  } catch {
    // noop
  }
  return prepared
    .resize(512, 128, { fit: 'inside', background: logoBackground })
    .webp({ quality: 90 })
    .toBuffer()
}

async function generateBrandingLikeServer(sourceBuffer) {
  const image = sharp(sourceBuffer).rotate()
  const faviconBackground = { r: 0, g: 0, b: 0, alpha: 1 }
  const files = new Map()

  files.set('logo.webp', await buildHeaderLogoWebp(sourceBuffer))

  for (const size of [16, 32, 180, 192, 512]) {
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
    'og-default.jpg',
    await image
      .clone()
      .resize(1200, 630, { fit: 'cover', position: 'centre' })
      .jpeg({ quality: 85 })
      .toBuffer()
  )

  return files
}

const env = loadEnv()
const email = env.ADMIN_EMAIL
const password = env.ADMIN_PASSWORD
const supabaseUrl = env.NEXT_PUBLIC_SUPABASE_URL
const serviceKey = env.SUPABASE_SERVICE_ROLE_KEY

if (!fs.existsSync(logoPath)) {
  console.error('FAIL logo_file :: deploy/branding/logo.jpeg não encontrado')
  process.exit(1)
}

if (!email || !password || !supabaseUrl || !serviceKey) {
  console.error('FAIL env :: faltam ADMIN_EMAIL, ADMIN_PASSWORD ou Supabase keys em .env.local')
  process.exit(1)
}

const results = []
const pass = (step, msg = '') => results.push({ step, status: 'PASS', msg })
const fail = (step, msg = '') => results.push({ step, status: 'FAIL', msg })

try {
  const health = await fetch(base, { redirect: 'follow' })
  if (!health.ok) fail('server_up', `HTTP ${health.status}`)
  else pass('server_up', base)
} catch (e) {
  fail('server_up', String(e.message ?? e))
  for (const r of results) console.log(`${r.status} ${r.step}${r.msg ? ' :: ' + r.msg : ''}`)
  process.exit(1)
}

const source = fs.readFileSync(logoPath)
const coverData = await sharp(source)
  .rotate()
  .resize(512, 512, { fit: 'cover', position: 'centre' })
  .raw()
  .toBuffer({ resolveWithObject: true })

const brandingFiles = await generateBrandingLikeServer(source)
const logoWebp = brandingFiles.get('logo.webp')
const containData = await sharp(logoWebp).raw().toBuffer({ resolveWithObject: true })

const coverBright = countBrightPixelsInMiddleRow(
  coverData.data,
  coverData.info.width,
  coverData.info.height,
  40
)
const containBright = countBrightPixelsInMiddleRow(
  containData.data,
  containData.info.width,
  containData.info.height,
  40
)

if (containBright > coverBright) pass('sharp_contain', `middleRow bright pixels ${containBright} > ${coverBright}`)
else fail('sharp_contain', `contain ${containBright} vs cover ${coverBright}`)

const admin = createClient(supabaseUrl, serviceKey, {
  auth: { persistSession: false, autoRefreshToken: false },
})

for (const [filename, buffer] of brandingFiles.entries()) {
  const ext = path.extname(filename).toLowerCase()
  const contentType =
    ext === '.webp'
      ? 'image/webp'
      : ext === '.png'
        ? 'image/png'
        : ext === '.jpg' || ext === '.jpeg'
          ? 'image/jpeg'
          : 'application/octet-stream'
  const { error } = await admin.storage.from('branding').upload(filename, buffer, {
    upsert: true,
    contentType,
  })
  if (error) {
    fail('storage_upload', `${filename}: ${error.message}`)
    break
  }
}
if (!results.some((r) => r.step === 'storage_upload' && r.status === 'FAIL')) {
  pass('storage_upload', `${brandingFiles.size} arquivos`)
}

const updatedAt = new Date().toISOString()
try {
  const { data: current, error: readErr } = await admin
    .from('store_settings')
    .select('*')
    .eq('id', 'default')
    .single()
  if (readErr) throw readErr

  const { error: writeErr } = await admin.from('store_settings').upsert({
    ...current,
    logo_path: 'logo.webp',
    og_image_path: 'og-default.jpg',
    updated_at: updatedAt,
  })
  if (writeErr) throw writeErr

  const { data: verify } = await admin
    .from('store_settings')
    .select('logo_path')
    .eq('id', 'default')
    .single()
  if (verify?.logo_path === 'logo.webp') pass('db_logo_path')
  else fail('db_logo_path', `got ${verify?.logo_path}`)
} catch (e) {
  fail('db_logo_path', String(e.message ?? e))
}

for (const asset of ['logo.webp', 'favicon-32.png', 'favicon-16.png', 'apple-touch-icon.png']) {
  const res = await fetch(`${base}/api/branding/${asset}`)
  if (res.ok) pass(`http_${asset}`, String(res.status))
  else fail(`http_${asset}`, String(res.status))
}

const logoMeta = await sharp(logoWebp).metadata()
if (logoMeta.width && logoMeta.height && logoMeta.width > logoMeta.height) {
  pass('logo_webp_aspect', `${logoMeta.width}x${logoMeta.height}`)
} else {
  fail('logo_webp_aspect', `${logoMeta.width}x${logoMeta.height}`)
}

const browser = await chromium.launch({ headless: true })
const page = await browser.newPage({ viewport: { width: 1280, height: 720 } })

try {
  await page.goto(`${base}/admin/login`, { waitUntil: 'domcontentloaded' })
  await page.locator('input[type="email"]').fill(email)
  await page.locator('input[type="password"]').fill(password)
  await page.getByRole('button', { name: 'Entrar' }).click()
  await page.waitForURL(/\/admin(?!\/login)/, { timeout: 20000 })
  pass('admin_login')

  await page.goto(`${base}/admin/settings`, { waitUntil: 'networkidle' })

  await page.locator('#store-logo-file').setInputFiles(logoPath)
  const previewVisible = await page
    .locator('img[alt="Preview da logo selecionada"]')
    .isVisible()
    .catch(() => false)
  if (previewVisible) pass('admin_logo_preview')
  else fail('admin_logo_preview')

  await page.getByRole('button', { name: 'Enviar logo' }).click()
  await page
    .getByText(/Logo enviada|Favicon e imagem de compartilhamento gerados/i)
    .waitFor({ timeout: 30000 })
  pass('admin_upload_success')

  await page.goto(base, { waitUntil: 'networkidle' })
  const headerLogo = page.locator('header img[alt]').first()
  await headerLogo.waitFor({ timeout: 10000 })
  await headerLogo.evaluate((img) =>
    img instanceof HTMLImageElement ? img.decode().catch(() => undefined) : undefined
  )

  const homeHtml = await page.content()
  if (homeHtml.includes('object-contain') && homeHtml.includes('/api/branding/logo.webp')) {
    pass('home_header_markup')
  } else {
    fail('home_header_markup', 'sem object-contain ou src da logo no HTML')
  }

  const box = await headerLogo.boundingBox()
  const clientSize = await headerLogo.evaluate((el) =>
    el instanceof HTMLImageElement
      ? { width: el.clientWidth, height: el.clientHeight }
      : { width: 0, height: 0 }
  )
  const src = await headerLogo.getAttribute('src')
  const className = await headerLogo.getAttribute('class')

  if (src?.includes('/api/branding/logo.webp')) pass('vitrine_logo_src')
  else fail('vitrine_logo_src', src ?? 'sem src')

  if (className?.includes('object-contain')) pass('vitrine_logo_class')
  else fail('vitrine_logo_class', className ?? 'sem class')

  const displayW = clientSize.width || box?.width || 0
  const displayH = clientSize.height || box?.height || 0
  if (displayW > displayH * 1.2) {
    pass('vitrine_logo_shape', `${Math.round(displayW)}x${Math.round(displayH)}`)
  } else if (displayW > 0) {
    fail('vitrine_logo_shape', `${Math.round(displayW)}x${Math.round(displayH)} — esperado largura > altura`)
  } else {
    fail('vitrine_logo_shape', 'sem dimensões')
  }

  const screenshotPath = path.join(root, 'test-data/e2e/logo-unit-local-header.png')
  fs.mkdirSync(path.dirname(screenshotPath), { recursive: true })
  await headerLogo.screenshot({ path: screenshotPath })
  pass('screenshot', screenshotPath)
} catch (e) {
  fail('browser_flow', String(e.message ?? e))
} finally {
  await browser.close()
}

console.log('\n=== QA logoUnit.jpeg local ===\n')
for (const r of results) {
  console.log(`${r.status} ${r.step}${r.msg ? ' :: ' + r.msg : ''}`)
}

const failed = results.filter((r) => r.status === 'FAIL')
process.exit(failed.length ? 1 : 0)
