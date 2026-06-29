'use client'

import Link from 'next/link'
import { Category } from '@/types/category'
import {
  getCategoryBreadcrumb,
  getVisibleChildCategories,
  isCategoryFilterActive,
  productsPageHref,
} from '@/lib/catalog/storefront-categories'

type CategoryTreeNavProps = {
  categories: Category[]
  activeCategory?: string
  searchParams?: Record<string, string | undefined>
}

export function CategoryTreeNav({
  categories,
  activeCategory,
  searchParams = {},
}: CategoryTreeNavProps) {
  const active = activeCategory
    ? categories.find((c) => isCategoryFilterActive(activeCategory, c))
    : undefined

  const childCategories = getVisibleChildCategories(categories, active?.id ?? null)
  const parent = active?.parentId
    ? categories.find((c) => c.id === active.parentId)
    : null

  if (!activeCategory) {
    return (
      <div className="mt-4 lg:hidden">
        <p className="text-xs font-semibold uppercase tracking-wide text-mute">Categorias</p>
        <div className="mt-2 flex flex-wrap gap-2">
          {getVisibleChildCategories(categories, null).map((category) => (
            <Link
              key={category.id}
              href={productsPageHref({ category: category.slug, preserve: searchParams })}
              className="rounded-full border border-hairline bg-canvas px-3 py-1.5 text-sm text-ink"
            >
              {category.name}
            </Link>
          ))}
        </div>
      </div>
    )
  }

  return (
    <div className="mt-4 space-y-3 lg:hidden">
      {parent && (
        <Link
          href={productsPageHref({ category: parent.slug, preserve: searchParams })}
          className="text-sm font-medium text-ink hover:underline"
        >
          ← {parent.name}
        </Link>
      )}

      {childCategories.length > 0 && (
        <div>
          <p className="text-xs font-semibold uppercase tracking-wide text-mute">
            {active ? `Dentro de ${active.name}` : 'Subcategorias'}
          </p>
          <div className="mt-2 flex flex-wrap gap-2">
            {childCategories.map((category) => (
              <Link
                key={category.id}
                href={productsPageHref({ category: category.slug, preserve: searchParams })}
                className={`rounded-full border px-3 py-1.5 text-sm ${
                  isCategoryFilterActive(activeCategory, category)
                    ? 'border-ink bg-ink text-canvas'
                    : 'border-hairline bg-canvas text-ink'
                }`}
              >
                {category.name}
              </Link>
            ))}
          </div>
        </div>
      )}

      {active && childCategories.length === 0 && (
        <p className="text-sm text-mute">
          {getCategoryBreadcrumb(categories, active.slug).map((c) => c.name).join(' › ')}
        </p>
      )}
    </div>
  )
}
