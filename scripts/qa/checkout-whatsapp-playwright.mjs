/**
 * E2E checkout — carrinho → WhatsApp (fluxo principal de venda).
 * Client-agnostic: usa catálogo real do ambiente alvo.
 *
 * Uso:
 *   PLAYWRIGHT_BASE_URL=https://unitsports.netlify.app npm run test:e2e:checkout
 *   npm run test:e2e:checkout:client -- unitsports
 */
import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'
import { chromium } from 'playwright'

const root = path.join(path.dirname(fileURLToPath(import.meta.url)), '../..')
const base = (process.env.PLAYWRIGHT_BASE_URL ?? 'http://localhost:3000').replace(/\/$/, '')
const headless = process.env.PLAYWRIGHT_HEADLESS !== 'false'
const cartStorageKey = 'ecommerce-sports-cart'

const report = { base, cases: {}, startedAt: new Date().toISOString() }

function record(id, ok, note = '') {
  report.cases[id] = { status: ok ? 'PASS' : 'FAIL', note }
}

async function waitForCatalogReady(page) {
  await page.waitForLoadState('domcontentloaded')
  await page.evaluate(
    () =>
      new Promise((resolve) => {
        requestAnimationFrame(() => requestAnimationFrame(() => resolve(undefined)))
      })
  )
  await page.waitForTimeout(300)
}

async function clickAddToCartWithRetry(page, attempts = 6) {
  const addBtn = page.getByRole('button', { name: /Adicionar ao Carrinho/i })

  for (let i = 0; i < attempts; i += 1) {
    if (!(await addBtn.isEnabled().catch(() => false))) {
      await page.waitForTimeout(400)
      continue
    }

    await addBtn.click()

    const stored = await page.evaluate((key) => {
      try {
        const raw = localStorage.getItem(key)
        if (!raw) return false
        const parsed = JSON.parse(raw)
        return Array.isArray(parsed?.items) && parsed.items.length > 0
      } catch {
        return false
      }
    }, cartStorageKey)

    if (stored) return
    await waitForCatalogReady(page)
  }

  throw new Error('Carrinho não persistiu após cliques em Adicionar ao Carrinho')
}

async function clearCart(page) {
  await page.goto(`${base}/`, { waitUntil: 'domcontentloaded' })
  await page.evaluate(
    (key) => {
      localStorage.removeItem(key)
    },
    cartStorageKey
  )
}

async function findAddableProduct(page) {
  await page.goto(`${base}/products`, { waitUntil: 'domcontentloaded', timeout: 20000 })
  const hrefs = await page.locator('a[href^="/products/"]').evaluateAll((anchors) =>
    [...new Set(anchors.map((a) => a.getAttribute('href')).filter(Boolean))]
  )

  if (!hrefs.length) throw new Error('PLP sem links de produto')

  for (const href of hrefs.slice(0, 15)) {
    await page.goto(`${base}${href}`, { waitUntil: 'domcontentloaded', timeout: 20000 })

    const sizeButtons = page
      .locator('fieldset')
      .filter({ has: page.getByText('Tamanho', { exact: true }) })
      .locator('button')
    if ((await sizeButtons.count()) > 0) {
      await sizeButtons.first().click()
    }

    const colorButtons = page
      .locator('fieldset')
      .filter({ has: page.getByText('Cor', { exact: true }) })
      .locator('button')
    if ((await colorButtons.count()) > 0) {
      await colorButtons.first().click()
    }

    await waitForCatalogReady(page)

    const addBtn = page.getByRole('button', { name: /Adicionar ao Carrinho/i })
    if (await addBtn.isEnabled().catch(() => false)) {
      const productName = (await page.locator('h1').first().innerText()).trim()
      if (productName) return { href, productName }
    }
  }

  throw new Error('Nenhum produto com estoque disponível para adicionar ao carrinho')
}

function validateWhatsAppUrl(waUrl, { productName }) {
  if (!waUrl) {
    return { ok: false, reason: 'window.open não capturou URL' }
  }

  let parsed
  try {
    parsed = new URL(waUrl)
  } catch {
    return { ok: false, reason: 'URL WhatsApp inválida' }
  }

  if (parsed.hostname !== 'wa.me') {
    return { ok: false, reason: `host esperado wa.me, recebido ${parsed.hostname}` }
  }

  const phone = parsed.pathname.replace(/^\//, '')
  if (!/^\d{10,15}$/.test(phone)) {
    return { ok: false, reason: `telefone wa.me inválido: ${phone}` }
  }

  const text = parsed.searchParams.get('text') ?? ''
  const decoded = decodeURIComponent(text)

  const checks = {
    hasOrderId: /Pedido #TEMP-\d{8}-\d{4}/.test(decoded),
    hasProductName: decoded.includes(productName),
    hasSkuOrSize: /SKU:|Tamanho:/.test(decoded),
    hasSubtotal: /Subtotal produtos:|Subtotal:/.test(decoded),
    hasTotal: /Total: R\$/.test(decoded),
    hasProductLink: /\/products\/[a-z0-9-]+/.test(decoded),
    hasClosing: decoded.includes('Aguardo retorno.'),
  }

  const failed = Object.entries(checks).filter(([, v]) => !v).map(([k]) => k)
  if (failed.length) {
    return { ok: false, reason: `mensagem incompleta: ${failed.join(', ')}`, checks }
  }

  return { ok: true, checks, phoneDigits: phone }
}

async function runCheckoutFlow(page) {
  await clearCart(page)

  let product
  try {
    product = await findAddableProduct(page)
    record('pdp-addable', true, product.href)
  } catch (e) {
    record('pdp-addable', false, e.message)
    throw e
  }

  try {
    await clickAddToCartWithRetry(page)
    record('pdp-add-to-cart', true, product.productName)
  } catch (e) {
    record('pdp-add-to-cart', false, e.message)
    throw e
  }

  try {
    await page.goto(`${base}/cart`, { waitUntil: 'domcontentloaded', timeout: 20000 })
    await page
      .getByText('Carregando carrinho...')
      .waitFor({ state: 'hidden', timeout: 10000 })
      .catch(() => {})

    const slug = product.href.replace(/^\/products\//, '')
    const hasLine =
      (await page.locator(`a[href="/products/${slug}"]`).count()) > 0 ||
      (await page.getByText(product.productName, { exact: false }).count()) > 0

    if (!hasLine) {
      throw new Error('Linha do produto não encontrada no carrinho')
    }
    record('cart-line-visible', true, slug)
  } catch (e) {
    record('cart-line-visible', false, e.message)
    throw e
  }

  try {
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
    const validation = validateWhatsAppUrl(waUrl, {
      productName: product.productName,
    })

    record(
      'whatsapp-url',
      validation.ok,
      validation.ok
        ? `phone=${validation.phoneDigits}`
        : `${validation.reason}${validation.checks ? ` ${JSON.stringify(validation.checks)}` : ''}`
    )

    if (!validation.ok) throw new Error(validation.reason)
  } catch (e) {
    if (!report.cases['whatsapp-url']) record('whatsapp-url', false, e.message)
    throw e
  }
}

const browser = await chromium.launch({ headless })
const context = await browser.newContext()
const page = await context.newPage()

try {
  await runCheckoutFlow(page)

  const values = Object.values(report.cases)
  report.summary = {
    pass: values.filter((v) => v.status === 'PASS').length,
    fail: values.filter((v) => v.status === 'FAIL').length,
  }
  report.finishedAt = new Date().toISOString()

  const out = path.join(root, 'test-data/e2e/checkout-whatsapp-results.json')
  fs.mkdirSync(path.dirname(out), { recursive: true })
  fs.writeFileSync(out, JSON.stringify(report, null, 2))

  console.log(JSON.stringify(report, null, 2))
  if (report.summary.fail > 0) process.exit(1)
} catch (e) {
  report.finishedAt = new Date().toISOString()
  report.error = e.message
  console.error('CHECKOUT_E2E_ERROR', e.message)
  console.log(JSON.stringify(report, null, 2))
  process.exit(1)
} finally {
  await browser.close()
}
