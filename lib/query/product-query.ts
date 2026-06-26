import type { Product, ProductStatus } from '@/types/product'

export type ProductFilters = {
  status?: ProductStatus[]
  category?: string
  hasStock?: boolean
  hasDiscount?: boolean
  search?: string
  batchId?: string
}

export type ProductSort = {
  by?: 'name' | 'price' | 'createdAt'
  dir?: 'asc' | 'desc'
}

export type QueryPagination = {
  page?: number
  pageSize?: number
}

export type ProductQuery = {
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
