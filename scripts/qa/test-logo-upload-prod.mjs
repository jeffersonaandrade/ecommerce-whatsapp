/**
 * QA produção — upload logo 2x seguidas (reproduz 500 no reenvio).
 * Não loga secrets.
 */
import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'
import { chromium } from 'playwright'

const root = path.join(path.dirname(fileURLToPath(import.meta.url)), '../..')
const base = process.env.QA_BASE_URL ?? 'https://loja-whats.netlify.app'
const logoPath = path.join(root, 'deploy/branding/logo.jpeg')

function loadEnv() {
  const env = {}
  for (const line of fs.readFileSync(path.join(root, '.env.local'), 'utf8').split(/\r?\n/)) {
    const m = line.match(/^([A-Za-z_][A-Za-z0-9_]*)=(.*)$/)
    if (m) env[m[1]] = m[2].trim()
  }
  return env
}

async function uploadOnce(page, attempt) {
  const postResponses = []
  const handler = (response) => {
    const req = response.request()
    if (req.method() === 'POST') {
      postResponses.push({
        url: response.url().slice(0, 160),
        status: response.status(),
      })
    }
  }
  page.on('response', handler)

  await page.goto(`${base}/admin/settings`, { waitUntil: 'networkidle' })
  await page.locator('#store-logo-file').setInputFiles(logoPath)
  await page.getByRole('button', { name: 'Enviar logo' }).click()

  let outcome = 'unknown'
  try {
    await page
      .getByText(/Logo enviada|Falha ao processar|Internal Server Error/i)
      .waitFor({ timeout: 45000 })
    const body = await page.locator('body').innerText()
    if (body.includes('Logo enviada')) outcome = 'success'
    else if (body.includes('Falha ao processar')) outcome = 'app_error'
    else outcome = 'other'
  } catch {
    outcome = 'timeout'
  }

  page.off('response', handler)
  const failedPosts = postResponses.filter((r) => r.status >= 500)
  return { attempt, outcome, postResponses, failedPosts }
}

const env = loadEnv()
if (!env.ADMIN_EMAIL || !env.ADMIN_PASSWORD || !fs.existsSync(logoPath)) {
  console.error('FAIL preflight')
  process.exit(1)
}

const browser = await chromium.launch({ headless: true })
const page = await browser.newPage()

try {
  for (const asset of ['logo.webp', 'favicon-32.png']) {
    const res = await fetch(`${base}/api/branding/${asset}`)
    console.log(`GET /api/branding/${asset} -> ${res.status}`)
  }

  await page.goto(`${base}/admin/login`, { waitUntil: 'domcontentloaded' })
  await page.locator('input[type="email"]').fill(env.ADMIN_EMAIL)
  await page.locator('input[type="password"]').fill(env.ADMIN_PASSWORD)
  await page.getByRole('button', { name: 'Entrar' }).click()
  await page.waitForURL(/\/admin(?!\/login)/, { timeout: 25000 })

  const first = await uploadOnce(page, 1)
  console.log('\n=== Upload 1 ===')
  console.log(JSON.stringify(first, null, 2))

  await page.waitForTimeout(2000)

  const second = await uploadOnce(page, 2)
  console.log('\n=== Upload 2 ===')
  console.log(JSON.stringify(second, null, 2))

  const repro = second.failedPosts.length > 0 || second.outcome !== 'success'
  console.log('\n=== RESULT ===')
  console.log(repro ? 'REPRODUCED_500_OR_FAILURE_ON_SECOND_UPLOAD' : 'SECOND_UPLOAD_OK')
} catch (e) {
  console.error('RUNNER_ERROR', e.message)
  process.exit(1)
} finally {
  await browser.close()
}
