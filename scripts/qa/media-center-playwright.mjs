/**
 * QA Central de Mídia — Playwright (headed por padrão).
 * Uso: node scripts/qa/media-center-playwright.mjs
 * Requer dev server: PLAYWRIGHT_BASE_URL=http://localhost:3000
 */
import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'
import { chromium } from 'playwright'

const root = path.join(path.dirname(fileURLToPath(import.meta.url)), '../..')
const base = process.env.PLAYWRIGHT_BASE_URL ?? 'http://localhost:3000'
const headless = process.env.PLAYWRIGHT_HEADLESS === 'true'
const outDir = path.join(root, 'test-data/e2e')
const reportPath = path.join(outDir, 'media-center-results.json')

function loadEnv() {
  const env = {}
  const envPath = path.join(root, '.env.local')
  if (!fs.existsSync(envPath)) return env
  for (const line of fs.readFileSync(envPath, 'utf8').split(/\r?\n/)) {
    const m = line.match(/^([A-Za-z_][A-Za-z0-9_]*)=(.*)$/)
    if (m) env[m[1]] = m[2].trim().replace(/^["']|["']$/g, '')
  }
  return env
}

const report = { base, headless, cases: {}, startedAt: new Date().toISOString() }

function record(id, ok, note = '') {
  report.cases[id] = { status: ok ? 'PASS' : 'FAIL', note }
}

async function loginAdmin(page, email, password) {
  await page.goto(`${base}/admin/login`, { waitUntil: 'domcontentloaded' })
  await page.locator('input[type="email"]').fill(email)
  await page.locator('input[type="password"]').fill(password)
  await page.getByRole('button', { name: 'Entrar' }).click()
  await page.waitForURL(/\/admin(?!\/login)/, { timeout: 30000 })
}

async function main() {
  const env = loadEnv()
  const email = process.env.PLAYWRIGHT_ADMIN_EMAIL ?? env.PLAYWRIGHT_ADMIN_EMAIL ?? env.ADMIN_EMAIL
  const password =
    process.env.PLAYWRIGHT_ADMIN_PASSWORD ?? env.PLAYWRIGHT_ADMIN_PASSWORD ?? env.ADMIN_PASSWORD

  if (!email || !password) {
    console.error('Defina PLAYWRIGHT_ADMIN_EMAIL e PLAYWRIGHT_ADMIN_PASSWORD em .env.local')
    process.exit(1)
  }

  fs.mkdirSync(outDir, { recursive: true })

  const browser = await chromium.launch({ headless })
  const page = await browser.newPage()
  const storageRequests = []

  page.on('request', (req) => {
    const url = req.url()
    if (url.includes('/storage/v1/object') && req.method() === 'POST') {
      storageRequests.push(url)
    }
  })

  try {
    await loginAdmin(page, email, password)
    record('login', true)

    await page.goto(`${base}/admin/products/media`, { waitUntil: 'domcontentloaded', timeout: 30000 })
    const title = await page.locator('h1').innerText()
    record('media-page', title.includes('Central de Mídia'))

    await page.getByRole('button', { name: 'URLs externas' }).click()
    record('filter-external', true)

    await page.getByRole('button', { name: 'Upload em lote' }).click()
    record('upload-tab', true)

    await page.getByRole('button', { name: 'Baixar mapa CSV' }).click()
    record('export-map', true)

    const fixtureDir = path.join(root, 'test-data/media-fixtures')
    fs.mkdirSync(fixtureDir, { recursive: true })
    const fixturePath = path.join(fixtureDir, 'qa-media--01.jpg')
    if (!fs.existsSync(fixturePath)) {
      const png = path.join(root, 'test-data/e2e/qa-product.png')
      if (fs.existsSync(png)) fs.copyFileSync(png, fixturePath)
      else fs.writeFileSync(fixturePath, Buffer.alloc(128, 0))
    }

    const fileInput = page.locator('input[type="file"]').first()
    await fileInput.setInputFiles(fixturePath)
    await page.waitForTimeout(500)
    const body = await page.locator('body').innerText()
    record('file-preview', /Associados|Órfãos|Erros/.test(body))

    await page.screenshot({ path: path.join(outDir, 'media-center-qa.png'), fullPage: true })
    record('screenshot', true)

    await page.goto(`${base}/products`, { waitUntil: 'domcontentloaded' })
    record('storefront-plp', true)

    record('storage-direct-upload', storageRequests.length === 0, `${storageRequests.length} POST storage`)
  } catch (err) {
    record('unexpected', false, err instanceof Error ? err.message : String(err))
  } finally {
    report.finishedAt = new Date().toISOString()
    fs.writeFileSync(reportPath, JSON.stringify(report, null, 2))
    await browser.close()
  }

  const failed = Object.values(report.cases).filter((c) => c.status === 'FAIL')
  console.log(JSON.stringify(report, null, 2))
  process.exit(failed.length ? 1 : 0)
}

main()
