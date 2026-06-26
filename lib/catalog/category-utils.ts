import { generateSlug } from '@/lib/formatters'
import { Category, CategoryInput } from '@/types/category'

const CATEGORY_SLUG_PATTERN = /^[a-z0-9]+(?:-[a-z0-9]+)*$/
const HIDDEN_CATEGORY_PATTERN = /^qa$/i

export function generateCategorySlug(name: string): string {
  return normalizeCategorySlug(generateSlug(name.trim()))
}

export function normalizeCategorySlug(slug: string): string {
  return slug
    .trim()
    .toLowerCase()
    .replace(/-+/g, '-')
    .replace(/^-|-$/g, '')
}

export function isValidCategorySlug(slug: string): boolean {
  const normalized = normalizeCategorySlug(slug)
  return normalized.length > 0 && CATEGORY_SLUG_PATTERN.test(normalized)
}

export function defaultCategorySlug(categories: Category[]): string {
  const visible = categories.filter((c) => c.visible)
  return visible[0]?.slug ?? categories[0]?.slug ?? ''
}

export function resolveProductCategorySelectValue(
  productCategory: string,
  categories: Category[]
): string {
  const trimmed = productCategory.trim()
  const match = categories.find(
    (c) =>
      c.slug === trimmed ||
      normalizeCategorySlug(c.slug) === normalizeCategorySlug(trimmed) ||
      c.name.trim().toLowerCase() === trimmed.toLowerCase() ||
      generateCategorySlug(trimmed) === normalizeCategorySlug(c.slug)
  )
  return match?.slug ?? trimmed
}

export function isKnownCategoryValue(value: string, categories: Category[]): boolean {
  const trimmed = value.trim()
  if (!trimmed) return false
  return categories.some(
    (c) =>
      c.slug === trimmed ||
      normalizeCategorySlug(c.slug) === normalizeCategorySlug(trimmed) ||
      c.name.trim().toLowerCase() === trimmed.toLowerCase() ||
      generateCategorySlug(trimmed) === normalizeCategorySlug(c.slug)
  )
}

/** Resolve nome legado ou slug para o slug canônico da categoria, ou null se desconhecida. */
export function resolveCategoryToSlug(value: string, categories: Category[]): string | null {
  const trimmed = value.trim()
  if (!trimmed || !isKnownCategoryValue(trimmed, categories)) return null
  return resolveProductCategorySelectValue(trimmed, categories)
}

export function isStorefrontCategoryEntity(category: Pick<Category, 'name' | 'slug' | 'visible'>): boolean {
  if (!category.visible) return false
  const slug = normalizeCategorySlug(category.slug)
  const name = category.name.trim()
  if (!slug || !name) return false
  return !HIDDEN_CATEGORY_PATTERN.test(slug) && !HIDDEN_CATEGORY_PATTERN.test(name)
}

export function sortCategories(categories: Category[]): Category[] {
  return [...categories].sort((a, b) => {
    if (a.sortOrder !== b.sortOrder) return a.sortOrder - b.sortOrder
    return a.name.localeCompare(b.name, 'pt-BR')
  })
}

export function resolveCategoryParam(
  param: string,
  categories: Category[]
): Category | undefined {
  const trimmed = param.trim()
  if (!trimmed) return undefined

  const normalizedParam = normalizeCategorySlug(trimmed)
  const lowerParam = trimmed.toLowerCase()

  return categories.find((category) => {
    const slug = normalizeCategorySlug(category.slug)
    if (slug === normalizedParam) return true
    if (category.name.trim().toLowerCase() === lowerParam) return true
    if (generateCategorySlug(category.name) === normalizedParam) return true
    return false
  })
}

/** Aceita slug ou nome legado em product.category durante a transição. */
export function productMatchesCategoryFilter(
  productCategory: string,
  filterParam: string,
  categories: Category[]
): boolean {
  const productValue = productCategory.trim()
  if (!productValue) return false

  const resolved = resolveCategoryParam(filterParam, categories)
  if (resolved) {
    const slug = normalizeCategorySlug(resolved.slug)
    return (
      normalizeCategorySlug(productValue) === slug ||
      productValue.toLowerCase() === resolved.name.trim().toLowerCase() ||
      generateCategorySlug(productValue) === slug
    )
  }

  const normalizedFilter = normalizeCategorySlug(filterParam)
  return (
    productValue.toLowerCase() === filterParam.trim().toLowerCase() ||
    normalizeCategorySlug(productValue) === normalizedFilter ||
    generateCategorySlug(productValue) === normalizedFilter
  )
}

export function countProductsForCategory(
  category: Category,
  products: Array<{ category: string; status: string }>
): { count: number; activeCount: number } {
  let count = 0
  let activeCount = 0
  for (const product of products) {
    if (!productMatchesCategoryFilter(product.category, category.slug, [category])) continue
    count += 1
    if (product.status === 'active') activeCount += 1
  }
  return { count, activeCount }
}

export type CategoryValidationError = { field: string; message: string }

export function validateCategoryInput(
  input: CategoryInput,
  existing: Category[],
  excludeId?: string
): CategoryValidationError[] {
  const errors: CategoryValidationError[] = []
  const name = input.name.trim()
  const slug = normalizeCategorySlug(input.slug?.trim() || generateCategorySlug(name))

  if (!name) {
    errors.push({ field: 'name', message: 'Nome é obrigatório' })
  }

  if (!slug || !isValidCategorySlug(slug)) {
    errors.push({ field: 'slug', message: 'Slug inválido (use letras minúsculas, números e hífens)' })
  }

  const slugTaken = existing.some(
    (c) => c.id !== excludeId && normalizeCategorySlug(c.slug) === slug
  )
  if (slugTaken) {
    errors.push({ field: 'slug', message: 'Slug já está em uso' })
  }

  if (input.sortOrder != null && !Number.isFinite(input.sortOrder)) {
    errors.push({ field: 'sortOrder', message: 'Ordem inválida' })
  }

  return errors
}
