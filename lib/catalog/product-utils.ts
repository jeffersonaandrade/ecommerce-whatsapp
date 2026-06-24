import { generateSlug } from '@/lib/formatters'
import { Product, ProductVariation, ProductStatus } from '@/types/product'
import { ProductInput } from './product-repository'

export type ProductValidationError = { field: string; message: string }

export function slugifyUnique(
  base: string,
  existing: Product[],
  excludeId?: string
): string {
  let slug = generateSlug(base)
  const taken = new Set(
    existing.filter((p) => p.id !== excludeId).map((p) => p.slug)
  )
  if (!taken.has(slug)) return slug
  let n = 2
  while (taken.has(`${slug}-${n}`)) n++
  return `${slug}-${n}`
}

export function deriveShortDescription(long: string, max = 120): string {
  const trimmed = long.trim()
  if (trimmed.length <= max) return trimmed
  return `${trimmed.slice(0, max - 3).trimEnd()}...`
}

export function assignVariationIds(
  variations: Array<Partial<ProductVariation> & { sku: string; stock: number }>,
  previous?: ProductVariation[]
): ProductVariation[] {
  return variations.map((v, i) => ({
    id: v.id ?? previous?.[i]?.id ?? `v-${Date.now()}-${i}`,
    size: v.size?.trim() || undefined,
    color: v.color?.trim() || undefined,
    sku: v.sku.trim(),
    stock: Math.max(0, Math.floor(Number(v.stock) || 0)),
  }))
}

export function validateProductInput(
  input: ProductInput,
  allProducts: Product[],
  excludeId?: string
): ProductValidationError[] {
  const errors: ProductValidationError[] = []

  if (!input.name.trim()) {
    errors.push({ field: 'name', message: 'Nome é obrigatório' })
  }
  if (!input.category.trim()) {
    errors.push({ field: 'category', message: 'Categoria é obrigatória' })
  }
  if (!input.longDescription.trim()) {
    errors.push({ field: 'longDescription', message: 'Descrição é obrigatória' })
  }
  if (input.price <= 0) {
    errors.push({ field: 'price', message: 'Preço deve ser maior que zero' })
  }
  if (
    input.promotionalPrice != null &&
    input.promotionalPrice > 0 &&
    input.promotionalPrice >= input.price
  ) {
    errors.push({
      field: 'promotionalPrice',
      message: 'Preço promocional deve ser menor que o preço',
    })
  }

  const images = input.images.filter(Boolean)
  if (images.length === 0) {
    errors.push({ field: 'images', message: 'Adicione ao menos uma imagem' })
  }
  if (images.length > 5) {
    errors.push({ field: 'images', message: 'Máximo de 5 imagens' })
  }

  if (input.variations.length === 0) {
    errors.push({
      field: 'variations',
      message: 'Adicione ao menos uma variação',
    })
  }

  const skus = input.variations.map((v) => v.sku.trim()).filter(Boolean)
  const localDupes = skus.filter((s, i) => skus.indexOf(s) !== i)
  if (localDupes.length > 0) {
    errors.push({
      field: 'variations',
      message: 'SKUs duplicados neste produto',
    })
  }

  for (const variation of input.variations) {
    if (!variation.sku.trim()) {
      errors.push({ field: 'variations', message: 'SKU obrigatório em cada variação' })
      break
    }
  }

  for (const sku of skus) {
    const exists = allProducts
      .filter((p) => p.id !== excludeId)
      .some((p) => p.variations.some((v) => v.sku === sku))
    if (exists) {
      errors.push({
        field: 'variations',
        message: `SKU "${sku}" já existe no catálogo`,
      })
    }
  }

  const validStatuses: ProductStatus[] = ['active', 'draft', 'unavailable']
  if (!validStatuses.includes(input.status)) {
    errors.push({ field: 'status', message: 'Status inválido' })
  }

  return errors
}

export function getCategoriesFromProducts(products: Product[]): string[] {
  const categories = new Set<string>()
  products.forEach((p) => categories.add(p.category))
  return Array.from(categories).sort()
}

export function countProductsByCategory(
  products: Product[]
): Array<{ category: string; count: number; activeCount: number }> {
  const map = new Map<string, { count: number; activeCount: number }>()
  for (const product of products) {
    const current = map.get(product.category) ?? { count: 0, activeCount: 0 }
    current.count += 1
    if (product.status === 'active') current.activeCount += 1
    map.set(product.category, current)
  }
  return Array.from(map.entries())
    .map(([category, stats]) => ({ category, ...stats }))
    .sort((a, b) => a.category.localeCompare(b.category))
}
