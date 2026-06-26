import fs from 'fs'
import path from 'path'
import { buildImportPreview } from '../../lib/catalog/import/validate-import.ts'

const SCRAPING = 'C:/Projetos/scraping_poc'
const LEGACY = path.join(SCRAPING, 'input_legacy.csv')
const IMAGES_ROOT = path.join(SCRAPING, 'images')

const STORE_CATEGORIES = [
  { id: '1', name: 'Camisas', slug: 'camisas', description: '', sortOrder: 1, visible: true, createdAt: '', updatedAt: '' },
  { id: '2', name: 'Shorts', slug: 'shorts', description: '', sortOrder: 2, visible: true, createdAt: '', updatedAt: '' },
  { id: '3', name: 'Conjuntos', slug: 'conjuntos', description: '', sortOrder: 3, visible: true, createdAt: '', updatedAt: '' },
  { id: '4', name: 'Coleção De Inverno', slug: 'colecao-de-inverno', description: '', sortOrder: 4, visible: true, createdAt: '', updatedAt: '' },
]

const HEADERS = [
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

function parseJson(raw, fallback) {
  try {
    return JSON.parse(raw || 'null')
  } catch {
    return fallback
  }
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
  return v.includes('personaliza') || v.includes('personalize') || v === 'sim'
}

function mapStoreCategory(clientCategories, clientName) {
  const raw = clientCategories || ''
  const lower = `${raw} ${clientName}`.toLowerCase()
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
  return 'Camisas'
}

function isUsableScrapedVariation(item) {
  const props = item.properties || {}
  const keys = Object.keys(props)
  if (keys.length === 1) {
    const k = keys[0].toLowerCase()
    return k === 'tamanho' || k === 'size'
  }
  if (keys.length === 2) {
    const persoKey = keys.find((k) => k.toLowerCase().includes('personal'))
    const sizeKey = keys.find((k) => ['tamanho', 'size'].includes(k.toLowerCase()))
    if (persoKey && sizeKey) {
      return !isPersonalizationValue(props[persoKey])
    }
  }
  return false
}

function getVariationSize(item) {
  const props = item.properties || {}
  return normalizeSize(props.Tamanho || props.Size || props.tamanho)
}

function buildLegacyMeta(rows) {
  const bySlug = new Map()
  for (const row of rows) {
    const slug = row['Identificador URL']?.trim()
    if (!slug) continue
    if (!bySlug.has(slug)) {
      bySlug.set(slug, {
        brand: row['Marca']?.trim() || '',
        description: row['Descrição (Português)']?.trim() || '',
        prices: new Map(),
      })
    }
    const size = normalizeSize(row['Valor da variação 1 (Português)'])
    const perso = row['Valor da variação 2 (Português)']?.trim() || ''
    if (!size || isPersonalizationValue(perso)) continue
    const key = size
    if (!bySlug.get(slug).prices.has(key)) {
      bySlug.get(slug).prices.set(key, {
        price: row['Preço']?.trim() || '',
        promo: row['Preço promocional']?.trim() || '',
        stock: row['Estoque']?.trim() || '10',
      })
    }
  }
  return bySlug
}

function loadLocalImageIndex() {
  const byUrl = new Map()
  for (const file of ['output/image_inventory.csv', 'output/image_inventory_B.csv']) {
    const full = path.join(SCRAPING, file)
    if (!fs.existsSync(full)) continue
    for (const row of readCsv(full)) {
      const url = row.product_url?.trim()
      if (!url) continue
      const locals = String(row.local_paths || '')
        .split('|')
        .map((p) => p.trim().replace(/\\/g, '/'))
        .filter(Boolean)
      byUrl.set(url, locals)
    }
  }
  return byUrl
}

function readValidated() {
  return [
    ...readCsv(path.join(SCRAPING, 'output/data/A_VALIDADO.csv')),
    ...readCsv(path.join(SCRAPING, 'output/data/B_VALIDADO.csv')),
  ].filter((r) => r.validacao === 'correto')
}

const validated = readValidated()
const legacyMeta = buildLegacyMeta(readCsv(LEGACY))
const products = readCsv(path.join(SCRAPING, 'output/products.csv'))
const byScrapedSlug = new Map(products.map((p) => [p.slug, p]))
const localByUrl = loadLocalImageIndex()

const report = {
  generatedAt: new Date().toISOString(),
  source: 'A_VALIDADO + B_VALIDADO (validacao=correto)',
  excluded: 'C_VALIDADO.csv',
  validatedProducts: validated.length,
  importableProducts: 0,
  importRows: 0,
  blockedProducts: [],
  sharedScrapedUrlGroups: [],
  localImages: {
    note: 'Pasta scraping_poc/images espelha URLs HTTPS do CSV (mesmo conteúdo, formato local).',
    productsWithLocalFolder: 0,
    productsWithoutLocalFolder: 0,
    missingLocalExamples: [],
  },
  importPreview: null,
}

const urlToSlugs = new Map()
for (const v of validated) {
  const list = urlToSlugs.get(v.scraped_url) ?? []
  list.push(v.client_slug)
  urlToSlugs.set(v.scraped_url, list)
}
for (const [url, slugs] of urlToSlugs) {
  if (slugs.length > 1) report.sharedScrapedUrlGroups.push({ url, slugs })
}

const importLines = []

for (const v of validated) {
  const slug = v.client_slug
  const scrapedSlug = scrapedSlugFromUrl(v.scraped_url)
  const scraped = byScrapedSlug.get(scrapedSlug)
  const meta = legacyMeta.get(slug)

  if (!scraped) {
    report.blockedProducts.push({ slug, reason: 'Produto scraped não encontrado' })
    continue
  }
  if (!meta) {
    report.blockedProducts.push({ slug, reason: 'Slug ausente no input_legacy.csv' })
    continue
  }

  const imgs = parseJson(v.image_urls, [])
  if (!imgs.length) {
    report.blockedProducts.push({ slug, reason: 'Sem image_urls' })
    continue
  }

  const variations = parseJson(scraped.variations, []).filter(isUsableScrapedVariation)
  if (!variations.length) {
    report.blockedProducts.push({ slug, reason: 'Sem variações importáveis (tamanho / sem personalização)' })
    continue
  }

  const category = mapStoreCategory(v.client_categories, v.client_name)
  const brand = meta.brand
  const description = meta.description || `<p>${v.client_name}</p>`
  const imageUrls = imgs.slice(0, 5).join('|')

  const locals = localByUrl.get(v.scraped_url) ?? []
  const localsExist = locals.filter((rel) => fs.existsSync(path.join(SCRAPING, rel)))
  if (localsExist.length > 0) report.localImages.productsWithLocalFolder++
  else {
    report.localImages.productsWithoutLocalFolder++
    if (report.localImages.missingLocalExamples.length < 8) {
      report.localImages.missingLocalExamples.push({ slug, scraped_url: v.scraped_url })
    }
  }

  let rowCount = 0
  for (const item of variations) {
    const size = getVariationSize(item)
    const priceInfo = meta.prices.get(size)
    if (!priceInfo?.price) continue

    const rawSku = String(item.sku || `${size}`).trim()
    const sku = `${slug}-${rawSku}`.slice(0, 120)

    importLines.push(
      [
        slug,
        v.client_name,
        category,
        priceInfo.price,
        priceInfo.promo || '',
        priceInfo.stock || '10',
        sku,
        description,
        brand,
        'Tamanho',
        size,
        imageUrls,
        'draft',
      ]
        .map(escapeCsv)
        .join(',')
    )
    rowCount++
  }

  if (rowCount === 0) {
    report.blockedProducts.push({ slug, reason: 'Preços legacy não batem com tamanhos scraped' })
    continue
  }

  report.importableProducts++
  report.importRows += rowCount
}

const csv = [HEADERS.join(','), ...importLines].join('\n')
const outCsv = path.join('test-data', 'import-scraping-validado-ab.csv')
const outReport = path.join('test-data', 'import-scraping-validado-ab-report.json')
const outPublic = path.join('public', 'templates', 'import-scraping-validado-ab.csv')

fs.mkdirSync(path.dirname(outCsv), { recursive: true })
fs.writeFileSync(outCsv, csv, 'utf8')
fs.writeFileSync(outPublic, csv, 'utf8')

const preview = buildImportPreview(csv, 'import-scraping-validado-ab.csv', [], STORE_CATEGORIES)
report.importPreview = {
  validProducts: preview.products.length,
  blockingErrors: preview.issues.filter((i) => i.severity === 'error').length,
  warnings: preview.issues.filter((i) => i.severity === 'warning').length,
  canImport: !preview.issues.some((i) => i.severity === 'error'),
  errorSamples: preview.issues
    .filter((i) => i.severity === 'error')
    .slice(0, 15)
    .map((i) => ({ code: i.code, slug: i.slug, message: i.message })),
}

fs.writeFileSync(outReport, JSON.stringify(report, null, 2), 'utf8')

console.log(JSON.stringify(report, null, 2))
console.log('\nArquivos:')
console.log('-', outCsv)
console.log('-', outPublic)
console.log('-', outReport)
