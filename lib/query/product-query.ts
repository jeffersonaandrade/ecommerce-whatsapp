import type { Product, ProductStatus } from '@/types/product'
import type { MediaFilter } from '@/lib/catalog/media/types'

export type ProductFilters = {
  status?: ProductStatus[]
  category?: string
  hasStock?: boolean
  hasDiscount?: boolean
  search?: string
  batchId?: string
  mediaStatus?: MediaFilter
}

export type ProductSort = {
  by?: 'name' | 'price' | 'createdAt'
  dir?: 'asc' | 'desc'
}

export type QueryPagination = {
  page?: number
  pageSize?: number
}

export type ProductQueryFields = 'full' | 'list'

export type ProductQuery = {
  fields?: ProductQueryFields
  filters?: ProductFilters
  sort?: ProductSort
  pagination?: QueryPagination
}

export type ProductStatusCounts = {
  all: number
  active: number
  draft: number
  unavailable: number
  noStock: number
}

export type ProductQueryResult = {
  products: Product[]
  total: number
  page: number
  pageSize: number
  totalPages: number
  counts: ProductStatusCounts
}
