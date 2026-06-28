import 'server-only'

import { createAdminClient } from '@/lib/supabase/admin'
import { isSupabaseAuthMode } from '@/lib/auth/mode'
import { getAllProductsAdmin } from '@/lib/products'
import type { ProductStatusCounts } from '@/lib/query'
import type { MediaFilter } from '@/lib/catalog/media/types'

export type MediaStatusCounts = Record<MediaFilter, number>

export type CategoryProductCounts = Record<string, { total: number; active: number }>

export async function fetchProductStatusCounts(): Promise<ProductStatusCounts> {
  if (!isSupabaseAuthMode()) {
    const products = await getAllProductsAdmin()
    return products.reduce(
      (acc, p) => {
        acc.all++
        if (p.status === 'active') acc.active++
        else if (p.status === 'draft') acc.draft++
        else if (p.status === 'unavailable') acc.unavailable++
        const stock = p.variations.reduce((s, v) => s + v.stock, 0)
        if (stock === 0) acc.noStock++
        return acc
      },
      { all: 0, active: 0, draft: 0, unavailable: 0, noStock: 0 }
    )
  }

  const supabase = createAdminClient()
  const { data, error } = await supabase.rpc('get_product_status_counts').maybeSingle()
  if (error || !data) {
    throw new Error(`get_product_status_counts failed: ${error?.message ?? 'empty response'}`)
  }
  return data as ProductStatusCounts
}

export async function fetchMediaStatusCounts(): Promise<MediaStatusCounts> {
  if (!isSupabaseAuthMode()) {
    const { classifyProductImagesInitial } = await import('@/lib/catalog/media/classify-url')
    const products = await getAllProductsAdmin()
    const counts: MediaStatusCounts = {
      all: products.length,
      empty: 0,
      external: 0,
      broken: 0,
      storage: 0,
    }
    for (const p of products) {
      const status = classifyProductImagesInitial(p.images)
      if (status === 'empty') counts.empty++
      else if (status === 'external') counts.external++
      else if (status === 'storage') counts.storage++
    }
    return counts
  }

  const supabase = createAdminClient()
  const { data, error } = await supabase.rpc('get_media_status_counts').maybeSingle()
  if (error || !data) {
    throw new Error(`get_media_status_counts failed: ${error?.message ?? 'empty response'}`)
  }
  const raw = data as Record<string, number>
  return {
    all: raw.all ?? 0,
    empty: raw.empty ?? 0,
    external: raw.external ?? 0,
    broken: raw.broken ?? 0,
    storage: raw.storage ?? 0,
  }
}

export async function fetchProductsByCategoryCounts(): Promise<CategoryProductCounts> {
  if (!isSupabaseAuthMode()) {
    const products = await getAllProductsAdmin()
    const map: CategoryProductCounts = {}
    for (const p of products) {
      const key = p.category.trim().toLowerCase()
      if (!key) continue
      if (!map[key]) map[key] = { total: 0, active: 0 }
      map[key].total++
      if (p.status === 'active') map[key].active++
    }
    return map
  }

  const supabase = createAdminClient()
  const { data, error } = await supabase.rpc('count_products_by_category').maybeSingle()
  if (error || !data) {
    throw new Error(`count_products_by_category failed: ${error?.message ?? 'empty response'}`)
  }
  return data as CategoryProductCounts
}

export async function fetchProductCountForCategory(
  category: string
): Promise<{ total: number; active: number }> {
  if (!isSupabaseAuthMode()) {
    const products = await getAllProductsAdmin()
    const { countProductsForCategory } = await import('@/lib/catalog/category-utils')
    const pseudoCategory = {
      id: 'tmp',
      name: category,
      slug: category,
      description: '',
      sortOrder: 0,
      visible: true,
      createdAt: '',
      updatedAt: '',
    }
    const { count, activeCount } = countProductsForCategory(pseudoCategory, products)
    return { total: count, active: activeCount }
  }

  const supabase = createAdminClient()
  const { data, error } = await supabase.rpc('count_products_for_category', {
    p_category: category,
  }).maybeSingle()
  if (error || !data) {
    throw new Error(`count_products_for_category failed: ${error?.message ?? 'empty response'}`)
  }
  const raw = data as { total: number; active: number }
  return { total: raw.total ?? 0, active: raw.active ?? 0 }
}
