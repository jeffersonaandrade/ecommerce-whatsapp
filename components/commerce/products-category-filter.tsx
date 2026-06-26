import { Category } from '@/types/category'
import {
  hasStorefrontCategoryImages,
  isCategoryFilterActive,
  productsPageHref,
} from '@/lib/catalog/storefront-categories'
import { CategoryAllCard, CategoryVisualCard } from './category-visual-card'

type ProductsCategoryFilterProps = {
  categories: Category[]
  activeCategory?: string
  searchParams?: Record<string, string | undefined>
}

export function ProductsCategoryFilter({
  categories,
  activeCategory,
  searchParams = {},
}: ProductsCategoryFilterProps) {
  if (categories.length === 0) return null

  if (!hasStorefrontCategoryImages(categories)) return null

  const preserve = searchParams

  return (
    <section
      className="border-b border-hairline bg-soft-cloud/60"
      aria-label="Comprar por categoria"
    >
      <div className="mx-auto max-w-7xl px-4 py-5 sm:px-6 lg:px-8 lg:py-6">
        <h2 className="text-xs font-semibold uppercase tracking-[0.15em] text-mute">
          Comprar por categoria
        </h2>

        <div className="mt-3 lg:hidden">
          <div className="-mx-4 flex gap-3 overflow-x-auto px-4 pb-1 [scrollbar-width:thin]">
            <CategoryAllCard
              href={productsPageHref({ preserve })}
              active={!activeCategory}
              compact
            />
            {categories.map((category) => (
              <CategoryVisualCard
                key={category.id}
                category={category}
                href={productsPageHref({ category: category.slug, preserve })}
                active={isCategoryFilterActive(activeCategory, category)}
                compact
              />
            ))}
          </div>
        </div>

        <div className="mt-3 hidden gap-3 lg:grid lg:grid-cols-6 xl:grid-cols-8">
          <CategoryAllCard
            href={productsPageHref({ preserve })}
            active={!activeCategory}
            compact
          />
          {categories.map((category) => (
            <CategoryVisualCard
              key={category.id}
              category={category}
              href={productsPageHref({ category: category.slug, preserve })}
              active={isCategoryFilterActive(activeCategory, category)}
              compact
            />
          ))}
        </div>
      </div>
    </section>
  )
}
