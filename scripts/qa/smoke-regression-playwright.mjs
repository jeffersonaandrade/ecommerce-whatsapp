/**
 * Smoke regressivo — Playwright (rotas públicas + admin login).
 * Uso: PLAYWRIGHT_BASE_URL=http://localhost:3003 node scripts/qa/smoke-regression-playwright.mjs
 */
import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'
import { chromium } from 'playwright'

const root = path.join(path.dirname(fileURLToPath(import.meta.url)), '../..')
const base = process.env.PLAYWRIGHT_BASE_URL ?? 'http://localhost:3003'
const headless = process.env.PLAYWRIGHT_HEADLESS !== 'false'

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

const report = { base, cases: {}, startedAt: new Date().toISOString() }

function record(id, ok, note = '') {
  report.cases[id] = { status: ok ? 'PASS' : 'FAIL', note }
}

async function smokePublic(page) {
  const routes = [
    ['home', '/'],
    ['plp', '/products'],
    ['cart', '/cart'],
    ['admin-login', '/admin/login'],
  ]

  for (const [id, route] of routes) {
    try {
      const resp = await page.goto(`${base}${route}`, { waitUntil: 'domcontentloaded', timeout: 20000 })
      record(id, Boolean(resp && resp.status() < 500), resp ? String(resp.status()) : 'no response')
    } catch (e) {
      record(id, false, e.message)
    }
  }

  try {
    await page.goto(`${base}/products`, { waitUntil: 'networkidle', timeout: 20000 })
    const productCards = await page.locator('a[href^="/products/"]').count()
    record('plp-products', productCards > 0, `cards=${productCards}`)
    const href = await page.locator('a[href^="/products/"]').first().getAttribute('href')
    if (!href) throw new Error('PLP sem produtos')
    const resp = await page.goto(`${base}${href}`, { waitUntil: 'domcontentloaded' })
    record('pdp', Boolean(resp && resp.status() < 500), href)
  } catch (e) {
    record('pdp', false, e.message)
    if (!report.cases['plp-products']) record('plp-products', false, e.message)
  }
}

/** Regressão multi-client: hero, footer categorias, branding — client-agnostic. */
async function smokeHomeRegression(page) {
  try {
    await page.goto(`${base}/`, { waitUntil: 'domcontentloaded', timeout: 20000 })

    const header = page.locator('header')
    const headerImg = await header.locator('img[alt]').count()
    const headerText = await header.locator('span').filter({ hasText: /\S/ }).count()
    const hasHeaderBrand = headerImg > 0 || headerText > 0
    record(
      'home-store-name',
      hasHeaderBrand,
      hasHeaderBrand ? `img=${headerImg} text=${headerText}` : 'sem marca no header'
    )
    record('header-branding', hasHeaderBrand, hasHeaderBrand ? 'ok' : 'sem logo/nome')

    const hasCarousel = (await page.locator('[data-testid="banner-carousel"]').count()) > 0
    const hasHeroImg = (await page.locator('main section img, section img').count()) > 0
    const hasHeadline = (await page.locator('h1').filter({ hasText: /\S/ }).count()) > 0
    const heroOk = hasCarousel || hasHeroImg || hasHeadline
    record(
      'home-hero-visual',
      heroOk,
      JSON.stringify({ carousel: hasCarousel, img: hasHeroImg, h1: hasHeadline })
    )

    const homeCategoryLinks = await page.locator('a[href*="category="]').count()
    record('home-categories', homeCategoryLinks > 0, `links=${homeCategoryLinks}`)

    const footerCatLinks = await page
      .locator('footer a[href^="/products?category="]')
      .count()
    record('footer-categories', footerCatLinks > 0, `links=${footerCatLinks}`)
  } catch (e) {
    for (const id of [
      'home-store-name',
      'header-branding',
      'home-hero-visual',
      'home-categories',
      'footer-categories',
    ]) {
      if (!report.cases[id]) record(id, false, e.message)
    }
  }
}

async function smokeAdmin(page, email, password) {
  await page.goto(`${base}/admin/login`, { waitUntil: 'domcontentloaded' })
  await page.locator('input[type="email"]').fill(email)
  await page.locator('input[type="password"]').fill(password)
  await page.getByRole('button', { name: 'Entrar' }).click()
  await page.waitForURL(/\/admin(?!\/login)/, { timeout: 20000 })

  const adminRoutes = [
    ['admin-products', '/admin/products'],
    ['admin-import', '/admin/import'],
    ['admin-banners', '/admin/banners'],
    ['admin-benefits', '/admin/content/benefits'],
    ['admin-settings', '/admin/settings'],
    ['admin-commercial', '/admin/comercial'],
  ]

  for (const [id, route] of adminRoutes) {
    try {
      const resp = await page.goto(`${base}${route}`, { waitUntil: 'domcontentloaded', timeout: 20000 })
      const body = await page.locator('body').innerText()
      const unauthorized = /Não autenticado|unauthorized|login/i.test(body) && route !== '/admin/login'
      record(id, Boolean(resp && resp.status() < 500 && !unauthorized), resp ? String(resp.status()) : '')
    } catch (e) {
      record(id, false, e.message)
    }
  }
}

async function checkSecurityHeaders(page) {
  const resp = await page.goto(`${base}/`, { waitUntil: 'domcontentloaded' })
  const headers = resp?.headers() ?? {}
  const has = (k) => Boolean(headers[k.toLowerCase()])
  const ok = has('x-content-type-options') && has('referrer-policy') && has('x-frame-options')
  record('security-headers', ok, JSON.stringify({
    nosniff: headers['x-content-type-options'],
    referrer: headers['referrer-policy'],
    frame: headers['x-frame-options'],
  }))
}

const env = loadEnv()
const email = env.ADMIN_EMAIL
const password = env.ADMIN_PASSWORD

const browser = await chromium.launch({ headless })
const page = await browser.newPage()

try {
  await smokePublic(page)
  await smokeHomeRegression(page)
  await checkSecurityHeaders(page)

  if (email && password) {
    await smokeAdmin(page, email, password)
  } else {
    record('admin-auth', false, 'ADMIN_EMAIL/ADMIN_PASSWORD ausentes')
  }

  const values = Object.values(report.cases)
  report.summary = {
    pass: values.filter((v) => v.status === 'PASS').length,
    fail: values.filter((v) => v.status === 'FAIL').length,
  }
  report.finishedAt = new Date().toISOString()

  const out = path.join(root, 'test-data/e2e/smoke-regression-results.json')
  fs.mkdirSync(path.dirname(out), { recursive: true })
  fs.writeFileSync(out, JSON.stringify(report, null, 2))

  console.log(JSON.stringify(report, null, 2))
  if (report.summary.fail > 0) process.exit(1)
} catch (e) {
  console.error('SMOKE_ERROR', e.message)
  process.exit(1)
} finally {
  await browser.close()
}
