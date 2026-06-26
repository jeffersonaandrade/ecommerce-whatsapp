import 'server-only'

import { Category } from '@/types/category'
import { getCategoryRepository } from './catalog/get-category-repository'
import type { CategoryQuery, CategoryQueryResult } from '@/lib/query'
import { siteConfig } from '@/config/site'
import { generateCategorySlug, sortCategories } from './catalog/category-utils'

function fallbackCategoriesFromSiteConfig(): Category[] {
  const timestamp = new Date(0).toISOString()
  return siteConfig.categories.map((name, index) => ({
    id: `fallback-${generateCategorySlug(name)}`,
    name,
    slug: generateCategorySlug(name),
    description: '',
    sortOrder: (index + 1) * 10,
    visible: true,
    createdAt: timestamp,
    updatedAt: timestamp,
  }))
}

export async function getAllCategoriesAdmin(): Promise<Category[]> {
  return getCategoryRepository().getAll()
}

export async function getStorefrontCategories(): Promise<Category[]> {
  const categories = await getCategoryRepository().getStorefront()
  if (categories.length > 0) return categories
  return sortCategories(fallbackCategoriesFromSiteConfig())
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
