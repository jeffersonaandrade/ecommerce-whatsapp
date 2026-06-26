import Link from 'next/link'
import { Category } from '@/types/category'
import { categoryImageUrl } from '@/lib/catalog/category-image-url'

type CategoryVisualCardProps = {
  category: Category
  href: string
  active?: boolean
  compact?: boolean
}

function cardRing(active: boolean): string {
  return active
    ? 'ring-2 ring-ink ring-offset-2 ring-offset-canvas'
    : 'ring-1 ring-hairline hover:ring-ink/30'
}

export function CategoryVisualCard({
  category,
  href,
  active = false,
  compact = false,
}: CategoryVisualCardProps) {
  return (
    <Link
      href={href}
      aria-current={active ? 'page' : undefined}
      className={`group relative shrink-0 overflow-hidden rounded-lg bg-soft-cloud ${
        compact ? 'h-20 w-28 sm:h-24 sm:w-32' : 'aspect-[4/3] w-full'
      } ${cardRing(active)}`}
    >
      {category.imagePath ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={categoryImageUrl(category.id, category.updatedAt)}
          alt={category.name}
          className="absolute inset-0 h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
        />
      ) : (
        <div className="absolute inset-0 bg-hairline" />
      )}
      <div className="absolute inset-0 bg-gradient-to-t from-ink/70 via-ink/20 to-transparent" />
      <span
        className={`absolute bottom-0 left-0 right-0 font-semibold text-canvas ${
          compact ? 'px-2 py-1.5 text-xs' : 'px-3 py-2 text-sm'
        }`}
      >
        {category.name}
      </span>
    </Link>
  )
}

type CategoryAllCardProps = {
  href: string
  active?: boolean
  compact?: boolean
  label?: string
}

export function CategoryAllCard({
  href,
  active = false,
  compact = false,
  label = 'Todos',
}: CategoryAllCardProps) {
  return (
    <Link
      href={href}
      aria-current={active ? 'page' : undefined}
      className={`flex shrink-0 items-center justify-center rounded-lg bg-soft-cloud font-semibold text-ink ${
        compact ? 'h-20 w-28 text-xs sm:h-24 sm:w-32' : 'aspect-[4/3] w-full text-sm'
      } ${cardRing(active)}`}
    >
      {label}
    </Link>
  )
}
