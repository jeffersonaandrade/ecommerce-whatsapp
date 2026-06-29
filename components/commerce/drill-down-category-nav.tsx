import Link from 'next/link'
import { getButtonClassName } from '@/components/ui/button'
import { productsPageHref, isCategoryFilterActive } from '@/lib/catalog/storefront-categories'
import type { NavigationContext } from '@/lib/catalog/navigation-context'

type DrillDownCategoryNavProps = {
  ctx: NavigationContext
  searchParams?: Record<string, string | undefined>
}

export function DrillDownCategoryNav({ ctx, searchParams = {} }: DrillDownCategoryNavProps) {
  const { backHref, backLabel, hasChildren, children, hintText, activeNode, isLeaf } = ctx

  const todosHref = activeNode
    ? productsPageHref({ category: activeNode.slug, preserve: searchParams })
    : productsPageHref({ preserve: searchParams })

  const activeCategory = searchParams.category

  return (
    <div className="mt-4">
      {backHref && (
        <Link
          href={backHref}
          className="inline-flex items-center text-sm font-medium text-mute hover:text-ink transition-colors"
        >
          {backLabel}
        </Link>
      )}

      {ctx.hintText && (
        <p className="mt-1 text-xs text-mute">{hintText}</p>
      )}

      {hasChildren && (
        <nav className="mt-3 flex flex-wrap gap-2" aria-label="Navegar por categoria">
          <Link
            href={todosHref}
            className={getButtonClassName(
              !activeCategory || activeCategory === activeNode?.slug ? 'default' : 'secondary',
              'sm'
            )}
          >
            Todos
          </Link>
          {children.map((cat) => (
            <Link
              key={cat.id}
              href={productsPageHref({ category: cat.slug, preserve: searchParams })}
              className={getButtonClassName(
                isCategoryFilterActive(activeCategory, cat) ? 'default' : 'secondary',
                'sm'
              )}
            >
              {cat.name}
            </Link>
          ))}
        </nav>
      )}

      {isLeaf && activeNode && !hasChildren && (
        <p className="mt-1 text-xs text-mute">{activeNode.name}</p>
      )}
    </div>
  )
}
