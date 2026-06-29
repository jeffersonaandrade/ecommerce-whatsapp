import type { ProductFilters } from '@/lib/query'

export function hasAnyAdminFilter(filters: ProductFilters): boolean {
  return Boolean(
    filters.status?.length ||
      filters.category ||
      filters.search ||
      filters.batchId ||
      filters.hasStock !== undefined ||
      filters.hasDiscount ||
      (filters.mediaStatus && filters.mediaStatus !== 'all')
  )
}

export function isCatalogWideFilter(filters: ProductFilters, total: number, catalogTotal: number): boolean {
  return !hasAnyAdminFilter(filters) && total === catalogTotal
}

export const BULK_MOVE_CONFIRM_THRESHOLD = 50
