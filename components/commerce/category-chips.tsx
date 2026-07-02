import Link from 'next/link'
import { categoryProductsHref } from '@/lib/catalog/storefront-categories'
import { getButtonClassName } from '@/components/ui/button'
import { Category } from '@/types/category'

type CategoryChipsProps = {
  categories: Category[]
}

export function CategoryChips({ categories }: CategoryChipsProps) {
  if (categories.length === 0) return null

  return (
    <section
      className="border-b border-hairline bg-canvas lg:hidden"
      aria-label="Comprar por categoria"
    >
      <div className="mx-auto max-w-7xl px-4 py-4 sm:px-6">
        <div className="-mx-4 flex gap-1 overflow-x-auto px-4 pb-1 [scrollbar-width:thin]">
          {categories.map((category) => (
            <Link
              key={category.id}
              href={categoryProductsHref(category.slug)}
              className={getButtonClassName(
                'secondary',
                'sm',
                'shrink-0 whitespace-nowrap'
              )}
            >
              {category.name}
            </Link>
          ))}
          <Link
            href="/products"
            className={getButtonClassName('outline', 'sm', 'shrink-0 whitespace-nowrap')}
          >
            Ver tudo
          </Link>
        </div>
      </div>
    </section>
  )
}
