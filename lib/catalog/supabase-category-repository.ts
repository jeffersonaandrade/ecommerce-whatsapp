import 'server-only'

import { Category, CategoryInput } from '@/types/category'
import { createAdminClient } from '@/lib/supabase/admin'
import type { CategoryQuery, CategoryQueryResult } from '@/lib/query'
import {
  generateCategorySlug,
  isStorefrontCategoryEntity,
  normalizeCategorySlug,
  sortCategories,
} from './category-utils'
import { CategoryRepository } from './category-repository'
import {
  categoryInputToRow,
  rowToCategory,
  type CategoryRow,
} from './supabase-category-mapper'

async function fetchAllCategories(): Promise<Category[]> {
  const supabase = createAdminClient()
  const { data, error } = await supabase
    .from('categories')
    .select('*')
    .order('sort_order', { ascending: true })
    .order('name', { ascending: true })

  if (error) throw new Error(`categories read failed: ${error.message}`)
  return sortCategories((data ?? []).map((row) => rowToCategory(row as CategoryRow)))
}

export const supabaseCategoryRepository: CategoryRepository = {
  async getAll(): Promise<Category[]> {
    return fetchAllCategories()
  },

  async getById(id: string): Promise<Category | undefined> {
    return (await fetchAllCategories()).find((c) => c.id === id)
  },

  async getBySlug(slug: string): Promise<Category | undefined> {
    const normalized = normalizeCategorySlug(slug)
    return (await fetchAllCategories()).find(
      (c) => normalizeCategorySlug(c.slug) === normalized
    )
  },

  async getStorefront(): Promise<Category[]> {
    const supabase = createAdminClient()
    const { data, error } = await supabase
      .from('categories')
      .select('*')
      .eq('visible', true)
      .order('sort_order', { ascending: true })
      .order('name', { ascending: true })

    if (error) throw new Error(`categories storefront read failed: ${error.message}`)

    return sortCategories(
      (data ?? [])
        .map((row) => rowToCategory(row as CategoryRow))
        .filter((c) => isStorefrontCategoryEntity(c))
    )
  },

  async create(input: CategoryInput): Promise<Category> {
    const supabase = createAdminClient()
    const row = categoryInputToRow(input)
    const { data, error } = await supabase
      .from('categories')
      .insert({
        name: row.name,
        slug: row.slug,
        description: row.description,
        sort_order: row.sort_order,
        visible: row.visible,
      })
      .select('*')
      .single()

    if (error) throw new Error(`category create failed: ${error.message}`)
    return rowToCategory(data as CategoryRow)
  },

  async update(id: string, input: CategoryInput): Promise<Category> {
    const existing = await this.getById(id)
    if (!existing) throw new Error('Categoria não encontrada')

    const name = input.name.trim()
    const slug = normalizeCategorySlug(input.slug?.trim() || generateCategorySlug(name))
    const supabase = createAdminClient()
    const { data, error } = await supabase
      .from('categories')
      .update({
        name,
        slug,
        description: input.description?.trim() ?? '',
        sort_order: input.sortOrder ?? existing.sortOrder,
        visible: input.visible ?? existing.visible,
      })
      .eq('id', id)
      .select('*')
      .single()

    if (error) throw new Error(`category update failed: ${error.message}`)
    return rowToCategory(data as CategoryRow)
  },

  async delete(id: string): Promise<void> {
    const supabase = createAdminClient()
    const { error } = await supabase.from('categories').delete().eq('id', id)
    if (error) throw new Error(`category delete failed: ${error.message}`)
  },

  async query(q: CategoryQuery): Promise<CategoryQueryResult> {
    const supabase = createAdminClient()
    const { filters = {}, pagination = {} } = q
    const page = Math.max(1, pagination.page ?? 1)
    const pageSize = pagination.pageSize ?? 25
    const offset = (page - 1) * pageSize

    let qb = supabase
      .from('categories')
      .select('*', { count: 'exact' })
      .order('sort_order', { ascending: true })
      .order('name', { ascending: true })

    if (filters.visible !== undefined) qb = qb.eq('visible', filters.visible)
    if (filters.search) {
      qb = qb.or(`name.ilike.%${filters.search}%,slug.ilike.%${filters.search}%`)
    }

    qb = qb.range(offset, offset + pageSize - 1)

    const { data, error, count } = await qb
    if (error) throw new Error(`categories query failed: ${error.message}`)

    const categories = sortCategories(
      (data ?? []).map((row) => rowToCategory(row as CategoryRow))
    )
    const total = count ?? categories.length
    const totalPages = Math.max(1, Math.ceil(total / pageSize))

    return { categories, total, page, pageSize, totalPages }
  },
}
