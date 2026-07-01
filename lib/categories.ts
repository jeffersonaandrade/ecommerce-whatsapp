import 'server-only'

import { cache } from 'react'
import { Category } from '@/types/category'
import { getCategoryRepository } from './catalog/get-category-repository'
import type { CategoryQuery, CategoryQueryResult } from '@/lib/query'
import { createAdminClient } from '@/lib/supabase/admin'
import { isSupabaseAuthMode } from '@/lib/auth/mode'

export const getAllCategoriesAdmin = cache(async (): Promise<Category[]> => {
  return getCategoryRepository().getAll()
})

export async function getStorefrontCategories(): Promise<Category[]> {
  return getCategoryRepository().getStorefront()
}

export async function getCategoryById(id: string): Promise<Category | undefined> {
  return getCategoryRepository().getById(id)
}

export async function getCategoryBySlug(slug: string): Promise<Category | undefined> {
  return getCategoryRepository().getBySlug(slug)
}

export async function queryCategoriesAdmin(q: CategoryQuery): Promise<CategoryQueryResult> {
  return getCategoryRepository().query(q)
}

export async function fetchCategoryVisibilityCounts(): Promise<{
  visible: number
  hidden: number
}> {
  if (!isSupabaseAuthMode()) {
    const categories = await getAllCategoriesAdmin()
    return {
      visible: categories.filter((c) => c.visible).length,
      hidden: categories.filter((c) => !c.visible).length,
    }
  }

  const supabase = createAdminClient()
  const [visibleRes, hiddenRes] = await Promise.all([
    supabase.from('categories').select('*', { count: 'exact', head: true }).eq('visible', true),
    supabase.from('categories').select('*', { count: 'exact', head: true }).eq('visible', false),
  ])

  if (visibleRes.error) {
    throw new Error(`category visible count failed: ${visibleRes.error.message}`)
  }
  if (hiddenRes.error) {
    throw new Error(`category hidden count failed: ${hiddenRes.error.message}`)
  }

  return {
    visible: visibleRes.count ?? 0,
    hidden: hiddenRes.count ?? 0,
  }
}
