import { Product } from '@/types/product'
import { ProductInput, ProductRepository, VariationInput } from '@/lib/catalog/product-repository'
import { deriveShortDescription } from '@/lib/catalog/product-utils'
import { ParsedProduct } from './types'
import { ImportApplyResult } from './types'

function stripHtml(html: string): string {
  return html
    .replace(/<[^>]+>/g, ' ')
    .replace(/&nbsp;/gi, ' ')
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .replace(/\s+/g, ' ')
    .trim()
}

function deriveShortFromHtml(html: string): string {
  const text = stripHtml(html)
  const max = 160
  if (text.length <= max) return text
  const cut = text.lastIndexOf(' ', max)
  const end = cut >= 120 ? cut : max
  return `${text.slice(0, end).trimEnd()}...`
}

function toProductInput(parsed: ParsedProduct): ProductInput {
  const longDescription = parsed.longDescription.trim()
  return {
    slug: parsed.slug,
    name: parsed.name,
    shortDescription: deriveShortFromHtml(longDescription) || deriveShortDescription(longDescription),
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
    status: parsed.images.length > 0 ? 'active' : 'draft',
  }
}

function mergeVariations(
  existing: Product,
  incoming: ProductInput
): ProductInput {
  const bySku = new Map<string, VariationInput>(
    existing.variations.map((v) => [v.sku, { id: v.id, sku: v.sku, stock: v.stock, size: v.size, color: v.color }])
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

export function applyImport(
  products: ParsedProduct[],
  repo: ProductRepository
): ImportApplyResult {
  const snapshot = structuredClone(repo.getAll())
  let created = 0
  let updated = 0
  let skipped = 0

  try {
    for (const parsed of products) {
      if (parsed.variations.length === 0) {
        skipped++
        continue
      }

      const input = toProductInput(parsed)
      const existing = repo.getBySlug(parsed.slug)

      if (existing) {
        const merged = mergeVariations(existing, input)
        repo.update(existing.id, merged)
        updated++
      } else {
        repo.create(input)
        created++
      }
    }
  } catch (error) {
    repo.saveAll(snapshot)
    throw error
  }

  return { created, updated, skipped }
}
