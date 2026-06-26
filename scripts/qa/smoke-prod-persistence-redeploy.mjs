/**
 * Teste persistência settings pós-redeploy Netlify.
 * Uso:
 *   node scripts/smoke-prod-persistence-redeploy.mjs modify
 *   (trigger deploy manual ou: node ... deploy)
 *   node scripts/smoke-prod-persistence-redeploy.mjs verify
 *   node scripts/smoke-prod-persistence-redeploy.mjs all
 */
import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'
import { chromium } from 'playwright'
import { execSync } from 'child_process'

const root = path.join(path.dirname(fileURLToPath(import.meta.url)), '../..')
const base = 'https://loja-whats.netlify.app'
const statePath = path.join(root, 'test-data/e2e/prod-persistence-state.json')
const reportPath = path.join(root, 'test-data/e2e/prod-persistence-report.json')

function loadEnv() {
  const env = {}
  for (const line of fs.readFileSync(path.join(root, '.env.local'), 'utf8').split(/\r?\n/)) {
    const m = line.match(/^([A-Za-z_][A-Za-z0-9_]*)=(.*)$/)
    if (m) env[m[1]] = m[2].trim()
  }
  return env
}

async function login(page, email, password) {
  await page.goto(`${base}/admin/login`, { waitUntil: 'networkidle' })
  await page.locator('input[type="email"]').fill(email)
  await page.locator('input[name="password"]').fill(password)
  await page.getByRole('button', { name: 'Entrar' }).click()
  await page.waitForURL(/\/admin(?!\/login)/, { timeout: 25000 })
}

async function readSettingsFields(page) {
  await page.goto(`${base}/admin/settings`, { waitUntil: 'networkidle' })
  const favResp = await page.request.get(`${base}/api/branding/favicon-32.png`)
  return {
    storeName: await page.locator('input[name="storeName"]').inputValue(),
    whatsappPhone: await page.locator('input[name="whatsappPhone"]').inputValue(),
    phone: await page.locator('input[name="phone"]').inputValue(),
    description: await page.locator('textarea[name="description"]').inputValue(),
    faviconStatus: favResp.status(),
  }
}

async function modifySettings(page) {
  const before = await readSettingsFields(page)
  const changedDescription = `Persist redeploy ${new Date().toISOString()}`
  await page.locator('textarea[name="description"]').fill(changedDescription)
  await page.getByRole('button', { name: 'Salvar configurações' }).click()
  await page.getByText('Configurações salvas.').waitFor({ timeout: 20000 })

  const afterSave = await readSettingsFields(page)
  const state = {
    timestamp: new Date().toISOString(),
    before,
    changed: { description: changedDescription },
    afterSave,
    saveConfirmed: afterSave.description === changedDescription,
  }
  fs.writeFileSync(statePath, JSON.stringify(state, null, 2))
  return state
}

function triggerDeploy() {
  execSync('git commit --allow-empty -m "chore: trigger redeploy for settings persistence QA"', {
    cwd: root,
    stdio: 'inherit',
  })
  execSync('git push origin master', { cwd: root, stdio: 'inherit' })
}

async function waitForDeployReady(page, maxMs = 180000) {
  const start = Date.now()
  let lastStatus = 0
  while (Date.now() - start < maxMs) {
    const resp = await page.request.get(`${base}/`)
    lastStatus = resp.status()
    if (lastStatus === 200) {
      await new Promise((r) => setTimeout(r, 15000))
      return true
    }
    await new Promise((r) => setTimeout(r, 10000))
  }
  throw new Error(`Deploy wait timeout (last status ${lastStatus})`)
}

async function verifyAfterRedeploy(page, email, password, state) {
  await login(page, email, password)
  const afterRedeploy = await readSettingsFields(page)

  const homeResp = await page.goto(`${base}/`, { waitUntil: 'networkidle' })
  const productsResp = await page.goto(`${base}/products`, { waitUntil: 'networkidle' })
  const homeOk = homeResp?.status() === 200
  const productsOk = productsResp?.status() === 200 && (await page.locator('body').innerText()).includes('produto')

  await page.getByRole('button', { name: 'Sair' }).click()
  await page.waitForURL(/\/admin\/login/, { timeout: 15000 })
  await login(page, email, password)
  const loginOk = page.url().includes('/admin') && !page.url().includes('/admin/login')

  const settingsPersisted = afterRedeploy.description === state.changed.description

  const report = {
    testedAt: new Date().toISOString(),
    before: state.before,
    changed: state.changed,
    afterSave: state.afterSave,
    afterRedeploy,
    results: {
      saveConfirmed: state.saveConfirmed,
      settingsPersisted,
      vitrineHomeOk: homeOk,
      vitrineProductsOk: productsOk,
      loginOk,
    },
    overall: settingsPersisted && homeOk && productsOk && loginOk ? 'PASS' : 'FAIL',
  }
  fs.writeFileSync(reportPath, JSON.stringify(report, null, 2))
  console.log(JSON.stringify(report, null, 2))
  if (report.overall !== 'PASS') process.exit(1)
}

const env = loadEnv()
const email = env.ADMIN_EMAIL
const password = env.ADMIN_PASSWORD
const phase = process.argv[2] ?? 'all'

if (!email || !password) {
  console.error('Missing ADMIN_EMAIL or ADMIN_PASSWORD in .env.local')
  process.exit(1)
}

const browser = await chromium.launch({ headless: true })
const page = await browser.newPage()

try {
  if (phase === 'modify') {
    await login(page, email, password)
    const state = await modifySettings(page)
    console.log(JSON.stringify({ phase: 'modify', ...state }, null, 2))
  } else if (phase === 'deploy') {
    triggerDeploy()
    console.log('Deploy triggered via empty commit push')
  } else if (phase === 'verify') {
    if (!fs.existsSync(statePath)) throw new Error('Missing state file — run modify first')
    const state = JSON.parse(fs.readFileSync(statePath, 'utf8'))
    await verifyAfterRedeploy(page, email, password, state)
  } else if (phase === 'all') {
    await login(page, email, password)
    const state = await modifySettings(page)
    await browser.close()
    triggerDeploy()
    const browser2 = await chromium.launch({ headless: true })
    const page2 = await browser2.newPage()
    try {
      await waitForDeployReady(page2)
      await verifyAfterRedeploy(page2, email, password, state)
    } finally {
      await browser2.close()
    }
    process.exit(0)
  } else {
    throw new Error(`Unknown phase: ${phase}`)
  }
} catch (e) {
  console.error('PERSISTENCE_ERROR', e.message)
  process.exit(1)
} finally {
  await browser.close()
}
