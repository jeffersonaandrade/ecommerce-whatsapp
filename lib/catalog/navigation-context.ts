import type { Category } from '@/types/category'
import {
  getVisibleChildCategories,
  getCategoryBreadcrumb,
  isLeafCategory,
} from './category-tree'
import { productsPageHref, isStorefrontCategory } from './storefront-categories'

export type NavigationContext = {
  activeNode: Category | null
  parent: Category | null
  children: Category[]
  breadcrumb: Category[]
  isLeaf: boolean
  hasChildren: boolean
  backHref: string | null
  backLabel: string
  hintText: string | null
  searchPlaceholder: string
}

function resolveHintText(activeNode: Category | null): string | null {
  if (!activeNode) return null
  const name = activeNode.name.toLowerCase()
  if (name.includes('time') || name.includes('clube') || name.includes('seleç')) {
    return 'Escolha um time'
  }
  if (name.includes('marca') || name.includes('brand')) {
    return 'Escolha uma marca'
  }
  return 'Escolha uma categoria'
}

function resolveSearchPlaceholder(
  activeNode: Category | null,
  parent: Category | null
): string {
  if (!activeNode) return 'Buscar por time, produto…'
  if (parent) return `Buscar em ${parent.name} › ${activeNode.name}…`
  return `Buscar em ${activeNode.name}…`
}

export function getNavigationContext(
  categories: Category[],
  activeCategory: string | undefined,
  searchParams: Record<string, string | undefined>
): NavigationContext {
  const visible = categories.filter((c) => c.visible && isStorefrontCategory(c.slug))

  const activeNode =
    (activeCategory
      ? visible.find(
          (c) =>
            c.slug === activeCategory ||
            c.name.trim().toLowerCase() === activeCategory.trim().toLowerCase()
        )
      : null) ?? null

  const parent =
    activeNode?.parentId
      ? (visible.find((c) => c.id === activeNode.parentId) ?? null)
      : null

  const children = getVisibleChildCategories(visible, activeNode?.id ?? null)
  const breadcrumb = activeNode ? getCategoryBreadcrumb(visible, activeNode.id) : []
  const hasChildren = children.length > 0
  const isLeaf = !!activeNode && !hasChildren && isLeafCategory(visible, activeNode.id)

  let backHref: string | null = null
  let backLabel = ''

  if (activeNode) {
    if (activeNode.depth === 0) {
      backHref = productsPageHref({ preserve: searchParams })
      backLabel = '← Catálogo'
    } else if (parent) {
      backHref = productsPageHref({ category: parent.slug, preserve: searchParams })
      backLabel = `← ${parent.name}`
    }
  }

  return {
    activeNode,
    parent,
    children,
    breadcrumb,
    isLeaf,
    hasChildren,
    backHref,
    backLabel,
    hintText: hasChildren && activeNode ? resolveHintText(activeNode) : null,
    searchPlaceholder: resolveSearchPlaceholder(activeNode, parent),
  }
}
