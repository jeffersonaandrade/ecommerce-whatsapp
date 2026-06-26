/**
 * Smoke produção Netlify — não loga secrets. Uso: node scripts/smoke-prod-netlify.mjs
 */
import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'
import { chromium } from 'playwright'

const root = path.join(path.dirname(fileURLToPath(import.meta.url)), '../..')
const base = 'https://loja-whats.netlify.app'
const png = path.join(root, 'test-data/e2e/qa-logo.png')
const csv = path.join(root, 'test-data/e2e/csv-qa-e2e.csv')

function loadEnv() {
  const env = {}
  for (const line of fs.readFileSync(path.join(root, '.env.local'), 'utf8').split(/\r?\n/)) {
    const m = line.match(/^([A-Za-z_][A-Za-z0-9_]*)=(.*)$/)
    if (m) env[m[1]] = m[2].trim()
  }
  return env
}

const env = loadEnv()
const email = env.ADMIN_EMAIL
const password = env.ADMIN_PASSWORD
if (!email || !password) {
  console.error('Missing ADMIN_EMAIL or ADMIN_PASSWORD in .env.local')
  process.exit(1)
}

const results = {}

const browser = await chromium.launch({ headless: true })
const context = await browser.newContext({ viewport: { width: 1280, height: 720 } })
const page = await context.newPage()
page.on('dialog', (d) => d.accept())

try {
  // Fase 2 — toggle + auth
  await page.goto(`${base}/admin/login`, { waitUntil: 'networkidle' })
  const toggleBtn = page.getByRole('button', { name: /Mostrar senha|Ocultar senha/i })
  results.toggleVisible = await toggleBtn.isVisible()
  await toggleBtn.click()
  const inputTypeAfterShow = await page.locator('input[name="password"]').getAttribute('type')
  await toggleBtn.click()
  const inputTypeAfterHide = await page.locator('input[name="password"]').getAttribute('type')
  results.toggleWorks =
    results.toggleVisible && inputTypeAfterShow === 'text' && inputTypeAfterHide === 'password'

  await page.locator('input[type="email"]').fill(email)
  await page.locator('input[name="password"]').fill(password)
  await page.getByRole('button', { name: 'Entrar' }).click()
  await page.waitForURL(/\/admin(?!\/login)/, { timeout: 20000 })
  results.login = page.url().includes('/admin') && !page.url().includes('/admin/login')

  await page.getByRole('button', { name: 'Sair' }).click()
  await page.waitForURL(/\/admin\/login/, { timeout: 15000 })
  results.logout = true

  await page.goto(`${base}/admin/settings`, { waitUntil: 'domcontentloaded' })
  results.settingsProtected = page.url().includes('/admin/login')

  // Fase 3 — admin flows
  await page.goto(`${base}/admin/login`, { waitUntil: 'networkidle' })
  await page.locator('input[type="email"]').fill(email)
  await page.locator('input[name="password"]').fill(password)
  await page.getByRole('button', { name: 'Entrar' }).click()
  await page.waitForURL(/\/admin(?!\/login)/, { timeout: 20000 })

  const testName = `QA-PROD-SMOKE-${Date.now()}`
  await page.goto(`${base}/admin/products/new`, { waitUntil: 'networkidle' })
  await page.getByText('Nome *').locator('..').locator('input').fill(testName)
  await page.getByText('Slug (opcional)').locator('..').locator('input').fill(`qa-prod-smoke-${Date.now()}`)
  await page.getByText('Categoria *').locator('..').locator('input').fill('Camisas')
  await page.getByText('Preço *').locator('..').locator('input').fill('99')
  await page.getByText('Descrição *').locator('..').locator('textarea').fill('Smoke prod')
  await page.locator('select').selectOption('active')
  await page.getByText('SKU *').locator('..').locator('input').fill(`QA-PROD-${Date.now()}`)
  await page.locator('input[type="url"]').fill('https://cdn.exemplo.com/qa-prod-smoke.jpg')
  await page.getByRole('button', { name: 'Adicionar URL' }).click()
  await page.waitForTimeout(500)
  await page.getByRole('button', { name: 'Criar produto' }).click()
  await page.waitForTimeout(3000)
  await page.goto(`${base}/admin/products`, { waitUntil: 'networkidle' })
  results.crudCreate = (await page.getByText(testName).count()) > 0

  await page.goto(`${base}/admin/import`, { waitUntil: 'networkidle' })
  await page.locator('#csv-file').setInputFiles(csv)
  await page.getByRole('button', { name: 'Próximo' }).click()
  await page.waitForTimeout(5000)
  const canImport = await page.getByRole('button', { name: 'Confirmar importação' }).isEnabled()
  if (canImport) {
    await page.getByRole('button', { name: 'Confirmar importação' }).click()
    await page.waitForTimeout(10000)
  }
  await page.goto(`${base}/products/qa-e2e-import-1`, { waitUntil: 'networkidle' })
  results.csvImport = (await page.getByText('QA-E2E Importado').count()) > 0

  await page.goto(`${base}/admin/settings`, { waitUntil: 'networkidle' })
  await page.locator('input[type="file"]').first().setInputFiles(png)
  await page.waitForTimeout(3000)
  const saveBtn = page.getByRole('button', { name: /Salvar/i }).first()
  if (await saveBtn.count()) await saveBtn.click()
  await page.waitForTimeout(3000)
  const favResp = await page.goto(`${base}/api/branding/favicon-32.png`)
  results.uploadLogo = favResp?.status() === 200

  await page.goto(`${base}/products/camisa-sao-paulo-2024`, { waitUntil: 'networkidle' }).catch(() =>
    page.goto(`${base}/products`, { waitUntil: 'networkidle' })
  )
  await page.getByRole('button', { name: /Adicionar ao Carrinho/i }).first().click().catch(() => {})
  await page.goto(`${base}/cart`, { waitUntil: 'networkidle' })
  await page.evaluate(() => {
    window.__smokeWaUrl = null
    window.open = (url) => {
      window.__smokeWaUrl = url
      return null
    }
  })
  await page.getByRole('button', { name: 'Finalizar via WhatsApp' }).click().catch(() => {})
  const waUrl = await page.evaluate(() => window.__smokeWaUrl)
  const decoded = waUrl ? decodeURIComponent(String(waUrl)) : ''
  results.whatsapp =
    decoded.includes('Pedido #TEMP-') && decoded.includes('Total:')

  // cleanup produto smoke
  await page.goto(`${base}/admin/products`, { waitUntil: 'networkidle' })
  const row = page.locator('tr', { hasText: testName })
  if (await row.count()) {
    await row.getByRole('button', { name: 'Deletar' }).click()
    await page.waitForTimeout(2000)
  }

  const summary = Object.fromEntries(
    Object.entries(results).map(([k, v]) => [k, v ? 'PASS' : 'FAIL'])
  )
  fs.writeFileSync(path.join(root, 'test-data/e2e/prod-smoke-results.json'), JSON.stringify(summary, null, 2))
  console.log(JSON.stringify(summary, null, 2))
  const failed = Object.values(summary).filter((v) => v === 'FAIL')
  if (failed.length) process.exit(1)
} catch (e) {
  console.error('SMOKE_ERROR', e.message)
  process.exit(1)
} finally {
  await browser.close()
}
