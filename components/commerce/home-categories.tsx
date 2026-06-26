import Link from 'next/link'
import { categoryProductsHref, hasStorefrontCategoryImages } from '@/lib/catalog/storefront-categories'
import { getButtonClassName } from '@/components/ui/button'
import { Category } from '@/types/category'
import { CategoryAllCard, CategoryVisualCard } from './category-visual-card'

type HomeCategoriesProps = {
  categories: Category[]
}

export function HomeCategories({ categories }: HomeCategoriesProps) {
  if (categories.length === 0) return null

  const hasImages = hasStorefrontCategoryImages(categories)

  return (
    <section className="hidden border-b border-hairline bg-soft-cloud py-12 sm:py-16 lg:block">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <header className="mb-8 space-y-2">
          <p className="text-xs font-semibold uppercase tracking-[0.15em] text-mute">
            Compre por
          </p>
          <h2 className="font-display text-2xl font-bold uppercase tracking-tight text-ink sm:text-3xl">
            Categoria
          </h2>
        </header>

        {hasImages ? (
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-5">
            {categories.map((category) => (
              <CategoryVisualCard
                key={category.id}
                category={category}
                href={categoryProductsHref(category.slug)}
              />
            ))}
            <Link
              href="/products"
              className={getButtonClassName('outline', 'sm', 'w-full justify-center self-center')}
            >
              Ver tudo
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 sm:gap-4 lg:grid-cols-5">
            {categories.map((category) => (
              <Link
                key={category.id}
                href={categoryProductsHref(category.slug)}
                className={getButtonClassName('secondary', 'sm', 'w-full justify-center')}
              >
                {category.name}
              </Link>
            ))}
            <Link
              href="/products"
              className={getButtonClassName('outline', 'sm', 'w-full justify-center')}
            >
              Ver tudo
            </Link>
          </div>
        )}
      </div>
    </section>
  )
}
