/**
 * CI guard: proíbe lógica por slug/nome de cliente no core.
 * Uso: npm run qa:check-no-client-branching
 */
import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../..')

const SCAN_DIRS = ['app', 'components', 'lib', 'types', 'config']

const EXCLUDE_DIR_NAMES = new Set(['node_modules', '.next', 'graphify-out'])

const FORBIDDEN_PATTERNS = [
  {
    name: 'slug equality (known clients)',
    regex: /slug\s*===\s*['"](?:unitsports|sportwear|unit-sports)['"]/i,
  },
  {
    name: 'storeName equality (known clients)',
    regex: /storeName\s*===\s*['"](?:UnitSports|SportWear|Sportwear)['"]/,
  },
  {
    name: 'client slug includes check',
    regex: /(?:client|clientSlug|storeSlug)\s*===\s*['"][a-z0-9-]+['"]/i,
  },
]

const TEXT_EXTENSIONS = new Set(['.ts', '.tsx', '.js', '.jsx', '.mjs', '.cjs'])

function walk(dir, files = []) {
  if (!fs.existsSync(dir)) return files
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    if (EXCLUDE_DIR_NAMES.has(entry.name)) continue
    const full = path.join(dir, entry.name)
    if (entry.isDirectory()) walk(full, files)
    else if (TEXT_EXTENSIONS.has(path.extname(entry.name))) files.push(full)
  }
  return files
}

function scanFile(filePath) {
  const rel = path.relative(root, filePath).replace(/\\/g, '/')
  const lines = fs.readFileSync(filePath, 'utf8').split(/\r?\n/)
  const hits = []

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i]
    for (const pattern of FORBIDDEN_PATTERNS) {
      if (pattern.regex.test(line)) {
        hits.push({ line: i + 1, pattern: pattern.name, text: line.trim() })
      }
    }
  }
  return hits.map((h) => ({ file: rel, ...h }))
}

const allHits = []
for (const dir of SCAN_DIRS) {
  for (const file of walk(path.join(root, dir))) {
    allHits.push(...scanFile(file))
  }
}

if (allHits.length > 0) {
  console.error('Branching por cliente detectado no core:\n')
  for (const hit of allHits) {
    console.error(`  ${hit.file}:${hit.line} [${hit.pattern}]`)
    console.error(`    ${hit.text}`)
  }
  console.error(
    '\nRegra: identidade só via store_settings, preset por deploy ou feature flags genéricas.'
  )
  process.exit(1)
}

console.log('OK — nenhum branching por cliente no core.')
