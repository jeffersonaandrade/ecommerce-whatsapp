/**
 * Scaffold deploy/clients/<slug>/ a partir do template.
 * Uso: npm run create-client -- sportwear
 *      npm run create-client -- sportwear --force
 */
import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../..')
const templateDir = path.join(root, 'deploy/clients/template')
const slugPattern = /^[a-z0-9]+(?:-[a-z0-9]+)*$/

function fail(message) {
  console.error(message)
  process.exit(1)
}

function parseArgs(argv) {
  const positional = []
  let force = false
  for (const arg of argv) {
    if (arg === '--force') force = true
    else if (!arg.startsWith('-')) positional.push(arg)
  }
  return { slug: positional[0]?.trim(), force }
}

function displayNameFromSlug(slug) {
  return slug
    .split('-')
    .filter(Boolean)
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(' ')
}

function copyDir(src, dest, replace) {
  fs.mkdirSync(dest, { recursive: true })
  for (const entry of fs.readdirSync(src, { withFileTypes: true })) {
    const srcPath = path.join(src, entry.name)
    const destPath = path.join(dest, entry.name)
    if (entry.isDirectory()) {
      copyDir(srcPath, destPath, replace)
    } else {
      const raw = fs.readFileSync(srcPath, 'utf8')
      fs.writeFileSync(destPath, replace(raw), 'utf8')
    }
  }
}

function storefrontPreset(slug, displayName, coreVersion) {
  return {
    storeName: displayName,
    description: '',
    primaryColor: '#111111',
    secondaryColor: '#f5f5f5',
    heroHeadline: '',
    heroHeadlineLine2: '',
    heroSubheadline: '',
    heroCtaLabel: 'Ver produtos',
    heroCtaHref: '/products',
    heroImagePath: null,
    aboutText: '',
    address: '',
    cityState: '',
    businessHours: 'Seg–Sex, 9h–18h',
    exchangePolicyText:
      'Trocas em até 7 dias para produtos sem uso, com etiqueta e nota fiscal. Entre em contato pelo WhatsApp ou e-mail da loja.',
    _comment: `Preset de implantação — ${slug}. Aplicar em store_settings na criação do Supabase.`,
  }
}

function registryEntry(slug, displayName, coreVersion) {
  return {
    slug,
    name: displayName,
    netlifySite: '',
    domain: '',
    supabaseProjectRef: 'PREENCHER',
    coreVersionInstalled: coreVersion,
    lastDeployAt: '',
    lastMigrationApplied: '',
    status: 'draft',
    features: ['catalog', 'import_csv', 'media_center', 'banners', 'onboarding'],
    notes: `Implantação ${displayName}`,
  }
}

const { slug, force } = parseArgs(process.argv.slice(2))
if (!slug) fail('Uso: npm run create-client -- <slug> [--force]')
if (!slugPattern.test(slug) || slug === 'template') fail(`Slug inválido: ${slug}`)

const clientDir = path.join(root, 'deploy/clients', slug)
if (fs.existsSync(clientDir)) {
  if (!force) {
    fail(`Pasta já existe: deploy/clients/${slug}/ (use --force para sobrescrever arquivos do template)`)
  }
} else {
  fs.mkdirSync(clientDir, { recursive: true })
}

const pkg = JSON.parse(fs.readFileSync(path.join(root, 'package.json'), 'utf8'))
const coreVersion = pkg.version ?? '0.0.0'
const displayName = displayNameFromSlug(slug)

const replace = (content) =>
  content
    .replaceAll('<slug>', slug)
    .replaceAll('—', '—')
    .replace(/\| coreVersionInstalled \| — \|/g, `| coreVersionInstalled | ${coreVersion} |`)

copyDir(templateDir, clientDir, replace)

const presetPath = path.join(clientDir, 'storefront-preset.json')
fs.writeFileSync(
  presetPath,
  `${JSON.stringify(storefrontPreset(slug, displayName, coreVersion), null, 2)}\n`,
  'utf8'
)

const readmePath = path.join(clientDir, 'README.md')
if (fs.existsSync(readmePath)) {
  const readme = fs.readFileSync(readmePath, 'utf8')
  if (!readme.includes(displayName)) {
    fs.writeFileSync(
      readmePath,
      `# ${displayName} — implantação\n\n${readme}`,
      'utf8'
    )
  }
}

console.log(`Cliente criado: deploy/clients/${slug}/`)
console.log(`Preset: deploy/clients/${slug}/storefront-preset.json`)
console.log('')
console.log('Próximos passos:')
console.log(`  1. Criar Supabase e aplicar migrations`)
console.log(`  2. Copiar env.example → deploy/clients/${slug}/.env.local`)
console.log(`  3. npm run dev:client -- ${slug}  (ou npm run env:use -- ${slug} para compatibilidade)`)
console.log(`  4. Colocar logo em deploy/clients/${slug}/branding/logo.jpeg`)
console.log(`  5. npm run branding:sync -- --client ${slug}`)
console.log('')
console.log('Entrada sugerida para clients.local.json:')
console.log(JSON.stringify(registryEntry(slug, displayName, coreVersion), null, 2))
