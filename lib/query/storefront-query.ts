import type { QueryPagination } from './product-query'

export type StorefrontProductQuery = {
  category?: string
  pagination?: QueryPagination
  fields?: 'list' | 'full'
}
