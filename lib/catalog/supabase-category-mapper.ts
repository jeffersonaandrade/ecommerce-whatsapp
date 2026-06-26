import { Category, CategoryInput } from '@/types/category'
import { generateCategorySlug, normalizeCategorySlug } from './category-utils'

export type CategoryRow = {
  id: string
  name: string
  slug: string
  description: string
  sort_order: number
  visible: boolean
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
    imagePath: row.image_path ?? undefined,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  }
}

export function buildCategoryUpdatePayload(
  input: CategoryInput,
  existing: Pick<Category, 'sortOrder' | 'visible'>
): {
  name: string
  slug: string
  description: string
  sort_order: number
  visible: boolean
  image_path?: string | null
} {
  const name = input.name.trim()
  const slug = normalizeCategorySlug(input.slug?.trim() || generateCategorySlug(name))
  const payload = {
    name,
    slug,
    description: input.description?.trim() ?? '',
    sort_order: input.sortOrder ?? existing.sortOrder,
    visible: input.visible ?? existing.visible,
  }

  if ('imagePath' in input) {
    return { ...payload, image_path: input.imagePath ?? null }
  }

  return payload
}

export function categoryInputToRow(
  input: CategoryInput,
  existing?: Pick<Category, 'id' | 'createdAt' | 'updatedAt'>
): Omit<CategoryRow, 'created_at' | 'updated_at'> & {
  created_at?: string
  updated_at?: string
} {
  const name = input.name.trim()
  const slug = normalizeCategorySlug(input.slug?.trim() || generateCategorySlug(name))
  return {
    id: existing?.id ?? crypto.randomUUID(),
    name,
    slug,
    description: input.description?.trim() ?? '',
    sort_order: input.sortOrder ?? 0,
    visible: input.visible ?? true,
    image_path: input.imagePath ?? null,
    ...(existing
      ? { created_at: existing.createdAt, updated_at: new Date().toISOString() }
      : {}),
  }
}
