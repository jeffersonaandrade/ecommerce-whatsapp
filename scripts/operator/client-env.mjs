/**
 * Carrega env de deploy/clients/<slug>/.env.local sem copiar para a raiz.
 * Nunca imprime valores. Não usa fallback para outro cliente.
 */
import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../..')
const slugPattern = /^[a-z0-9]+(?:-[a-z0-9]+)*$/

export function getClientEnvPath(slug) {
  return path.join(root, 'deploy/clients', slug, '.env.local')
}

export function assertValidSlug(slug) {
  if (!slug?.trim()) {
    throw new Error('Slug do cliente é obrigatório.')
  }
  if (!slugPattern.test(slug) || slug.includes('..')) {
    throw new Error(`Slug inválido: ${slug}`)
  }
}

export function clientEnvExists(slug) {
  assertValidSlug(slug)
  return fs.existsSync(getClientEnvPath(slug))
}

function parseEnvLines(content) {
  const entries = []
  for (const line of content.split(/\r?\n/)) {
    const trimmed = line.trim()
    if (!trimmed || trimmed.startsWith('#')) continue
    const m = trimmed.match(/^([A-Za-z_][A-Za-z0-9_]*)=(.*)$/)
    if (!m) continue
    let value = m[2].trim()
    if (
      (value.startsWith('"') && value.endsWith('"')) ||
      (value.startsWith("'") && value.endsWith("'"))
    ) {
      value = value.slice(1, -1)
    }
    entries.push([m[1], value])
  }
  return entries
}

/**
 * @param {string} slug
 * @param {{ override?: boolean }} options
 */
export function loadClientEnv(slug, options = {}) {
  const { override = true } = options
  assertValidSlug(slug)
  const envPath = getClientEnvPath(slug)
  if (!fs.existsSync(envPath)) {
    throw new Error(
      `Env do cliente não encontrada: deploy/clients/${slug}/.env.local\n` +
        `Crie a partir de env.example. Não há fallback para outro cliente.`
    )
  }

  for (const [key, value] of parseEnvLines(fs.readFileSync(envPath, 'utf8'))) {
    if (!override && process.env[key] !== undefined) continue
    process.env[key] = value
  }

  return envPath
}

export function envForChildProcess(slug) {
  assertValidSlug(slug)
  const envPath = getClientEnvPath(slug)
  if (!fs.existsSync(envPath)) {
    throw new Error(`Env do cliente não encontrada: deploy/clients/${slug}/.env.local`)
  }

  // Apenas vars de sistema do processo pai + env do slug (sem vazar .env.local da raiz).
  const SYSTEM_KEYS = new Set([
    'PATH',
    'PATHEXT',
    'SystemRoot',
    'TEMP',
    'TMP',
    'USERPROFILE',
    'APPDATA',
    'LOCALAPPDATA',
    'ComSpec',
    'WINDIR',
    'HOMEDRIVE',
    'HOMEPATH',
    'OS',
    'PROCESSOR_ARCHITECTURE',
    'NUMBER_OF_PROCESSORS',
    'PROGRAMFILES',
    'PROGRAMW6432',
    'PUBLIC',
    'SYSTEMDRIVE',
    'NODE',
    'NODE_PATH',
    'NODE_OPTIONS',
    'PLAYWRIGHT_BROWSERS_PATH',
  ])

  const merged = {}
  for (const [key, value] of Object.entries(process.env)) {
    if (SYSTEM_KEYS.has(key) || key.startsWith('npm_')) {
      merged[key] = value
    }
  }

  for (const [key, value] of parseEnvLines(fs.readFileSync(envPath, 'utf8'))) {
    merged[key] = value
  }
  return merged
}
