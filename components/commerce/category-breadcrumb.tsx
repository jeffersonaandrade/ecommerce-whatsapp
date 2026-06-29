'use client'

import Link from 'next/link'
import { Category } from '@/types/category'
import { formatCategoryBreadcrumb, getCategoryBreadcrumb } from '@/lib/catalog/category-tree'
import { productsPageHref } from '@/lib/catalog/storefront-categories'

type CategoryBreadcrumbProps = {
  categories: Category[]
  activeCategory?: string
  searchParams?: Record<string, string | undefined>
}

export function CategoryBreadcrumb({
  categories,
  activeCategory,
  searchParams = {},
}: CategoryBreadcrumbProps) {
  if (!activeCategory) return null

  const trail = getCategoryBreadcrumb(categories, activeCategory)
  if (!trail.length) return null

  return (
    <nav aria-label="Caminho da categoria" className="mt-4">
      <ol className="flex flex-wrap items-center gap-1 text-sm text-mute">
        <li>
          <Link href={productsPageHref({ preserve: searchParams })} className="hover:text-ink">
            Todos
          </Link>
        </li>
        {trail.map((category, index) => {
          const isLast = index === trail.length - 1
          return (
            <li key={category.id} className="flex items-center gap-1">
              <span aria-hidden>›</span>
              {isLast ? (
                <span className="font-medium text-ink">{category.name}</span>
              ) : (
                <Link
                  href={productsPageHref({ category: category.slug, preserve: searchParams })}
                  className="hover:text-ink"
                >
                  {category.name}
                </Link>
              )}
            </li>
          )
        })}
      </ol>
      <p className="sr-only">{formatCategoryBreadcrumb(trail)}</p>
    </nav>
  )
}
