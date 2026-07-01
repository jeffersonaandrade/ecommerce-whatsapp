/**
 * Preflight operador — valida se deploy/clients/<slug> está pronto para Netlify.
 * Read-only: não altera dados, não roda migrations, não faz upload.
 *
 * Uso: npm run deploy:check -- <slug>
 */
import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import { createClient } from '@supabase/supabase-js'
import sharp from 'sharp'
import {
  assertValidSlug,
  getClientEnvPath,
  readClientEnvFile,
} from './client-env.mjs'
import { BRANDING_LOGO_FILENAMES } from '../deploy/resolve-branding-logo.mjs'

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../..')
const clientsRoot = path.join(root, 'deploy/clients')

const LEGACY_LEAK_PATTERNS = [
  'loja-whats',
  'unitsports.netlify.app',
  'UnitSports',
  'unitsports',
]

const LOGO_EXTENSIONS = new Set(['.jpg', '.jpeg', '.png', '.webp'])

class Report {
  /** @type {{ id: string, message: string }[]} */
  passes = []
  /** @type {{ id: string, message: string }[]} */
  warnings = []
  /** @type {{ id: string, message: string }[]} */
  blockers = []

  pass(id, message) {
    this.passes.push({ id, message })
  }

  warn(id, message) {
    this.warnings.push({ id, message })
  }

  block(id, message) {
    this.blockers.push({ id, message })
  }

  ready() {
    return this.blockers.length === 0
  }
}

function usageError(message) {
  console.error(message)
  console.error('\nUso: npm run deploy:check -- <slug>')
  process.exit(2)
}

function readJson(filePath) {
  return JSON.parse(fs.readFileSync(filePath, 'utf8'))
}

function listOtherSlugs(slug) {
  if (!fs.existsSync(clientsRoot)) return []
  return fs
    .readdirSync(clientsRoot, { withFileTypes: true })
    .filter((d) => d.isDirectory() && d.name !== slug && d.name !== 'template')
    .map((d) => d.name)
}

function textContainsForeignClient(text, slug, otherSlugs) {
  const hits = []
  const lower = text.toLowerCase()
  if (slug !== 'unitsports') {
    for (const pat of LEGACY_LEAK_PATTERNS) {
      if (lower.includes(pat.toLowerCase())) hits.push(pat)
    }
  }
  for (const other of otherSlugs) {
    if (lower.includes(other.toLowerCase())) hits.push(`slug:${other}`)
  }
  return hits
}

function checkRequiredFiles(slug, report) {
  const base = path.join(clientsRoot, slug)
  const required = [
    ['env.example', path.join(base, 'env.example')],
    ['.env.local', path.join(base, '.env.local')],
    ['notes.md', path.join(base, 'notes.md')],
    ['branding/', path.join(base, 'branding')],
  ]

  for (const [label, filePath] of required) {
    if (!fs.existsSync(filePath)) {
      report.block('files', `Arquivo/pasta obrigatório ausente: deploy/clients/${slug}/${label}`)
    } else {
      report.pass('files', `deploy/clients/${slug}/${label}`)
    }
  }

  const presetPath = path.join(base, 'storefront-preset.json')
  if (!fs.existsSync(presetPath)) {
    report.warn(
      'files',
      `storefront-preset.json ausente — aceitável em clientes legados; obrigatório para novos onboardings`
    )
  } else {
    report.pass('files', `deploy/clients/${slug}/storefront-preset.json`)
  }
}

function checkEnvExample(slug, report) {
  const examplePath = path.join(clientsRoot, slug, 'env.example')
  if (!fs.existsSync(examplePath)) return

  const content = fs.readFileSync(examplePath, 'utf8')
  const secretPatterns = [
    /NEXT_PUBLIC_SUPABASE_URL=https:\/\/[a-z0-9]+\.supabase\.co/i,
    /NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJ/i,
    /SUPABASE_SERVICE_ROLE_KEY=eyJ/i,
  ]
  for (const re of secretPatterns) {
    if (re.test(content)) {
      report.block('env.example', 'env.example parece conter secrets reais — use placeholders')
      return
    }
  }
  report.pass('env.example', 'env.example sem secrets aparentes')
}

function checkEnvLocal(slug, report, otherSlugs) {
  const envFile = readClientEnvFile(slug)
  if (!envFile) {
    report.block('env', `deploy/clients/${slug}/.env.local não encontrado`)
    return null
  }

  const env = envFile.values
  const provider = env.DATA_PROVIDER?.trim().toLowerCase() ?? ''

  if (provider !== 'supabase') {
    report.block(
      'env',
      'client is not deploy-ready: missing Supabase env (DATA_PROVIDER deve ser supabase para deploy Netlify)'
    )
    return env
  }
  report.pass('env', 'DATA_PROVIDER=supabase')

  const requiredKeys = [
    'NEXT_PUBLIC_SUPABASE_URL',
    'NEXT_PUBLIC_SUPABASE_ANON_KEY',
    'SUPABASE_SERVICE_ROLE_KEY',
  ]
  for (const key of requiredKeys) {
    if (!env[key]?.trim()) {
      report.block('env', `client is not deploy-ready: missing Supabase env (${key} vazio)`)
    } else {
      report.pass('env', `${key} definido`)
    }
  }

  const siteUrl = env.NEXT_PUBLIC_SITE_URL?.trim()
  const qaUrl = env.QA_BASE_URL?.trim()
  if (!siteUrl && !qaUrl) {
    report.warn(
      'env',
      'NEXT_PUBLIC_SITE_URL e QA_BASE_URL ausentes no .env.local — configurar no painel Netlify (ou localmente para smoke) antes do deploy'
    )
  } else {
    report.pass('env', 'URL pública configurada (SITE_URL ou QA_BASE_URL)')
  }

  for (const [key, value] of Object.entries(env)) {
    if (!/URL|SITE|HOST|DOMAIN/i.test(key) || !value?.trim()) continue
    const leaks = textContainsForeignClient(value, slug, otherSlugs)
    if (leaks.length) {
      report.block('env', `${key} referencia outro cliente: ${leaks.join(', ')}`)
    }
  }

  if (siteUrl && qaUrl && siteUrl !== qaUrl) {
    report.warn('env', 'NEXT_PUBLIC_SITE_URL e QA_BASE_URL diferem — confirme se é intencional')
  }

  return env
}

function checkPreset(slug, report, otherSlugs) {
  const presetPath = path.join(clientsRoot, slug, 'storefront-preset.json')
  if (!fs.existsSync(presetPath)) return

  let preset
  try {
    preset = readJson(presetPath)
  } catch {
    report.block('preset', 'storefront-preset.json inválido (JSON malformado)')
    return
  }

  const requiredFields = ['storeName', 'description', 'primaryColor', 'secondaryColor']
  for (const field of requiredFields) {
    if (!preset[field]?.toString().trim()) {
      report.block('preset', `storefront-preset.json: campo obrigatório ausente ou vazio (${field})`)
    } else {
      report.pass('preset', `storefront-preset.json.${field}`)
    }
  }

  const heroFields = ['heroHeadline', 'heroSubheadline', 'heroCtaLabel', 'heroImagePath']
  const hasHero = heroFields.some((f) => preset[f] != null && String(preset[f]).trim())
  if (hasHero) {
    report.pass('preset', 'hero fields presentes no preset')
  } else {
    report.warn('preset', 'preset sem campos hero — hero virá do Supabase após go-live')
  }

  const presetText = JSON.stringify(preset)
  const leaks = textContainsForeignClient(presetText, slug, otherSlugs)
  if (leaks.length) {
    report.block('preset', `storefront-preset.json referencia outro cliente: ${[...new Set(leaks)].join(', ')}`)
  } else {
    report.pass('preset', 'preset sem vazamento de outros clientes')
  }
}

function findClientLogo(slug) {
  const brandingDir = path.join(clientsRoot, slug, 'branding')
  if (!fs.existsSync(brandingDir)) return null
  for (const name of BRANDING_LOGO_FILENAMES) {
    const candidate = path.join(brandingDir, name)
    if (fs.existsSync(candidate)) return candidate
  }
  return null
}

async function checkBranding(slug, report) {
  const logoPath = findClientLogo(slug)
  if (!logoPath) {
    report.block('branding', `Nenhuma logo em deploy/clients/${slug}/branding/ (logo.jpg|jpeg|png|webp)`)
    return
  }

  const ext = path.extname(logoPath).toLowerCase()
  if (!LOGO_EXTENSIONS.has(ext)) {
    report.block('branding', `Extensão de logo não permitida: ${ext}`)
    return
  }

  const stat = fs.statSync(logoPath)
  if (stat.size === 0) {
    report.block('branding', 'Logo vazia (0 bytes)')
    return
  }
  report.pass('branding', `logo encontrada (${path.basename(logoPath)}, ${stat.size} bytes)`)

  try {
    const meta = await sharp(fs.readFileSync(logoPath)).metadata()
    if (!meta.width || !meta.height) {
      report.block('branding', 'Logo inválida — sharp não reconheceu dimensões')
    } else {
      report.pass('branding', `logo válida (${meta.width}x${meta.height}, ${meta.format})`)
    }
  } catch (err) {
    report.block('branding', `Logo inválida — ${err.message ?? 'formato não suportado'}`)
  }
}

async function checkSupabase(slug, env, report) {
  if (!env) return
  const url = env.NEXT_PUBLIC_SUPABASE_URL?.trim()
  const serviceKey = env.SUPABASE_SERVICE_ROLE_KEY?.trim()
  const anonKey =
    env.NEXT_PUBLIC_SUPABASE_ANON_KEY?.trim() ||
    env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY?.trim()

  if (!url || !serviceKey || !anonKey) return

  const admin = createClient(url, serviceKey, {
    auth: { persistSession: false, autoRefreshToken: false },
  })

  try {
    const { data: settings, error: settingsError } = await admin
      .from('store_settings')
      .select('id, store_name, logo_path, hero_image_path, og_image_path')
      .eq('id', 'default')
      .maybeSingle()

    if (settingsError) {
      report.block('supabase', `store_settings: ${settingsError.message}`)
      return
    }
    if (!settings) {
      report.block('supabase', "store_settings id='default' não encontrado — aplicar preset/migrations")
      return
    }
    report.pass('supabase', "store_settings id='default' existe")

    if (!settings.store_name?.trim()) {
      report.block('supabase', 'store_settings.store_name vazio')
    } else {
      report.pass('supabase', 'store_settings.store_name preenchido')
    }

    if (!settings.logo_path?.trim()) {
      report.warn('supabase', 'store_settings.logo_path vazio — rodar branding:sync antes do go-live')
    } else {
      report.pass('supabase', 'store_settings.logo_path definido')
    }

    const hasHero =
      Boolean(settings.hero_image_path?.trim()) || Boolean(settings.og_image_path?.trim())
    if (!hasHero) {
      const { count: bannerCount, error: bannerError } = await admin
        .from('banner_slides')
        .select('id', { count: 'exact', head: true })
        .eq('active', true)

      if (bannerError) {
        report.warn('supabase', `banner_slides: ${bannerError.message}`)
      } else if ((bannerCount ?? 0) > 0) {
        report.pass('supabase', `hero/banner: ${bannerCount} banner(s) ativo(s)`)
      } else {
        report.warn('supabase', 'sem hero_image_path nem banners ativos')
      }
    } else {
      report.pass('supabase', 'hero_image_path ou og_image_path definido')
    }

    const { count: catCount, error: catError } = await admin
      .from('categories')
      .select('id', { count: 'exact', head: true })
      .eq('visible', true)

    if (catError) {
      report.warn('supabase', `categories: ${catError.message}`)
    } else if ((catCount ?? 0) === 0) {
      report.warn('supabase', 'nenhuma categoria visível')
    } else {
      report.pass('supabase', `${catCount} categoria(s) visível(is)`)
    }

    const { count: productCount, error: productError } = await admin
      .from('products')
      .select('id', { count: 'exact', head: true })
      .eq('status', 'active')

    if (productError) {
      report.warn('supabase', `products: ${productError.message}`)
    } else if ((productCount ?? 0) === 0) {
      report.warn('supabase', 'nenhum produto ativo')
    } else {
      report.pass('supabase', `${productCount} produto(s) ativo(s)`)
    }

    if (settings.logo_path?.trim()) {
      const { error: storageError } = await admin.storage
        .from('branding')
        .createSignedUrl(settings.logo_path, 60)
      if (storageError) {
        report.warn('supabase', `Storage branding/${settings.logo_path}: ${storageError.message}`)
      } else {
        report.pass('supabase', 'bucket branding acessível (logo_path)')
      }
    }
  } catch (err) {
    report.block('supabase', `Falha ao conectar/ler Supabase: ${err.message ?? 'erro desconhecido'}`)
  }
}

function checkCoreVersion(slug, report) {
  const pkg = readJson(path.join(root, 'package.json'))
  const coreVersion = pkg.version?.trim()
  if (!coreVersion) {
    report.warn('version', 'package.json sem version')
    return
  }
  report.pass('version', `core version (package.json): ${coreVersion}`)

  const notesPath = path.join(clientsRoot, slug, 'notes.md')
  if (!fs.existsSync(notesPath)) return

  const notes = fs.readFileSync(notesPath, 'utf8')
  const match = notes.match(/\|\s*coreVersionInstalled\s*\|\s*([^\|]+)\s*\|/)
  if (!match) {
    report.warn('version', 'coreVersionInstalled não encontrado em notes.md')
    return
  }

  const installed = match[1].trim()
  if (installed === '—' || !installed) {
    report.warn('version', 'coreVersionInstalled não preenchido em notes.md')
  } else if (installed !== coreVersion) {
    report.warn(
      'version',
      `coreVersionInstalled (${installed}) difere de package.json (${coreVersion})`
    )
  } else {
    report.pass('version', `coreVersionInstalled alinhado (${installed})`)
  }
}

function checkNetlifyReadiness(slug, env, report, otherSlugs) {
  if (!env) return

  const siteUrl = env.NEXT_PUBLIC_SITE_URL?.trim()
  if (siteUrl) {
    if (siteUrl.includes('localhost')) {
      report.block('netlify', 'NEXT_PUBLIC_SITE_URL aponta para localhost — use domínio Netlify real')
    } else {
      const leaks = textContainsForeignClient(siteUrl, slug, otherSlugs)
      if (leaks.length) {
        report.block('netlify', `NEXT_PUBLIC_SITE_URL referencia outro cliente: ${leaks.join(', ')}`)
      } else if (!siteUrl.startsWith('https://')) {
        report.warn('netlify', 'NEXT_PUBLIC_SITE_URL sem https://')
      } else {
        report.pass('netlify', 'NEXT_PUBLIC_SITE_URL parece válida para produção')
      }
    }
  }

  const qaUrl = env.QA_BASE_URL?.trim()
  if (qaUrl) {
    const leaks = textContainsForeignClient(qaUrl, slug, otherSlugs)
    if (leaks.length) {
      report.block('netlify', `QA_BASE_URL referencia outro cliente: ${leaks.join(', ')}`)
    } else {
      report.pass('netlify', 'QA_BASE_URL configurada')
    }
  }
}

function printSummary(slug, report) {
  console.log('')
  console.log(`Deploy preflight — ${slug}`)
  console.log('='.repeat(40))
  console.log(`Status: ${report.ready() ? 'PASS (deploy-ready)' : 'FAIL (blockers presentes)'}`)
  console.log(`Checks OK: ${report.passes.length} | Warnings: ${report.warnings.length} | Blockers: ${report.blockers.length}`)
  console.log('')

  if (report.blockers.length) {
    console.log('Blockers:')
    for (const b of report.blockers) console.log(`  ✗ [${b.id}] ${b.message}`)
    console.log('')
  }

  if (report.warnings.length) {
    console.log('Warnings:')
    for (const w of report.warnings) console.log(`  ! [${w.id}] ${w.message}`)
    console.log('')
  }

  if (report.passes.length) {
    console.log('Passed:')
    for (const p of report.passes) console.log(`  ✓ [${p.id}] ${p.message}`)
    console.log('')
  }

  if (!report.ready()) {
    console.log('Próximos passos:')
    if (report.blockers.some((b) => b.id === 'env')) {
      console.log('  - Preencher deploy/clients/' + slug + '/.env.local (Supabase + URLs)')
    }
    if (report.blockers.some((b) => b.id === 'branding')) {
      console.log('  - Substituir logo em deploy/clients/' + slug + '/branding/')
    }
    if (report.blockers.some((b) => b.id === 'supabase')) {
      console.log('  - Criar Supabase, rodar migrations, aplicar storefront-preset em store_settings')
    }
    console.log('  - Revalidar: npm run deploy:check -- ' + slug)
    console.log('  - Após deploy Netlify: npm run test:e2e:smoke:client -- ' + slug)
  } else if (report.warnings.length) {
    console.log('Deploy-ready com ressalvas — revisar warnings antes do go-live.')
  } else {
    console.log('Cliente pronto para configurar site Netlify e deploy.')
  }
}

async function main() {
  const slug = process.argv[2]?.trim()
  if (!slug) usageError('Slug do cliente é obrigatório.')
  try {
    assertValidSlug(slug)
  } catch (e) {
    usageError(e.message)
  }

  const clientDir = path.join(clientsRoot, slug)
  if (!fs.existsSync(clientDir)) {
    usageError(`Cliente não encontrado: deploy/clients/${slug}/`)
  }

  const report = new Report()
  const otherSlugs = listOtherSlugs(slug)

  report.pass('slug', `deploy/clients/${slug}/ existe`)

  checkRequiredFiles(slug, report)
  checkEnvExample(slug, report)
  const env = checkEnvLocal(slug, report, otherSlugs)
  checkPreset(slug, report, otherSlugs)
  await checkBranding(slug, report)
  checkCoreVersion(slug, report)
  checkNetlifyReadiness(slug, env, report, otherSlugs)

  if (env?.DATA_PROVIDER?.trim().toLowerCase() === 'supabase') {
    await checkSupabase(slug, env, report)
  }

  printSummary(slug, report)
  process.exit(report.ready() ? 0 : 1)
}

main().catch((err) => {
  console.error(err.message ?? err)
  process.exit(2)
})
