import { CSV_COLUMNS } from './columns'
import { CsvRow, ParsedProduct, ParsedVariation } from './types'
import { ProductStatus } from '@/types/product'

function parseNumber(value: string): number | null {
  const normalized = value.replace(/\s/g, '').replace(',', '.')
  if (!normalized) return null
  const num = Number(normalized)
  return Number.isFinite(num) ? num : null
}

function parseCategory(path: string): string {
  const segments = path.split('>').map((s) => s.trim()).filter(Boolean)
  return segments.length ? segments[segments.length - 1] : path.trim()
}

function parseImageUrls(raw: string): string[] {
  if (!raw.trim()) return []
  const seen = new Set<string>()
  const urls: string[] = []
  for (const part of raw.split('|')) {
    const url = part.trim()
    if (!url || seen.has(url)) continue
    seen.add(url)
    urls.push(url)
  }
  return urls
}

export function parseImportStatus(raw: string): ProductStatus | undefined {
  const v = raw.trim().toLowerCase()
  if (v === 'active' || v === 'ativo') return 'active'
  if (v === 'draft' || v === 'rascunho') return 'draft'
  if (v === 'unavailable' || v === 'indisponível' || v === 'indisponivel') return 'unavailable'
  return undefined
}

function mapVariationAttributes(row: CsvRow): Pick<ParsedVariation, 'size' | 'color'> {
  const pairs = [
    [row[CSV_COLUMNS.variationName1], row[CSV_COLUMNS.variationValue1]],
    [row[CSV_COLUMNS.variationName2], row[CSV_COLUMNS.variationValue2]],
    [row[CSV_COLUMNS.variationName3], row[CSV_COLUMNS.variationValue3]],
  ] as const

  let size: string | undefined
  let color: string | undefined

  for (const [name, value] of pairs) {
    if (!name?.trim() || !value?.trim()) continue
    const key = name.trim().toLowerCase()
    if (key === 'tamanho' || key === 'size') size = value.trim()
    else if (key === 'cor' || key === 'color') color = value.trim()
  }

  return { size, color }
}

function rowToVariation(row: CsvRow): ParsedVariation | null {
  const sku = row[CSV_COLUMNS.sku]?.trim()
  const stockRaw = row[CSV_COLUMNS.stock]
  const stock = parseNumber(stockRaw)
  if (!sku || stock == null) return null

  return {
    rowNumber: row.__rowNumber,
    sku,
    stock: Math.max(0, Math.floor(stock)),
    ...mapVariationAttributes(row),
  }
}

export function rowProductFields(row: CsvRow) {
  const price = parseNumber(row[CSV_COLUMNS.price] ?? '')
  const promoRaw = row[CSV_COLUMNS.promotionalPrice]?.trim()
  const promotionalPrice = promoRaw ? parseNumber(promoRaw) : null

  return {
    slug: row[CSV_COLUMNS.slug]?.trim() ?? '',
    name: row[CSV_COLUMNS.name]?.trim() ?? '',
    category: parseCategory(row[CSV_COLUMNS.categories] ?? ''),
    price: price ?? 0,
    promotionalPrice: promotionalPrice && promotionalPrice > 0 ? promotionalPrice : undefined,
    longDescription: row[CSV_COLUMNS.description]?.trim() ?? '',
    brand: row[CSV_COLUMNS.brand]?.trim() || undefined,
    images: parseImageUrls(row[CSV_COLUMNS.imageUrls] ?? ''),
    weight: row[CSV_COLUMNS.weight]?.trim() ?? '',
    height: row[CSV_COLUMNS.height]?.trim() ?? '',
    width: row[CSV_COLUMNS.width]?.trim() ?? '',
    length: row[CSV_COLUMNS.length]?.trim() ?? '',
  }
}

function productFieldsMatch(a: ReturnType<typeof rowProductFields>, b: ReturnType<typeof rowProductFields>): boolean {
  return (
    a.name === b.name &&
    a.category === b.category &&
    a.price === b.price &&
    (a.promotionalPrice ?? null) === (b.promotionalPrice ?? null) &&
    a.longDescription === b.longDescription &&
    (a.brand ?? '') === (b.brand ?? '') &&
    a.images.join('|') === b.images.join('|')
  )
}

export function groupRowsBySlug(
  rows: CsvRow[],
  statusWarnings?: Array<{ slug: string; row: number; raw: string }>
): ParsedProduct[] {
  const groups = new Map<string, CsvRow[]>()

  for (const row of rows) {
    const slug = row[CSV_COLUMNS.slug]?.trim()
    if (!slug) continue
    const list = groups.get(slug) ?? []
    list.push(row)
    groups.set(slug, list)
  }

  const products: ParsedProduct[] = []

  for (const [slug, groupRows] of groups) {
    const firstFields = rowProductFields(groupRows[0])
    const variations: ParsedVariation[] = []

    for (const row of groupRows) {
      const variation = rowToVariation(row)
      if (variation) variations.push(variation)
    }

    const rawStatus = groupRows[0][CSV_COLUMNS.status]?.trim() ?? ''
    let statusFromCsv: ProductStatus | undefined
    if (rawStatus) {
      statusFromCsv = parseImportStatus(rawStatus)
      if (!statusFromCsv && statusWarnings) {
        statusWarnings.push({ slug, row: groupRows[0].__rowNumber, raw: rawStatus })
      }
    }

    products.push({
      slug,
      name: firstFields.name,
      category: firstFields.category,
      price: firstFields.price,
      promotionalPrice: firstFields.promotionalPrice,
      longDescription: firstFields.longDescription,
      brand: firstFields.brand,
      images: firstFields.images,
      variations,
      rowNumbers: groupRows.map((r) => r.__rowNumber),
      statusFromCsv,
    })
  }

  return products
}

export function findConflictingProductRows(rows: CsvRow[]): Array<{ slug: string; rows: number[] }> {
  const groups = new Map<string, CsvRow[]>()
  for (const row of rows) {
    const slug = row[CSV_COLUMNS.slug]?.trim()
    if (!slug) continue
    const list = groups.get(slug) ?? []
    list.push(row)
    groups.set(slug, list)
  }

  const conflicts: Array<{ slug: string; rows: number[] }> = []

  for (const [slug, groupRows] of groups) {
    if (groupRows.length <= 1) continue
    const baseline = rowProductFields(groupRows[0])
    const hasConflict = groupRows.some((row) => !productFieldsMatch(baseline, rowProductFields(row)))
    if (hasConflict) {
      conflicts.push({ slug, rows: groupRows.map((r) => r.__rowNumber) })
    }
  }

  return conflicts
}

export { parseNumber }
