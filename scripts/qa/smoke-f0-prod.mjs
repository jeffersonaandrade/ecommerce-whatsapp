/**
 * Smoke Fase 0 produção — não loga secrets.
 */
import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'
import { chromium } from 'playwright'

const root = path.join(path.dirname(fileURLToPath(import.meta.url)), '../..')
const base = 'https://loja-whats.netlify.app'

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
  console.error('Missing ADMIN_EMAIL or ADMIN_PASSWORD')
  process.exit(1)
}

const results = {}
const browser = await chromium.launch({ headless: true })
const page = await browser.newPage()

try {
  await page.goto(`${base}/`, { waitUntil: 'networkidle' })
  results.home200 = true
  results.homeNoCuradoria = (await page.getByText('Curadoria').count()) === 0
  results.homeChipsOrCategories =
    (await page.getByRole('link', { name: 'Shorts' }).count()) > 0
  results.homeNoQaProduct =
    (await page.getByText('QA-E2E Importado').count()) === 0 &&
    (await page.getByText('Camisa Premium QA').count()) === 0

  await page.goto(`${base}/products`, { waitUntil: 'domcontentloaded' })
  results.products200 = page.url().includes('/products')
  results.productsFilters = (await page.getByRole('link', { name: 'Shorts' }).count()) > 0

  await page.goto(`${base}/products?category=Shorts`, { waitUntil: 'domcontentloaded' })
  results.shortsFilter = (await page.getByRole('heading', { name: 'Shorts' }).count()) > 0

  await page.goto(`${base}/admin/login`, { waitUntil: 'networkidle' })
  results.adminLogin200 = page.url().includes('/admin/login')

  await page.locator('input[type="email"]').fill(email)
  await page.locator('input[name="password"]').fill(password)
  await page.getByRole('button', { name: 'Entrar' }).click()
  await page.waitForURL(/\/admin(?!\/login)/, { timeout: 25000 })
  results.adminLogin = !page.url().includes('/admin/login')

  await page.goto(`${base}/admin/products`, { waitUntil: 'networkidle' })
  const novoBtn = page.getByRole('link', { name: '+ Novo Produto' })
  results.novoProdutoVisible = await novoBtn.isVisible()
  const color = await novoBtn.evaluate((el) => getComputedStyle(el).color)
  results.novoProdutoDarkText = color === 'rgb(17, 17, 17)' || color === 'rgb(0, 0, 0)'

  const allPass = Object.values(results).every(Boolean)
  console.log(JSON.stringify({ base, results, allPass }, null, 2))
  process.exit(allPass ? 0 : 1)
} catch (err) {
  console.error(JSON.stringify({ error: String(err), results }, null, 2))
  process.exit(1)
} finally {
  await browser.close()
}
