import Link from 'next/link'
import { categoryProductsHref } from '@/lib/catalog/storefront-categories'
import { getButtonClassName } from '@/components/ui/button'

type HomeCategoriesProps = {
  categories: string[]
}

export function HomeCategories({ categories }: HomeCategoriesProps) {
  if (categories.length === 0) return null

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
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 sm:gap-4 lg:grid-cols-5">
          {categories.map((category) => (
            <Link
              key={category}
              href={categoryProductsHref(category)}
              className={getButtonClassName(
                'secondary',
                'sm',
                'w-full justify-center'
              )}
            >
              {category}
            </Link>
          ))}
          <Link
            href="/products"
            className={getButtonClassName('outline', 'sm', 'w-full justify-center')}
          >
            Ver tudo
          </Link>
        </div>
      </div>
    </section>
  )
}
