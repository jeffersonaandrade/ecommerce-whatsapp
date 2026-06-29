import { Category } from '@/types/category'
import {
  generateCategorySlug,
  normalizeCategorySlug,
  resolveCategoryParam,
} from './category-utils'

export const MAX_CATEGORY_DEPTH = 2

export type CategoryNode = Category & { children: CategoryNode[] }

export function computeCategoryPath(
  slug: string,
  parent: Pick<Category, 'path' | 'depth'> | null | undefined
): { depth: number; path: string } {
  const normalizedSlug = normalizeCategorySlug(slug)
  if (!parent) {
    return { depth: 0, path: normalizedSlug }
  }
  const depth = parent.depth + 1
  if (depth > MAX_CATEGORY_DEPTH) {
    throw new Error('Profundidade máxima de 3 níveis atingida')
  }
  return { depth, path: `${parent.path}/${normalizedSlug}` }
}

export function buildCategoryTree(categories: Category[]): CategoryNode[] {
  const nodes = new Map<string, CategoryNode>()
  for (const category of categories) {
    nodes.set(category.id, { ...category, children: [] })
  }

  const roots: CategoryNode[] = []
  for (const node of nodes.values()) {
    if (node.parentId && nodes.has(node.parentId)) {
      nodes.get(node.parentId)!.children.push(node)
    } else {
      roots.push(node)
    }
  }

  const sortNodes = (list: CategoryNode[]) => {
    list.sort((a, b) => {
      if (a.sortOrder !== b.sortOrder) return a.sortOrder - b.sortOrder
      return a.name.localeCompare(b.name, 'pt-BR')
    })
    for (const node of list) sortNodes(node.children)
  }
  sortNodes(roots)
  return roots
}

export function flattenCategoryTree(tree: CategoryNode[]): CategoryNode[] {
  const result: CategoryNode[] = []
  const walk = (nodes: CategoryNode[]) => {
    for (const node of nodes) {
      result.push(node)
      walk(node.children)
    }
  }
  walk(tree)
  return result
}

export function getChildren(categories: Category[], parentId: string | null): Category[] {
  return categories.filter((c) => (c.parentId ?? null) === parentId)
}

export function getDescendantIds(categories: Category[], nodeId: string): string[] {
  const byParent = new Map<string | null, Category[]>()
  for (const category of categories) {
    const key = category.parentId ?? null
    const list = byParent.get(key) ?? []
    list.push(category)
    byParent.set(key, list)
  }

  const ids: string[] = []
  const walk = (id: string) => {
    for (const child of byParent.get(id) ?? []) {
      ids.push(child.id)
      walk(child.id)
    }
  }
  walk(nodeId)
  return ids
}

export function getSubtreeIds(categories: Category[], nodeId: string): Set<string> {
  return new Set([nodeId, ...getDescendantIds(categories, nodeId)])
}

export function getAncestors(categories: Category[], nodeId: string): Category[] {
  const byId = new Map(categories.map((c) => [c.id, c]))
  const ancestors: Category[] = []
  let current = byId.get(nodeId)
  while (current?.parentId) {
    const parent = byId.get(current.parentId)
    if (!parent) break
    ancestors.unshift(parent)
    current = parent
  }
  return ancestors
}

export function isLeafCategory(categories: Category[], id: string): boolean {
  return !categories.some((c) => c.parentId === id)
}

export function assertValidParent(
  categories: Category[],
  parentId: string | null | undefined,
  categoryId?: string
): void {
  if (!parentId) return
  if (categoryId && parentId === categoryId) {
    throw new Error('Uma categoria não pode ser pai de si mesma')
  }

  const parent = categories.find((c) => c.id === parentId)
  if (!parent) throw new Error('Categoria pai não encontrada')
  if (parent.depth >= MAX_CATEGORY_DEPTH) {
    throw new Error('Profundidade máxima de 3 níveis atingida')
  }

  if (categoryId) {
    const descendants = getDescendantIds(categories, categoryId)
    if (descendants.includes(parentId)) {
      throw new Error('Não é possível mover categoria para dentro de um descendente')
    }
  }
}

export function getCategoryBreadcrumb(
  categories: Category[],
  slugOrId: string
): Category[] {
  const match =
    categories.find((c) => c.id === slugOrId) ??
    resolveCategoryParam(slugOrId, categories)
  if (!match) return []
  return [...getAncestors(categories, match.id), match]
}

export function getStorefrontRoots(categories: Category[]): Category[] {
  return categories
    .filter((c) => !c.parentId)
    .sort((a, b) => {
      if (a.sortOrder !== b.sortOrder) return a.sortOrder - b.sortOrder
      return a.name.localeCompare(b.name, 'pt-BR')
    })
}

export function getVisibleChildCategories(
  categories: Category[],
  parentSlugOrId: string | null
): Category[] {
  const parent = parentSlugOrId
    ? categories.find((c) => c.id === parentSlugOrId) ??
      resolveCategoryParam(parentSlugOrId, categories)
    : null
  const parentId = parent?.id ?? null
  return categories
    .filter((c) => c.visible && (c.parentId ?? null) === parentId)
    .sort((a, b) => {
      if (a.sortOrder !== b.sortOrder) return a.sortOrder - b.sortOrder
      return a.name.localeCompare(b.name, 'pt-BR')
    })
}

function legacyProductMatchesCategoryValue(
  productCategory: string,
  category: Category
): boolean {
  const productValue = productCategory.trim()
  if (!productValue) return false
  const slug = normalizeCategorySlug(category.slug)
  return (
    normalizeCategorySlug(productValue) === slug ||
    productValue.toLowerCase() === category.name.trim().toLowerCase() ||
    generateCategorySlug(productValue) === slug
  )
}

export function productMatchesCategorySubtree(
  product: { categoryId?: string | null; category: string },
  filterParam: string,
  categories: Category[]
): boolean {
  const filter =
    resolveCategoryParam(filterParam, categories) ??
    categories.find((c) => c.id === filterParam)

  if (!filter) {
    const normalizedFilter = normalizeCategorySlug(filterParam)
    const productValue = product.category.trim()
    if (!productValue) return false
    return (
      productValue.toLowerCase() === filterParam.trim().toLowerCase() ||
      normalizeCategorySlug(productValue) === normalizedFilter ||
      generateCategorySlug(productValue) === normalizedFilter
    )
  }

  const subtreeIds = getSubtreeIds(categories, filter.id)
  if (product.categoryId && subtreeIds.has(product.categoryId)) {
    return true
  }

  return categories
    .filter((c) => subtreeIds.has(c.id))
    .some((c) => legacyProductMatchesCategoryValue(product.category, c))
}

export function countProductsInSubtree(
  category: Category,
  categories: Category[],
  products: Array<{ categoryId?: string | null; category: string; status: string }>
): { count: number; activeCount: number } {
  const subtreeIds = getSubtreeIds(categories, category.id)
  let count = 0
  let activeCount = 0
  for (const product of products) {
    const matches =
      (product.categoryId && subtreeIds.has(product.categoryId)) ||
      categories
        .filter((c) => subtreeIds.has(c.id))
        .some((c) => legacyProductMatchesCategoryValue(product.category, c))
    if (!matches) continue
    count += 1
    if (product.status === 'active') activeCount += 1
  }
  return { count, activeCount }
}

export function formatCategoryBreadcrumb(categories: Category[]): string {
  return categories.map((c) => c.name).join(' › ')
}

export function formatCategoryOptionLabel(
  category: Pick<Category, 'name' | 'depth' | 'visible'>
): string {
  const indent = `${'—'.repeat(category.depth)}${category.depth > 0 ? ' ' : ''}`
  const hidden = category.visible === false ? ' (oculta)' : ''
  return `${indent}${category.name}${hidden}`
}

export function getSubtreeRelativeMaxDepth(categories: Category[], nodeId: string): number {
  const byParent = new Map<string | null, Category[]>()
  for (const category of categories) {
    const key = category.parentId ?? null
    const list = byParent.get(key) ?? []
    list.push(category)
    byParent.set(key, list)
  }

  let maxRel = 0
  const walk = (id: string, rel: number) => {
    if (rel > maxRel) maxRel = rel
    for (const child of byParent.get(id) ?? []) {
      walk(child.id, rel + 1)
    }
  }
  walk(nodeId, 0)
  return maxRel
}

export function assertSubtreeFitsMaxDepth(
  categories: Category[],
  nodeId: string,
  newDepth: number
): void {
  const relative = getSubtreeRelativeMaxDepth(categories, nodeId)
  if (newDepth + relative > MAX_CATEGORY_DEPTH) {
    throw new Error('Profundidade máxima de 3 níveis atingida')
  }
}

export function recomputeDescendantPaths(
  categories: Category[],
  rootId: string
): Category[] {
  const next = categories.map((c) => ({ ...c }))
  const byId = new Map(next.map((c) => [c.id, c]))
  const root = byId.get(rootId)
  if (!root) return next

  const walk = (parent: Category) => {
    for (const child of next.filter((c) => c.parentId === parent.id)) {
      const treeFields = computeCategoryPath(child.slug, parent)
      const index = next.findIndex((c) => c.id === child.id)
      next[index] = {
        ...child,
        depth: treeFields.depth,
        path: treeFields.path,
      }
      walk(next[index])
    }
  }
  walk(root)
  return next
}
