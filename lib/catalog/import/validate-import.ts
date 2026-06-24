import { Product } from '@/types/product'
import { CSV_COLUMNS, REQUIRED_HEADERS } from './columns'
import {
  findConflictingProductRows,
  groupRowsBySlug,
  parseNumber,
  rowProductFields,
} from './map-rows'
import { csvToRecords } from './parse-csv'
import {
  CsvRow,
  ImportIssue,
  ImportPreview,
  ParsedProduct,
} from './types'

const IMAGE_EXTENSIONS = /\.(jpe?g|png|webp)(\?.*)?$/i

function validateImageUrls(raw: string, slug: string, row?: number): ImportIssue[] {
  const issues: ImportIssue[] = []
  if (!raw.trim()) return issues

  const urls = raw.split('|').map((u) => u.trim()).filter(Boolean)
  if (urls.length > 5) {
    issues.push({
      code: 'CSV_E003',
      severity: 'error',
      row,
      slug,
      message: `Máximo de 5 URLs em image_urls (${urls.length} encontradas)`,
    })
    return issues
  }

  for (const url of urls) {
    if (!url.startsWith('https://')) {
      issues.push({
        code: 'CSV_E003',
        severity: 'error',
        row,
        slug,
        message: `URL inválida (apenas HTTPS): ${url}`,
      })
      continue
    }
    if (!IMAGE_EXTENSIONS.test(url)) {
      issues.push({
        code: 'CSV_E003',
        severity: 'error',
        row,
        slug,
        message: `Extensão de imagem inválida: ${url}`,
      })
    }
  }

  return issues
}

function validateDimensions(row: CsvRow, slug: string): ImportIssue[] {
  const issues: ImportIssue[] = []
  const dims = [
    { label: 'Peso (kg)', value: row[CSV_COLUMNS.weight] },
    { label: 'Altura (cm)', value: row[CSV_COLUMNS.height] },
    { label: 'Largura (cm)', value: row[CSV_COLUMNS.width] },
    { label: 'Comprimento (cm)', value: row[CSV_COLUMNS.length] },
  ]

  for (const dim of dims) {
    if (!dim.value?.trim()) continue
    if (parseNumber(dim.value) == null) {
      issues.push({
        code: 'CSV_E007',
        severity: 'warning',
        row: row.__rowNumber,
        slug,
        message: `${dim.label} com formato inválido: "${dim.value}"`,
      })
    }
  }

  return issues
}

function validateRow(row: CsvRow): ImportIssue[] {
  const issues: ImportIssue[] = []
  const slug = row[CSV_COLUMNS.slug]?.trim()
  const rowNum = row.__rowNumber

  if (!slug) {
    issues.push({
      code: 'CSV_E006',
      severity: 'error',
      row: rowNum,
      message: 'Identificador URL vazio',
    })
    return issues
  }

  const sku = row[CSV_COLUMNS.sku]?.trim()
  const stock = parseNumber(row[CSV_COLUMNS.stock] ?? '')
  if (!sku || stock == null || stock < 0) {
    issues.push({
      code: 'CSV_E005',
      severity: 'error',
      row: rowNum,
      slug,
      message: 'Variação sem SKU ou estoque inválido',
    })
  }

  const price = parseNumber(row[CSV_COLUMNS.price] ?? '')
  if (price == null || price <= 0) {
    issues.push({
      code: 'CSV_E005',
      severity: 'error',
      row: rowNum,
      slug,
      message: 'Preço inválido ou ausente',
    })
  }

  const promoRaw = row[CSV_COLUMNS.promotionalPrice]?.trim()
  if (promoRaw) {
    const promo = parseNumber(promoRaw)
    if (promo != null && price != null && promo >= price) {
      issues.push({
        code: 'CSV_E004',
        severity: 'error',
        row: rowNum,
        slug,
        message: 'Preço promocional deve ser menor que o preço',
      })
    }
  }

  issues.push(...validateImageUrls(row[CSV_COLUMNS.imageUrls] ?? '', slug, rowNum))
  issues.push(...validateDimensions(row, slug))

  return issues
}

function validateDuplicateSkus(rows: CsvRow[]): ImportIssue[] {
  const seen = new Map<string, number>()
  const issues: ImportIssue[] = []

  for (const row of rows) {
    const sku = row[CSV_COLUMNS.sku]?.trim()
    if (!sku) continue
    if (seen.has(sku)) {
      issues.push({
        code: 'CSV_E002',
        severity: 'error',
        row: row.__rowNumber,
        slug: row[CSV_COLUMNS.slug]?.trim(),
        message: `SKU duplicado no arquivo: ${sku} (primeira ocorrência linha ${seen.get(sku)})`,
      })
    } else {
      seen.set(sku, row.__rowNumber)
    }
  }

  return issues
}

export function validateCatalogSkus(
  products: ParsedProduct[],
  catalog: Product[]
): ImportIssue[] {
  const issues: ImportIssue[] = []
  const catalogSkus = new Map<string, { productSlug: string; productId: string }>()

  for (const product of catalog) {
    for (const variation of product.variations) {
      catalogSkus.set(variation.sku, { productSlug: product.slug, productId: product.id })
    }
  }

  for (const parsed of products) {
    const existing = catalog.find((p) => p.slug === parsed.slug)

    for (const variation of parsed.variations) {
      const owner = catalogSkus.get(variation.sku)
      if (!owner) continue

      if (existing && existing.variations.some((v) => v.sku === variation.sku)) {
        continue
      }

      if (!existing || owner.productSlug !== parsed.slug) {
        issues.push({
          code: 'CSV_E002',
          severity: 'error',
          row: variation.rowNumber,
          slug: parsed.slug,
          message: `SKU "${variation.sku}" já existe no catálogo (produto "${owner.productSlug}")`,
        })
      }
    }
  }

  return issues
}

function productHasBlockingIssues(product: ParsedProduct, issues: ImportIssue[]): boolean {
  const rows = new Set(product.rowNumbers)
  return issues.some(
    (issue) => issue.severity === 'error' && (issue.slug === product.slug || (issue.row != null && rows.has(issue.row)))
  )
}

export function buildImportPreview(
  csvText: string,
  fileName: string,
  catalog: Product[] = []
): ImportPreview {
  const issues: ImportIssue[] = []

  const matrix = csvToRecords(csvText)
  if (matrix.length === 0) {
    return {
      fileName,
      products: [],
      issues: [{ code: 'CSV_E006', severity: 'error', message: 'Arquivo CSV vazio ou sem linhas de dados' }],
      stats: {
        totalRows: 0,
        totalProducts: 0,
        validProducts: 0,
        errorCount: 1,
        warningCount: 0,
      },
    }
  }

  const headers = Object.keys(matrix[0]).filter((k) => k !== '__rowNumber')
  for (const required of REQUIRED_HEADERS) {
    if (!headers.includes(required)) {
      issues.push({
        code: 'CSV_E006',
        severity: 'error',
        message: `Coluna obrigatória ausente: ${required}`,
      })
    }
  }

  if (issues.some((i) => i.severity === 'error')) {
    return {
      fileName,
      products: [],
      issues,
      stats: {
        totalRows: matrix.length,
        totalProducts: 0,
        validProducts: 0,
        errorCount: issues.length,
        warningCount: 0,
      },
    }
  }

  for (const row of matrix) {
    issues.push(...validateRow(row))
  }

  for (const conflict of findConflictingProductRows(matrix)) {
    issues.push({
      code: 'CSV_E001',
      severity: 'error',
      slug: conflict.slug,
      message: `Identificador URL "${conflict.slug}" com campos conflitantes entre linhas ${conflict.rows.join(', ')}`,
    })
  }

  issues.push(...validateDuplicateSkus(matrix))

  const products = groupRowsBySlug(matrix)
  issues.push(...validateCatalogSkus(products, catalog))

  const errorCount = issues.filter((i) => i.severity === 'error').length
  const warningCount = issues.filter((i) => i.severity === 'warning').length
  const validProducts = products.filter((p) => !productHasBlockingIssues(p, issues)).length

  return {
    fileName,
    products,
    issues,
    stats: {
      totalRows: matrix.length,
      totalProducts: products.length,
      validProducts,
      errorCount,
      warningCount,
    },
  }
}

export function getValidProducts(preview: ImportPreview): ParsedProduct[] {
  return preview.products.filter(
    (product) => !preview.issues.some(
      (issue) =>
        issue.severity === 'error' &&
        (issue.slug === product.slug ||
          (issue.row != null && product.rowNumbers.includes(issue.row)))
    )
  )
}

export function hasBlockingErrors(preview: ImportPreview): boolean {
  return preview.stats.errorCount > 0
}
