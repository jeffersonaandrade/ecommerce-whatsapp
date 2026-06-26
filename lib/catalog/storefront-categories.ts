import { siteConfig } from '@/config/site'

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

export function resolveStorefrontCategories(catalogCategories: string[]): string[] {
  const fromCatalog = catalogCategories
    .map((c) => c.trim())
    .filter((c) => isStorefrontCategory(c))

  if (fromCatalog.length > 0) {
    return [...fromCatalog].sort((a, b) => a.localeCompare(b, 'pt-BR'))
  }

  return [...siteConfig.categories]
}

export function categoryProductsHref(category: string): string {
  return `/products?category=${encodeURIComponent(category)}`
}
