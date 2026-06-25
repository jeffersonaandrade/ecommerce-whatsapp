import 'server-only'

import { getDataProvider } from '@/lib/data/provider'
import { jsonProductRepository } from './json-product-repository'
import { ProductRepository } from './product-repository'
import { supabaseProductRepository } from './supabase-product-repository'

export function getProductRepository(): ProductRepository {
  return getDataProvider() === 'supabase'
    ? supabaseProductRepository
    : jsonProductRepository
}
