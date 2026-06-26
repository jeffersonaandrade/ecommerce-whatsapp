import type { Category } from '@/types/category'
import type { QueryPagination } from './product-query'

export type CategoryFilters = {
  visible?: boolean
  search?: string
}

export type CategoryQuery = {
  filters?: CategoryFilters
  pagination?: QueryPagination
}

export type CategoryQueryResult = {
  categories: Category[]
  total: number
  page: number
  pageSize: number
  totalPages: number
}
