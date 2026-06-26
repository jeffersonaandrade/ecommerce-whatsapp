import { siteConfig } from '@/config/site'
import { Category } from '@/types/category'
import { generateCategorySlug, sortCategories } from './category-utils'

/** Categorias ocultas na vitrine (resíduos de teste/QA). */
const HIDDEN_CATEGORY_PATTERN = /^qa$/i

export function isStorefrontCategory(category: string): boolean {
  const trimmed = category.trim()
  return trimmed.length > 0 && !HIDDEN_CATEGORY_PATTERN.test(trimmed)
}

/** Resíduos E2E/QA no catálogo público (nome/slug/club). */
export function isStorefrontTestResidue(product: {
  category: string
  club?: string
  slug: string
  name: string
}): boolean {
  if (!isStorefrontCategory(product.category)) return true
  if (product.club?.trim() && !isStorefrontCategory(product.club)) return true
  const slug = product.slug.toLowerCase()
  const name = product.name.toLowerCase()
  if (slug.includes('qa-e2e') || name.includes('qa-e2e')) return true
  if (slug.startsWith('qa-') || slug.includes('-qa')) return true
  if (/\sqa$/i.test(name.trim())) return true
  return false
}

/** @deprecated Prefer getStorefrontCategories() — fallback string-only para compat. */
export function resolveStorefrontCategories(catalogCategories: string[]): string[] {
  const fromCatalog = catalogCategories
    .map((c) => c.trim())
    .filter((c) => isStorefrontCategory(c))

  if (fromCatalog.length > 0) {
    return [...fromCatalog].sort((a, b) => a.localeCompare(b, 'pt-BR'))
  }

  return [...siteConfig.categories]
}

export function resolveStorefrontCategoryList(categories: Category[]): Category[] {
  const visible = categories.filter(
    (c) => c.visible && isStorefrontCategory(c.name) && isStorefrontCategory(c.slug)
  )
  if (visible.length > 0) return sortCategories(visible)

  const fallback = siteConfig.categories.map((name, index) => ({
    id: `fallback-${generateCategorySlug(name)}`,
    name,
    slug: generateCategorySlug(name),
    description: '',
    sortOrder: (index + 1) * 10,
    visible: true,
    createdAt: '',
    updatedAt: '',
  }))
  return sortCategories(fallback)
}

export function categoryProductsHref(slug: string): string {
  return `/products?category=${encodeURIComponent(slug)}`
}

export function hasStorefrontCategoryImages(categories: Category[]): boolean {
  return categories.some((c) => Boolean(c.imagePath?.trim()))
}

const PRODUCTS_HREF_PRESERVED_PARAMS = new Set(['q', 'sort', 'dir', 'size'])

export function productsPageHref(options: {
  category?: string | null
  preserve?: Record<string, string | undefined>
} = {}): string {
  const params = new URLSearchParams()

  if (options.preserve) {
    for (const [key, value] of Object.entries(options.preserve)) {
      if (!value || key === 'category' || key === 'page') continue
      if (PRODUCTS_HREF_PRESERVED_PARAMS.has(key)) {
        params.set(key, value)
      }
    }
  }

  if (options.category) {
    params.set('category', options.category)
  }

  const qs = params.toString()
  return qs ? `/products?${qs}` : '/products'
}

export function isCategoryFilterActive(
  filterParam: string | undefined,
  category: Category
): boolean {
  if (!filterParam) return false
  const normalizedFilter = filterParam.trim().toLowerCase()
  return (
    category.slug.toLowerCase() === normalizedFilter ||
    category.name.trim().toLowerCase() === normalizedFilter ||
    generateCategorySlug(filterParam) === category.slug
  )
}

export function resolveCategoryHeading(
  filterParam: string | undefined,
  categories: Category[]
): string {
  if (!filterParam) return 'Todos os produtos'
  const match = categories.find((c) => isCategoryFilterActive(filterParam, c))
  return match?.name ?? filterParam
}
