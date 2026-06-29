import { Category, CategoryInput } from '@/types/category'
import { computeCategoryPath } from './category-tree'
import { generateCategorySlug, normalizeCategorySlug } from './category-utils'

export type CategoryRow = {
  id: string
  name: string
  slug: string
  description: string
  sort_order: number
  visible: boolean
  parent_id: string | null
  depth: number
  path: string
  image_path: string | null
  created_at: string
  updated_at: string
}

export function rowToCategory(row: CategoryRow): Category {
  return {
    id: row.id,
    name: row.name,
    slug: row.slug,
    description: row.description ?? '',
    sortOrder: row.sort_order,
    visible: row.visible,
    parentId: row.parent_id ?? null,
    depth: row.depth ?? 0,
    path: row.path || row.slug,
    imagePath: row.image_path ?? undefined,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  }
}

export function buildCategoryUpdatePayload(
  input: CategoryInput,
  existing: Pick<Category, 'sortOrder' | 'visible' | 'parentId' | 'depth' | 'path'>,
  parent?: Pick<Category, 'path' | 'depth'> | null
): {
  name: string
  slug: string
  description: string
  sort_order: number
  visible: boolean
  parent_id: string | null
  depth: number
  path: string
  image_path?: string | null
} {
  const name = input.name.trim()
  const slug = normalizeCategorySlug(input.slug?.trim() || generateCategorySlug(name))
  const parentId = input.parentId !== undefined ? input.parentId : existing.parentId ?? null
  const treeFields = computeCategoryPath(slug, parent ?? null)
  const payload = {
    name,
    slug,
    description: input.description?.trim() ?? '',
    sort_order: input.sortOrder ?? existing.sortOrder,
    visible: input.visible ?? existing.visible,
    parent_id: parentId,
    depth: treeFields.depth,
    path: treeFields.path,
  }

  if ('imagePath' in input) {
    return { ...payload, image_path: input.imagePath ?? null }
  }

  return payload
}

export function categoryInputToRow(
  input: CategoryInput,
  parent: Pick<Category, 'path' | 'depth'> | null | undefined,
  existing?: Pick<Category, 'id' | 'createdAt' | 'updatedAt'>
): Omit<CategoryRow, 'created_at' | 'updated_at'> & {
  created_at?: string
  updated_at?: string
} {
  const name = input.name.trim()
  const slug = normalizeCategorySlug(input.slug?.trim() || generateCategorySlug(name))
  const treeFields = computeCategoryPath(slug, parent ?? null)
  return {
    id: existing?.id ?? crypto.randomUUID(),
    name,
    slug,
    description: input.description?.trim() ?? '',
    sort_order: input.sortOrder ?? 0,
    visible: input.visible ?? true,
    parent_id: input.parentId ?? null,
    depth: treeFields.depth,
    path: treeFields.path,
    image_path: input.imagePath ?? null,
    ...(existing
      ? { created_at: existing.createdAt, updated_at: new Date().toISOString() }
      : {}),
  }
}
