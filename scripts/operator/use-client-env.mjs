/**
 * LEGADO — copia deploy/clients/<slug>/.env.local → .env.local (raiz).
 *
 * Não usar no fluxo normal. Comandos oficiais:
 *   npm run dev:client -- <slug>
 *   npm run build:client -- <slug>
 *   npm run start:client -- <slug>
 *   npm run test:e2e:smoke:client -- <slug>
 *
 * Uso residual: npm run env:use -- <slug>
 * Nunca imprime valores de env.
 */
import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../..')
const slugPattern = /^[a-z0-9]+(?:-[a-z0-9]+)*$/

function fail(message) {
  console.error(message)
  process.exit(1)
}

const slug = process.argv[2]?.trim()
if (!slug) {
  fail('Uso: npm run env:use -- <slug>\nFluxo normal: npm run dev:client -- <slug>')
}
if (!slugPattern.test(slug) || slug.includes('..')) {
  fail(`Slug inválido: ${slug}`)
}

const clientEnvPath = path.join(root, 'deploy/clients', slug, '.env.local')
const rootEnvPath = path.join(root, '.env.local')
const backupPath = path.join(root, '.env.local.backup')

function main() {
  console.error(
    '[env:use] AVISO: comando legado. Prefira npm run dev:client -- ' +
      slug +
      ' (ou build/start/smoke:client).'
  )

  if (!fs.existsSync(clientEnvPath)) {
    fail(
      `Arquivo deploy/clients/${slug}/.env.local não encontrado.\n` +
        `Copie env.example → deploy/clients/${slug}/.env.local e preencha.\n` +
        `Não copie .env.local da raiz para a pasta do cliente.`
    )
  }

  if (fs.existsSync(rootEnvPath)) {
    fs.copyFileSync(rootEnvPath, backupPath)
  }

  fs.copyFileSync(clientEnvPath, rootEnvPath)
  console.log(`Env do cliente ${slug} copiada para .env.local na raiz (legado).`)
}

try {
  main()
} catch (err) {
  console.error(err.message ?? 'Erro ao ativar env do cliente.')
  process.exit(1)
}
