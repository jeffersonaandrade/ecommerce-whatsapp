import { deriveShortDescription, deriveShortFromHtml, stripHtml } from '@/lib/catalog/product-utils'
import { canonicalImportSlug } from './canonical-import-slug'
import type { ParsedProduct } from './types'
import type { Product, ProductStatus, ProductVariation } from '@/types/product'

type PrepareImportBatchOptions = {
  batchId: string
  policy: 'active' | 'draft'
  idFactory?: () => string
}

export type PreparedImportProduct = {
  product: Product
  isUpdate: boolean
}

export type PreparedImportBatch = {
  items: PreparedImportProduct[]
  created: number
  updated: number
  skipped: number
}

function resolveStatus(
  parsed: ParsedProduct,
  existing: Product | undefined,
  policy: 'active' | 'draft'
): ProductStatus {
  return parsed.statusFromCsv ?? existing?.status ?? policy
}

function buildVariations(
  parsed: ParsedProduct,
  existing: Product | undefined,
  idFactory: () => string
): ProductVariation[] {
  const bySku = new Map<string, ProductVariation>()

  for (const variation of existing?.variations ?? []) {
    bySku.set(variation.sku, variation)
  }

  for (const variation of parsed.variations) {
    const previous = bySku.get(variation.sku)
    bySku.set(variation.sku, {
      id: previous?.id ?? idFactory(),
      sku: variation.sku.trim(),
      stock: Math.max(0, Math.floor(Number(variation.stock) || 0)),
      size: variation.size?.trim() || previous?.size,
      color: variation.color?.trim() || previous?.color,
    })
  }

  return [...bySku.values()]
}

function buildProduct(
  parsed: ParsedProduct,
  existing: Product | undefined,
  slug: string,
  options: PrepareImportBatchOptions,
  idFactory: () => string
): Product {
  const longDescription = stripHtml(parsed.longDescription.trim())

  return {
    id: existing?.id ?? idFactory(),
    slug,
    name: parsed.name.trim(),
    shortDescription:
      deriveShortFromHtml(parsed.longDescription) ||
      deriveShortDescription(longDescription) ||
      parsed.name.trim().slice(0, 120),
    longDescription,
    price: parsed.price,
    promotionalPrice: parsed.promotionalPrice,
    category: parsed.category.trim(),
    club: parsed.brand?.trim() || undefined,
    images: parsed.images.filter(Boolean).slice(0, 5),
    variations: buildVariations(parsed, existing, idFactory),
    status: resolveStatus(parsed, existing, options.policy),
    importBatchId: options.batchId,
  }
}

export function prepareImportBatch(
  parsedProducts: ParsedProduct[],
  catalog: Product[],
  options: PrepareImportBatchOptions
): PreparedImportBatch {
  const idFactory = options.idFactory ?? (() => crypto.randomUUID())
  const existingByCanonicalSlug = new Map(
    catalog.map((product) => [canonicalImportSlug(product.slug), product])
  )
  const incomingCanonicalSlugs = new Set<string>()
  const items: PreparedImportProduct[] = []
  let created = 0
  let updated = 0
  let skipped = 0

  for (const parsed of parsedProducts) {
    if (parsed.variations.length === 0) {
      skipped++
      continue
    }

    const slug = canonicalImportSlug(parsed.slug || parsed.name)
    if (!slug) {
      throw new Error(`Slug inválido no produto "${parsed.name}".`)
    }
    if (incomingCanonicalSlugs.has(slug)) {
      throw new Error(`Mais de um produto resulta no slug canônico "${slug}".`)
    }
    incomingCanonicalSlugs.add(slug)

    const existing = existingByCanonicalSlug.get(slug)
    const product = buildProduct(parsed, existing, slug, options, idFactory)
    const isUpdate = Boolean(existing)
    items.push({ product, isUpdate })
    existingByCanonicalSlug.set(slug, product)

    if (isUpdate) updated++
    else created++
  }

  return { items, created, updated, skipped }
}
