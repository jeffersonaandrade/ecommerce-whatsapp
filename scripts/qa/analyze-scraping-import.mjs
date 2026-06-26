import fs from 'fs'
import path from 'path'
import { buildImportPreview } from '../../lib/catalog/import/validate-import.ts'
import { csvToRecords } from '../../lib/catalog/import/parse-csv.ts'

const SCRAPING = 'C:/Projetos/scraping_poc'
const LEGACY = path.join(SCRAPING, 'input_legacy.csv')

function parseCsvLine(line) {
  const out = []
  let cur = ''
  let q = false
  for (let i = 0; i < line.length; i++) {
    const c = line[i]
    if (q) {
      if (c === '"' && line[i + 1] === '"') {
        cur += '"'
        i++
      } else if (c === '"') q = false
      else cur += c
    } else if (c === '"') q = true
    else if (c === ',') {
      out.push(cur)
      cur = ''
    } else cur += c
  }
  out.push(cur)
  return out
}

function readCsv(file) {
  const txt = fs.readFileSync(file, 'utf8').replace(/^\uFEFF/, '')
  const lines = txt.trim().split(/\r?\n/)
  const headers = parseCsvLine(lines[0])
  return lines.slice(1).map((line, i) => {
    const cols = parseCsvLine(line)
    const row = { __row: i + 2 }
    headers.forEach((h, idx) => {
      row[h] = cols[idx] ?? ''
    })
    return row
  })
}

function readValidated(name) {
  return readCsv(path.join(SCRAPING, 'output/data', name)).filter((r) => r.validacao === 'correto')
}

function parseJson(raw, fallback = null) {
  try {
    return JSON.parse(raw || 'null')
  } catch {
    return fallback
  }
}

function leafCategory(pathStr) {
  const segments = pathStr.split('>').map((s) => s.trim()).filter(Boolean)
  return segments.length ? segments[segments.length - 1] : pathStr.trim()
}

function mapStoreCategory(clientCategories, clientName) {
  const raw = clientCategories || ''
  const leaf = leafCategory(raw)
  const name = clientName.toLowerCase()
  const lower = `${raw} ${leaf} ${name}`.toLowerCase()

  if (lower.includes('short')) return 'Shorts'
  if (lower.includes('conjunto') || lower.includes('kit infantil') || lower.includes('conjuto')) return 'Conjuntos'
  if (
    lower.includes('manga longa') ||
    lower.includes('corta-vento') ||
    lower.includes('moletom') ||
    lower.includes('jaqueta') ||
    lower.includes('coleção de inverno')
  ) {
    return 'Coleção De Inverno'
  }
  if (lower.includes('camisa') || lower.includes('jaqueta')) return 'Camisas'
  return 'Camisas'
}

function escapeCsv(value) {
  const s = String(value ?? '')
  if (/[",\n]/.test(s)) return `"${s.replace(/"/g, '""')}"`
  return s
}

function scrapedSlugFromUrl(url) {
  return url.split('/produtos/')[1]?.replace(/\/$/, '') ?? ''
}

function normalizeSize(size) {
  return String(size || '').trim().toUpperCase()
}

function isPersonalizationValue(value) {
  const v = String(value || '').toLowerCase()
  if (!v) return false
  if (v.includes('sem personaliza')) return false
  return v.includes('personaliza') || v.includes('personalize')
}

function buildLegacyPriceIndex(rows) {
  const bySlug = new Map()
  for (const row of rows) {
    const slug = row['Identificador URL']?.trim()
    const size = normalizeSize(row['Valor da variação 1 (Português)'])
    const perso = row['Valor da variação 2 (Português)']?.trim() || ''
    if (!slug || !size || isPersonalizationValue(perso)) continue
    const key = `${slug}::${size}`
    if (!bySlug.has(key)) {
      bySlug.set(key, {
        price: row['Preço']?.trim() || '',
        promo: row['Preço promocional']?.trim() || '',
        stock: row['Estoque']?.trim() || '10',
        brand: row['Marca']?.trim() || '',
        description: row['Descrição (Português)']?.trim() || '',
      })
    }
  }
  return bySlug
}

const STORE_CATEGORIES = [
  { id: '1', name: 'Camisas', slug: 'camisas', description: '', sortOrder: 1, visible: true, createdAt: '', updatedAt: '' },
  { id: '2', name: 'Shorts', slug: 'shorts', description: '', sortOrder: 2, visible: true, createdAt: '', updatedAt: '' },
  { id: '3', name: 'Conjuntos', slug: 'conjuntos', description: '', sortOrder: 3, visible: true, createdAt: '', updatedAt: '' },
  { id: '4', name: 'Coleção De Inverno', slug: 'colecao-de-inverno', description: '', sortOrder: 4, visible: true, createdAt: '', updatedAt: '' },
  { id: '5', name: 'Feminina', slug: 'feminina', description: '', sortOrder: 5, visible: true, createdAt: '', updatedAt: '' },
  { id: '6', name: 'Versão Jogador', slug: 'versao-jogador', description: '', sortOrder: 6, visible: true, createdAt: '', updatedAt: '' },
  { id: '7', name: 'Seleção Brasileira', slug: 'selecao-brasileira', description: '', sortOrder: 7, visible: true, createdAt: '', updatedAt: '' },
]

const validated = [...readValidated('A_VALIDADO.csv'), ...readValidated('B_VALIDADO.csv')]
const legacyPriceIndex = buildLegacyPriceIndex(readCsv(LEGACY))
const products = readCsv(path.join(SCRAPING, 'output/products.csv'))
const byScrapedSlug = new Map(products.map((p) => [p.slug, p]))

const headers = [
  'Identificador URL',
  'Nome (Português)',
  'Categorias',
  'Preço',
  'Preço promocional',
  'Estoque',
  'SKU',
  'Descrição (Português)',
  'Marca',
  'Nome da variação 1',
  'Valor da variação 1',
  'image_urls',
  'status',
]

const report = {
  source: 'A_VALIDADO.csv + B_VALIDADO.csv (validacao=correto)',
  excluded: 'C_VALIDADO.csv (classe C com 32,77% de acerto — não recomendado)',
  validatedProducts: validated.length,
  importableProducts: 0,
  importRows: 0,
  blockedProducts: [],
  warnings: [],
  duplicateScrapedUrlGroups: [],
  categoryBreakdown: {},
  imageTrimmedToFive: 0,
}

const urlToSlugs = new Map()
for (const v of validated) {
  const list = urlToSlugs.get(v.scraped_url) ?? []
  list.push(v.client_slug)
  urlToSlugs.set(v.scraped_url, list)
}
for (const [url, slugs] of urlToSlugs) {
  if (slugs.length > 1) report.duplicateScrapedUrlGroups.push({ url, slugs })
}

const importLines = []

for (const v of validated) {
  const slug = v.client_slug
  const scrapedSlug = scrapedSlugFromUrl(v.scraped_url)
  const scraped = byScrapedSlug.get(scrapedSlug)
  if (!scraped) {
    report.blockedProducts.push({ slug, reason: 'Produto scraped não encontrado em output/products.csv' })
    continue
  }

  const imgs = parseJson(v.image_urls, [])
  if (!imgs.length) {
    report.blockedProducts.push({ slug, reason: 'Sem image_urls validadas' })
    continue
  }
  if (imgs.length > 5) report.imageTrimmedToFive++

  const category = mapStoreCategory(v.client_categories, v.client_name)
  report.categoryBreakdown[category] = (report.categoryBreakdown[category] || 0) + 1

  const variations = parseJson(scraped.variations, [])
  const sizeOnly = variations.filter((item) => {
    const props = item.properties || {}
    const keys = Object.keys(props)
    return keys.length === 1 && (keys[0] === 'Tamanho' || keys[0].toLowerCase() === 'size')
  })

  if (!sizeOnly.length) {
    report.blockedProducts.push({
      slug,
      reason: `Variações complexas (${variations.length}) — personalização/multi-atributo exige tratamento manual`,
    })
    continue
  }

  let rowCount = 0
  for (const item of sizeOnly) {
    const size = normalizeSize(item.properties.Tamanho || item.properties.Size)
    const priceKey = `${slug}::${size}`
    const legacyPrice = legacyPriceIndex.get(priceKey)
    const price = legacyPrice?.price
    if (!price) {
      continue
    }

    const sku = String(item.sku || `${slug}-${size}`).trim()
    const line = [
      slug,
      v.client_name,
      category,
      price,
      legacyPrice.promo || '',
      legacyPrice.stock || '10',
      sku,
      legacyPrice.description || `<p>${v.client_name}</p>`,
      legacyPrice.brand || '',
      'Tamanho',
      size,
      imgs.slice(0, 5).join('|'),
      'draft',
    ]
    importLines.push(line.map(escapeCsv).join(','))
    rowCount++
  }

  if (rowCount === 0) {
    report.blockedProducts.push({ slug, reason: 'Sem preço/variação compatível entre legacy e scraped' })
    continue
  }

  report.importableProducts++
  report.importRows += rowCount
}

const outCsv = [headers.join(','), ...importLines].join('\n')
const outPath = path.join('test-data', 'scraping-validado-ab-import.csv')
fs.mkdirSync(path.dirname(outPath), { recursive: true })
fs.writeFileSync(outPath, outCsv, 'utf8')

const preview = buildImportPreview(outCsv, 'scraping-validado-ab-import.csv', [], STORE_CATEGORIES)
report.importPreview = {
  validProducts: preview.products.length,
  blockingErrors: preview.issues.filter((i) => i.severity === 'error').length,
  warnings: preview.issues.filter((i) => i.severity === 'warning').length,
  errorSamples: preview.issues
    .filter((i) => i.severity === 'error')
    .slice(0, 10)
    .map((i) => ({ code: i.code, slug: i.slug, message: i.message })),
}

const reportPath = path.join('test-data', 'scraping-validado-ab-report.json')
fs.writeFileSync(reportPath, JSON.stringify(report, null, 2), 'utf8')

console.log(JSON.stringify(report, null, 2))
console.log('CSV:', outPath)
console.log('Report:', reportPath)
