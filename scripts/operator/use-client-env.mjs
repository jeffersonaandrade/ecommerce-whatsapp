/**
 * Ativa env de um cliente: deploy/clients/<slug>/.env.local → .env.local (raiz).
 * Uso: npm run env:use -- <slug>
 * Nunca imprime valores de env.
 */
import fs from 'node:fs'
import path from 'node:path'
import readline from 'node:readline'
import { fileURLToPath } from 'node:url'

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../..')
const slugPattern = /^[a-z0-9]+(?:-[a-z0-9]+)*$/

function fail(message) {
  console.error(message)
  process.exit(1)
}

function askYesNo(question) {
  const rl = readline.createInterface({ input: process.stdin, output: process.stderr })
  return new Promise((resolve) => {
    rl.question(question, (answer) => {
      rl.close()
      resolve(answer.trim().toLowerCase() === 'y')
    })
  })
}

const slug = process.argv[2]?.trim()
if (!slug) {
  fail('Uso: npm run env:use -- <slug>')
}
if (!slugPattern.test(slug) || slug.includes('..')) {
  fail(`Slug inválido: ${slug}`)
}

const clientEnvPath = path.join(root, 'deploy/clients', slug, '.env.local')
const rootEnvPath = path.join(root, '.env.local')
const backupPath = path.join(root, '.env.local.backup')

async function main() {
  if (!fs.existsSync(clientEnvPath)) {
    if (fs.existsSync(rootEnvPath)) {
      const ok = await askYesNo(
        `Foi encontrada uma .env.local na raiz.\nDeseja inicializar deploy/clients/${slug}/.env.local com esse conteúdo? [y/N] `
      )
      if (ok) {
        fs.mkdirSync(path.dirname(clientEnvPath), { recursive: true })
        fs.copyFileSync(rootEnvPath, clientEnvPath)
      } else {
        fail(`Arquivo deploy/clients/${slug}/.env.local não encontrado.`)
      }
    } else {
      fail(`Arquivo deploy/clients/${slug}/.env.local não encontrado.`)
    }
  }

  if (fs.existsSync(rootEnvPath)) {
    fs.copyFileSync(rootEnvPath, backupPath)
  }

  fs.copyFileSync(clientEnvPath, rootEnvPath)
  console.log(`Env do cliente ${slug} ativada.`)
}

main().catch((err) => {
  console.error(err.message ?? 'Erro ao ativar env do cliente.')
  process.exit(1)
})
