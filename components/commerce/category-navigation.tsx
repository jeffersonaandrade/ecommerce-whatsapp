import type { NavigationContext } from '@/lib/catalog/navigation-context'
import { DrillDownCategoryNav } from './drill-down-category-nav'
import { ProductsCategoryChips } from './products-category-chips'

export type CategoryNavigationMode = 'drilldown' | 'flat'

type CategoryNavigationProps = {
  mode?: CategoryNavigationMode
  ctx: NavigationContext
  searchParams?: Record<string, string | undefined>
}

export function CategoryNavigation({
  mode = 'drilldown',
  ctx,
  searchParams = {},
}: CategoryNavigationProps) {
  if (mode === 'flat') {
    return (
      <ProductsCategoryChips
        categories={ctx.children}
        activeCategory={searchParams.category}
        searchParams={searchParams}
      />
    )
  }

  return <DrillDownCategoryNav ctx={ctx} searchParams={searchParams} />
}
