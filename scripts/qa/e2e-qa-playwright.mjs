/**
 * QA E2E runner — Playwright UI (E2E-4..E2E-9). Não loga secrets.
 */
import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'
import { chromium } from 'playwright'

const root = path.join(path.dirname(fileURLToPath(import.meta.url)), '../..')
const base = 'http://localhost:3000'

function loadEnv() {
  const env = {}
  for (const line of fs.readFileSync(path.join(root, '.env.local'), 'utf8').split(/\r?\n/)) {
    const m = line.match(/^([A-Za-z_][A-Za-z0-9_]*)=(.*)$/)
    if (m) env[m[1]] = m[2].trim()
  }
  return env
}

function statBaseline() {
  const paths = ['storage/store-settings.json', 'storage/catalog.json', 'storage/branding']
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
        fs.readdirSync(p).map((n) => [n, fs.statSync(path.join(p, n)).mtimeMs])
      )
    } else out[rel] = st.mtimeMs
  }
  return out
}

const env = loadEnv()
const email = env.ADMIN_EMAIL
const password = env.ADMIN_PASSWORD
if (!email || !password) process.exit(1)

const results = {}
const png = path.join(root, 'test-data/e2e/qa-product.png')
const csv = path.join(root, 'test-data/e2e/csv-qa-e2e.csv')
const slug = 'qa-e2e-produto-completo'

async function login(page) {
  await page.goto(`${base}/admin/login`)
  await page.locator('input[type="email"]').fill(email)
  await page.locator('input[type="password"]').fill(password)
  await page.getByRole('button', { name: 'Entrar' }).click()
  await page.waitForURL(/\/admin(?!\/login)/, { timeout: 15000 })
}

async function fillProductForm(page) {
  await page.getByText('Nome *').locator('..').locator('input').fill('QA-E2E Produto Completo')
  await page.getByText('Slug (opcional)').locator('..').locator('input').fill(slug)
  await page.getByText('Categoria *').locator('..').locator('input').fill('Camisas')
  await page.getByText('Preço *').locator('..').locator('input').fill('139.99')
  await page.getByText('Preço promocional').locator('..').locator('input').fill('119.99')
  await page.locator('select').selectOption('active')
  await page.getByText('Descrição curta (opcional)').locator('..').locator('input').fill('Descricao E2E curta')
  await page.getByText('Descrição *').locator('..').locator('textarea').fill('Descricao E2E longa')
  await page.getByText('Tamanho').locator('..').locator('input').fill('M')
  await page.getByText('Cor').locator('..').locator('input').fill('Azul')
  await page.getByText('SKU *').locator('..').locator('input').fill('QA-E2E-CRUD-001')
  await page.getByText('Estoque').locator('..').locator('input').fill('10')
}

async function addProductImage(page) {
  await page.locator('input[type="file"][accept*="image"]').setInputFiles(png)
  const uploaded = await page
    .waitForFunction(() => document.body.innerText.includes('1/5 imagens'), null, { timeout: 20000 })
    .then(() => true)
    .catch(() => false)
  if (!uploaded) {
    await page.locator('input[type="url"]').fill('https://images.unsplash.com/photo-1612872087720-bb876e2e67d1?w=500')
    await page.getByRole('button', { name: 'Adicionar URL' }).click()
    await page.waitForTimeout(800)
  }
}

const browser = await chromium.launch({ headless: true })
const context = await browser.newContext({ viewport: { width: 1280, height: 720 } })
const page = await context.newPage()
page.on('dialog', (d) => d.accept())

try {
  await login(page)

  // E2E-4
  await page.goto(`${base}/admin/products/new`, { waitUntil: 'networkidle' })
  await fillProductForm(page)
  await addProductImage(page)
  await page.getByRole('button', { name: 'Criar produto' }).click()
  await page.waitForTimeout(4000)
  const createErrors = await page.locator('.border-red-200 .text-red-800').allTextContents()
  if (createErrors.length) throw new Error(`E2E-4 create errors: ${createErrors.join('; ')}`)

  await page.goto(`${base}/admin/products`, { waitUntil: 'networkidle' })
  await page.getByText('QA-E2E Produto Completo').waitFor({ timeout: 15000 })

  await page.goto(`${base}/products/${slug}`, { waitUntil: 'networkidle' })
  await page.getByRole('heading', { name: 'QA-E2E Produto Completo' }).waitFor()

  await page.goto(`${base}/products`, { waitUntil: 'networkidle' })
  const onPlp = (await page.getByText('QA-E2E Produto Completo').count()) > 0

  await page.goto(`${base}/products/${slug}`, { waitUntil: 'networkidle' })
  await page.getByRole('button', { name: /Adicionar ao Carrinho/i }).click()
  await page.goto(`${base}/cart`, { waitUntil: 'networkidle' })
  await page.getByText('QA-E2E Produto Completo').waitFor()

  await page.goto(`${base}/admin/products`, { waitUntil: 'networkidle' })
  const editLink = page.locator('tr', { hasText: 'QA-E2E Produto Completo' }).getByRole('link', { name: 'Editar' })
  await editLink.click()
  await page.getByText('Nome *').locator('..').locator('input').fill('QA-E2E Produto Editado')
  await page.getByText('Preço *').locator('..').locator('input').fill('149.99')
  await page.getByText('Estoque').locator('..').locator('input').fill('5')
  await addProductImage(page)
  await page.getByRole('button', { name: 'Salvar alterações' }).click()
  await page.waitForTimeout(3000)

  await page.goto(`${base}/products/qa-e2e-produto-completo`, { waitUntil: 'networkidle' })
  const pdp404 = (await page.getByText(/não encontrado|404/i).count()) > 0

  await page.goto(`${base}/admin/products`, { waitUntil: 'networkidle' })
  await page.locator('tr', { hasText: 'QA-E2E Produto Editado' }).getByRole('button', { name: 'Deletar' }).click()
  await page.waitForTimeout(3000)

  await page.goto(`${base}/admin/products`, { waitUntil: 'networkidle' })
  const goneAdmin = (await page.getByText('QA-E2E Produto Editado').count()) === 0
  await page.goto(`${base}/products/${slug}`, { waitUntil: 'networkidle' })
  const gonePdp = (await page.getByText(/não encontrado|404/i).count()) > 0

  results['E2E-4'] = onPlp && goneAdmin && gonePdp && !pdp404 ? 'PASS' : 'PARCIAL'

  // E2E-5
  await page.goto(`${base}/admin/products/new`, { waitUntil: 'networkidle' })
  await page.getByText('Nome *').locator('..').locator('input').fill('QA-E2E Data URL')
  await page.getByText('Descrição *').locator('..').locator('textarea').fill('teste data url')
  await page.getByText('Categoria *').locator('..').locator('input').fill('Camisas')
  await page.getByText('Preço *').locator('..').locator('input').fill('10')
  await page.getByText('SKU *').locator('..').locator('input').fill('QA-E2E-DATAURL')
  const urlField = page.locator('input[placeholder*="https"]').first()
  await urlField.fill('data:image/png;base64,AAAA')
  await page.getByRole('button', { name: /Adicionar URL/i }).click()
  const blocked = await page.getByText(/base64|não são permitidas/i).isVisible()
  await page.getByRole('button', { name: 'Criar produto' }).click()
  await page.waitForTimeout(2000)
  await page.goto(`${base}/admin/products`, { waitUntil: 'networkidle' })
  const dataUrlNotSaved = (await page.getByText('QA-E2E Data URL').count()) === 0
  results['E2E-5'] = blocked && dataUrlNotSaved ? 'PASS' : blocked ? 'PARCIAL' : 'FAIL'

  // E2E-6
  await page.goto(`${base}/admin/import`, { waitUntil: 'networkidle' })
  await page.locator('#csv-file').setInputFiles(csv)
  await page.getByRole('button', { name: 'Próximo' }).click()
  await page.waitForTimeout(5000)
  const previewOk = (await page.getByText('QA-E2E Importado').count()) > 0
  await page.getByRole('button', { name: 'Confirmar importação' }).click()
  await page.waitForTimeout(10000)
  await page.goto(`${base}/products/qa-e2e-import-1`, { waitUntil: 'networkidle' })
  const importPdp = (await page.getByText('QA-E2E Importado').count()) > 0
  results['E2E-6'] = previewOk && importPdp ? 'PASS' : previewOk ? 'PARCIAL' : 'FAIL'

  // E2E-7
  await page.goto(`${base}/products/qa-e2e-import-1`, { waitUntil: 'networkidle' })
  await page.getByRole('button', { name: /Adicionar ao Carrinho/i }).click()
  await page.goto(`${base}/cart`, { waitUntil: 'networkidle' })
  await page.getByText('QA-E2E Importado').waitFor({ timeout: 10000 })
  await page.evaluate(() => {
    window.__e2eWaUrl = null
    window.open = (url) => {
      window.__e2eWaUrl = url
      return null
    }
  })
  await page.getByRole('button', { name: 'Finalizar via WhatsApp' }).click()
  await page.waitForTimeout(500)
  const waUrl = await page.evaluate(() => window.__e2eWaUrl)
  const decoded = waUrl ? decodeURIComponent(String(waUrl)) : ''
  const waChecks = {
    hasTemp: /Pedido #TEMP-\d{8}-\d{4}/.test(decoded),
    hasProduct: decoded.includes('QA-E2E Importado'),
    hasSku: decoded.includes('QA-E2E-IMP'),
    hasTotal: decoded.includes('Total:'),
    hasLink: decoded.includes('loja-whats.netlify.app') || decoded.includes('/products/'),
  }
  const waPass = waChecks.hasTemp && waChecks.hasProduct && waChecks.hasSku && waChecks.hasTotal
  results['E2E-7'] = waPass ? 'PASS' : decoded ? 'PARCIAL' : 'FAIL'
  results['E2E-7_detail'] = waChecks

  // E2E-8
  let regOk = true
  const desktopRoutes = ['/', '/products', '/products/qa-e2e-import-1', '/cart', '/sobre', '/contato', '/politica-de-trocas', '/maintenance', '/nao-existe-e2e']
  for (const r of desktopRoutes) {
    const resp = await page.goto(`${base}${r}`, { waitUntil: 'domcontentloaded' })
    if (!resp || resp.status() >= 500) regOk = false
  }
  await page.setViewportSize({ width: 375, height: 667 })
  for (const r of ['/', '/products', '/cart', '/sobre']) {
    const resp = await page.goto(`${base}${r}`, { waitUntil: 'domcontentloaded' })
    if (!resp || resp.status() >= 500) regOk = false
  }
  results['E2E-8'] = regOk ? 'PASS' : 'FAIL'

  const baseline = JSON.parse(fs.readFileSync(path.join(root, 'test-data/e2e/filesystem-baseline.json'), 'utf8'))
  const after = statBaseline()
  const touched = Object.keys(baseline).filter((k) => JSON.stringify(baseline[k]) !== JSON.stringify(after[k]))
  results['E2E-9'] = touched.length === 0 ? 'PASS' : `FAIL:${touched.join(',')}`

  fs.writeFileSync(path.join(root, 'test-data/e2e/playwright-results.json'), JSON.stringify(results, null, 2))
  console.log(JSON.stringify(results, null, 2))
} catch (e) {
  console.error('RUNNER_ERROR', e.message)
  process.exit(1)
} finally {
  await browser.close()
}
