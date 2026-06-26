import { ParsedProduct, ImportApplyResult } from './types'
import { ProductInput, ProductRepository, VariationInput } from '@/lib/catalog/product-repository'
import { deriveShortDescription, deriveShortFromHtml, stripHtml } from '@/lib/catalog/product-utils'
import { Product, ProductStatus } from '@/types/product'

type ApplyImportOptions = {
  policy: 'active' | 'draft'
  batchId: string
  existingBySlug: Map<string, Product>
}

function resolveStatus(
  parsed: ParsedProduct,
  existing: Product | undefined,
  policy: 'active' | 'draft'
): ProductStatus {
  if (parsed.statusFromCsv) return parsed.statusFromCsv
  if (existing) return existing.status
  return policy
}

function toProductInput(parsed: ParsedProduct, options: ApplyImportOptions): ProductInput {
  const existing = options.existingBySlug.get(parsed.slug)
  const longDescription = stripHtml(parsed.longDescription.trim())
  return {
    slug: parsed.slug,
    name: parsed.name,
    shortDescription: deriveShortFromHtml(parsed.longDescription) || deriveShortDescription(longDescription),
    longDescription,
    price: parsed.price,
    promotionalPrice: parsed.promotionalPrice,
    category: parsed.category,
    club: parsed.brand,
    images: parsed.images.slice(0, 5),
    variations: parsed.variations.map((v) => ({
      sku: v.sku,
      stock: v.stock,
      size: v.size,
      color: v.color,
    })),
    status: resolveStatus(parsed, existing, options.policy),
    importBatchId: options.batchId,
  }
}

function mergeVariations(
  existing: Product,
  incoming: ProductInput
): ProductInput {
  const bySku = new Map<string, VariationInput>(
    existing.variations.map((v) => [
      v.sku,
      { id: v.id, sku: v.sku, stock: v.stock, size: v.size, color: v.color },
    ])
  )

  for (const variation of incoming.variations) {
    const prev = bySku.get(variation.sku)
    if (prev) {
      bySku.set(variation.sku, {
        id: prev.id,
        sku: variation.sku,
        stock: variation.stock,
        size: variation.size ?? prev.size,
        color: variation.color ?? prev.color,
      })
    } else {
      bySku.set(variation.sku, variation)
    }
  }

  return {
    ...incoming,
    variations: Array.from(bySku.values()),
  }
}

export async function applyImport(
  products: ParsedProduct[],
  repo: ProductRepository,
  options: ApplyImportOptions
): Promise<ImportApplyResult> {
  const started = performance.now()
  const snapshot = structuredClone(await repo.getAll())
  let created = 0
  let updated = 0
  let skipped = 0

  try {
    for (const parsed of products) {
      if (parsed.variations.length === 0) {
        skipped++
        continue
      }

      const existing = options.existingBySlug.get(parsed.slug)
      const input = toProductInput(parsed, options)

      if (existing) {
        const merged = mergeVariations(existing, input)
        await repo.update(existing.id, merged)
        updated++
      } else {
        await repo.create(input)
        created++
      }
    }
  } catch (error) {
    await repo.saveAll(snapshot)
    throw error
  }

  return {
    created,
    updated,
    skipped,
    durationMs: Math.round(performance.now() - started),
    batchId: options.batchId,
  }
}
