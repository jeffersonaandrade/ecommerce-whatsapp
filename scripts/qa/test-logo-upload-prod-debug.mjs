/**
 * QA produção — captura POST Server Action e mensagens de erro.
 */
import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'
import { chromium } from 'playwright'

const root = path.join(path.dirname(fileURLToPath(import.meta.url)), '../..')
const base = 'https://loja-whats.netlify.app'
const logoPath = path.join(root, 'deploy/branding/logo.jpeg')

function loadEnv() {
  const env = {}
  for (const line of fs.readFileSync(path.join(root, '.env.local'), 'utf8').split(/\r?\n/)) {
    const m = line.match(/^([A-Za-z_][A-Za-z0-9_]*)=(.*)$/)
    if (m) env[m[1]] = m[2].trim()
  }
  return env
}

const env = loadEnv()
const browser = await chromium.launch({ headless: true })
const page = await browser.newPage()
const allResponses = []

page.on('response', (response) => {
  const req = response.request()
  if (req.method() === 'POST' || response.status() >= 400) {
    allResponses.push({
      method: req.method(),
      status: response.status(),
      url: response.url().slice(0, 200),
      actionId: req.headers()['next-action'] ?? null,
    })
  }
})

try {
  await page.goto(`${base}/admin/login`)
  await page.fill('input[type="email"]', env.ADMIN_EMAIL)
  await page.fill('input[type="password"]', env.ADMIN_PASSWORD)
  await page.getByRole('button', { name: 'Entrar' }).click()
  await page.waitForURL(/\/admin(?!\/login)/, { timeout: 25000 })

  for (let i = 1; i <= 2; i += 1) {
    allResponses.length = 0
    await page.goto(`${base}/admin/settings`, { waitUntil: 'networkidle' })
    await page.locator('#store-logo-file').setInputFiles(logoPath)
    await page.locator('img[alt="Preview da logo selecionada"]').waitFor({ timeout: 10000 })
    const fileMeta = await page.evaluate(() => {
      const file = document.querySelector('#store-logo-file')?.files?.[0]
      return file ? { type: file.type, size: file.size, name: file.name } : null
    })
    console.log('fileMeta:', fileMeta)
    await page.getByRole('button', { name: 'Enviar logo' }).click()
    await page.waitForTimeout(12000)

    const sectionError = await page
      .locator('section')
      .filter({ hasText: 'Aparência' })
      .locator('.text-error')
      .first()
      .textContent()
      .catch(() => null)
    const sectionSuccess = await page
      .locator('section')
      .filter({ hasText: 'Aparência' })
      .locator('.text-success')
      .first()
      .textContent()
      .catch(() => null)

    console.log(`\n=== Tentativa ${i} ===`)
    console.log('sectionError:', sectionError?.trim() ?? '(none)')
    console.log('sectionSuccess:', sectionSuccess?.trim()?.slice(0, 120) ?? '(none)')
    console.log('responses:', JSON.stringify(allResponses, null, 2))
  }
} finally {
  await browser.close()
}
