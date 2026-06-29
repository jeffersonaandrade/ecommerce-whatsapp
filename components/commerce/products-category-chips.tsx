import Link from 'next/link'
import { Category } from '@/types/category'
import { getButtonClassName } from '@/components/ui/button'
import {
  isCategoryFilterActive,
  productsPageHref,
} from '@/lib/catalog/storefront-categories'

type ProductsCategoryChipsProps = {
  categories: Category[]
  activeCategory?: string
  searchParams?: Record<string, string | undefined>
  sectionLabel?: string | null
}

export function ProductsCategoryChips({
  categories,
  activeCategory,
  searchParams = {},
  sectionLabel,
}: ProductsCategoryChipsProps) {
  const preserve = searchParams

  return (
    <div className="mt-6">
      {sectionLabel && (
        <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-mute">
          {sectionLabel}
        </p>
      )}
      <nav className="flex flex-wrap gap-2" aria-label="Filtrar por categoria">
      <Link
        href={productsPageHref({ preserve })}
        className={getButtonClassName(activeCategory ? 'secondary' : 'default', 'sm')}
      >
        Todos
      </Link>
      {categories.map((cat) => (
        <Link
          key={cat.id}
          href={productsPageHref({ category: cat.slug, preserve })}
          className={getButtonClassName(
            isCategoryFilterActive(activeCategory, cat) ? 'default' : 'secondary',
            'sm'
          )}
        >
          {cat.name}
        </Link>
      ))}
      </nav>
    </div>
  )
}
