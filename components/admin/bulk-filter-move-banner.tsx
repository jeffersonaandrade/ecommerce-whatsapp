'use client'

import { getButtonClassName } from '@/components/ui/button'
import { hasAnyAdminFilter } from '@/lib/catalog/admin-product-filters'
import type { ProductFilters } from '@/lib/query'

type BulkFilterMoveBannerProps = {
  selectedCount: number
  total: number
  catalogTotal: number
  filters: ProductFilters
  onMoveAll: () => void
  disabled?: boolean
}

export function BulkFilterMoveBanner({
  selectedCount,
  total,
  catalogTotal,
  filters,
  onMoveAll,
  disabled = false,
}: BulkFilterMoveBannerProps) {
  if (total === 0) return null

  const showMoveAll = total > selectedCount || (hasAnyAdminFilter(filters) && total > 0)
  if (!showMoveAll) return null

  return (
    <div className="mb-4 flex flex-col gap-3 rounded-lg border border-hairline bg-soft-cloud px-4 py-3 sm:flex-row sm:items-center sm:justify-between">
      <p className="text-sm text-ink">
        {selectedCount > 0 ? (
          <>
            <span className="font-medium">{selectedCount}</span> selecionado
            {selectedCount !== 1 ? 's' : ''} nesta página ·{' '}
            <span className="font-medium">{total}</span> no filtro atual
          </>
        ) : (
          <>
            <span className="font-medium">{total}</span> produto{total !== 1 ? 's' : ''}{' '}
            correspondem ao filtro atual
            {!hasAnyAdminFilter(filters) && catalogTotal === total ? ' (catálogo inteiro)' : ''}
          </>
        )}
      </p>
      <button
        type="button"
        disabled={disabled}
        onClick={onMoveAll}
        className={getButtonClassName('outline', 'sm', 'shrink-0')}
      >
        Mover todos os {total} resultados
      </button>
    </div>
  )
}
