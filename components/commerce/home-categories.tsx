import Link from 'next/link'
import { siteConfig } from '@/config/site'
import { getButtonClassName } from '@/components/ui/button'

export function HomeCategories() {
  return (
    <section className="border-b border-hairline bg-soft-cloud py-12 sm:py-16">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <header className="mb-8 space-y-2">
          <p className="text-xs font-semibold uppercase tracking-[0.15em] text-mute">
            Navegue por
          </p>
          <h2 className="font-display text-2xl font-bold uppercase tracking-tight text-ink sm:text-3xl">
            Categorias
          </h2>
        </header>
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 sm:gap-4 lg:grid-cols-5">
          {siteConfig.categories.map((category) => (
            <Link
              key={category}
              href={`/products?category=${encodeURIComponent(category)}`}
              className={getButtonClassName(
                'secondary',
                'sm',
                'w-full justify-center'
              )}
            >
              {category}
            </Link>
          ))}
        </div>
      </div>
    </section>
  )
}
