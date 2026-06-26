import 'server-only'

import { getDataProvider } from '@/lib/data/provider'
import { jsonCategoryRepository } from './json-category-repository'
import { CategoryRepository } from './category-repository'
import { supabaseCategoryRepository } from './supabase-category-repository'

export function getCategoryRepository(): CategoryRepository {
  return getDataProvider() === 'supabase'
    ? supabaseCategoryRepository
    : jsonCategoryRepository
}
