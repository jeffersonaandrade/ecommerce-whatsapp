import type { QueryPagination } from './product-query'

export type StorefrontProductQuery = {
  category?: string
  q?: string
  pagination?: QueryPagination
  fields?: 'list' | 'full'
}
