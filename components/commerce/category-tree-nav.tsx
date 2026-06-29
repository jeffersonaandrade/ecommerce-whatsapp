'use client'

import Link from 'next/link'
import { Category } from '@/types/category'
import {
  getVisibleChildCategories,
  isCategoryFilterActive,
  productsPageHref,
  resolveStorefrontNavCategories,
} from '@/lib/catalog/storefront-categories'

type CategoryTreeNavProps = {
  categories: Category[]
  activeCategory?: string
  searchParams?: Record<string, string | undefined>
}

function resolveNavLabel(
  categories: Category[],
  active: Category | undefined
): string | null {
  if (!active) return 'Categorias'

  const children = getVisibleChildCategories(categories, active.id)
  if (children.length > 0) return `Dentro de ${active.name}`

  const parent = active.parentId
    ? categories.find((c) => c.id === active.parentId)
    : undefined
  if (parent) return `Mais em ${parent.name}`

  return 'Subcategorias'
}

export function CategoryTreeNav({
  categories,
  activeCategory,
  searchParams = {},
}: CategoryTreeNavProps) {
  const active = activeCategory
    ? categories.find((c) => isCategoryFilterActive(activeCategory, c))
    : undefined

  const parent = active?.parentId
    ? categories.find((c) => c.id === active.parentId)
    : null

  const navCategories = activeCategory
    ? resolveStorefrontNavCategories(categories, activeCategory)
    : getVisibleChildCategories(categories, null)

  const navLabel = resolveNavLabel(categories, active)

  return (
    <div className="mt-4 lg:hidden">
      {activeCategory && parent && (
        <Link
          href={productsPageHref({ category: parent.slug, preserve: searchParams })}
          className="text-sm font-medium text-ink hover:underline"
        >
          ← {parent.name}
        </Link>
      )}

      {navCategories.length > 0 && (
        <div className={activeCategory ? 'mt-3' : ''}>
          {navLabel && (
            <p className="text-xs font-semibold uppercase tracking-wide text-mute">
              {navLabel}
            </p>
          )}
          <div className="mt-2 flex flex-wrap gap-2">
            {navCategories.map((category) => (
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
    </div>
  )
}
