/**
 * Executa comando com env de deploy/clients/<slug>/.env.local (sem copiar para raiz).
 *
 * npm run dev:client -- sportwear
 * npm run build:client -- unitsports
 * npm run start:client -- sportwear
 * npm run test:e2e:smoke:client -- unitsports
 */
import { spawn } from 'node:child_process'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import { assertValidSlug, envForChildProcess, getClientEnvPath } from './client-env.mjs'

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../..')

const COMMANDS = {
  dev: { cmd: process.platform === 'win32' ? 'npx.cmd' : 'npx', args: ['next', 'dev'] },
  build: { cmd: process.platform === 'win32' ? 'npm.cmd' : 'npm', args: ['run', 'build'] },
  start: { cmd: process.platform === 'win32' ? 'npx.cmd' : 'npx', args: ['next', 'start'] },
  smoke: {
    cmd: process.platform === 'win32' ? 'node.exe' : 'node',
    args: ['scripts/qa/smoke-regression-playwright.mjs'],
  },
}

function fail(message) {
  console.error(message)
  process.exit(1)
}

const mode = process.argv[2]?.trim()
const slug = process.argv[3]?.trim()

if (!mode || !slug) {
  fail('Uso: node scripts/operator/run-with-client-env.mjs <dev|build|start|smoke> <slug>')
}

if (!COMMANDS[mode]) {
  fail(`Modo inválido: ${mode}. Use: dev, build, start ou smoke.`)
}

try {
  assertValidSlug(slug)
} catch (e) {
  fail(e.message)
}

const envPath = getClientEnvPath(slug)
let childEnv
try {
  childEnv = envForChildProcess(slug)
} catch (e) {
  fail(e.message)
}

const baseUrl =
  process.env.PLAYWRIGHT_BASE_URL?.trim() ||
  childEnv.PLAYWRIGHT_BASE_URL?.trim() ||
  childEnv.QA_BASE_URL?.trim() ||
  childEnv.NEXT_PUBLIC_SITE_URL?.trim() ||
  'http://localhost:3000'

if (mode === 'smoke') {
  childEnv.PLAYWRIGHT_BASE_URL = baseUrl
}

console.error(`[client-env] slug=${slug} env=${path.relative(root, envPath)} mode=${mode}`)

const { cmd, args } = COMMANDS[mode]
const child = spawn(cmd, args, {
  cwd: root,
  env: childEnv,
  stdio: 'inherit',
  shell: process.platform === 'win32',
})

child.on('exit', (code, signal) => {
  if (signal) {
    process.kill(process.pid, signal)
    return
  }
  process.exit(code ?? 1)
})

child.on('error', (err) => {
  console.error(err.message)
  process.exit(1)
})
