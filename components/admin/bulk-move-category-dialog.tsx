'use client'

import { useState, useTransition } from 'react'
import { useRouter } from 'next/navigation'
import { Category } from '@/types/category'
import type { ProductFilters } from '@/lib/query'
import { getButtonClassName } from '@/components/ui/button'
import {
  BULK_MOVE_CONFIRM_THRESHOLD,
  hasAnyAdminFilter,
  isCatalogWideFilter,
} from '@/lib/catalog/admin-product-filters'
import {
  bulkSetProductCategoryIdAction,
  bulkSetProductCategoryIdByFiltersAction,
} from '@/lib/catalog/actions'
import { CategoryTreePicker } from './category-tree-picker'

export type BulkMoveMode = 'selection' | 'allMatching'

type BulkMoveCategoryDialogProps = {
  mode: BulkMoveMode
  selectedIds: string[]
  filters: ProductFilters
  affectedCount: number
  catalogTotal: number
  categories: Category[]
  onClose: () => void
  onSuccess?: () => void
}

export function BulkMoveCategoryDialog({
  mode,
  selectedIds,
  filters,
  affectedCount,
  catalogTotal,
  categories,
  onClose,
  onSuccess,
}: BulkMoveCategoryDialogProps) {
  const router = useRouter()
  const [categoryId, setCategoryId] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [confirmLargeBatch, setConfirmLargeBatch] = useState(false)
  const [confirmCatalogWide, setConfirmCatalogWide] = useState(false)
  const [isPending, startTransition] = useTransition()

  const catalogWide = mode === 'allMatching' && isCatalogWideFilter(filters, affectedCount, catalogTotal)
  const needsLargeConfirm = affectedCount > BULK_MOVE_CONFIRM_THRESHOLD
  const canSubmit =
    Boolean(categoryId) &&
    (!needsLargeConfirm || confirmLargeBatch) &&
    (!catalogWide || confirmCatalogWide)

  const categoryName =
    categories.find((c) => c.id === categoryId)?.name ?? 'categoria selecionada'

  function handleSubmit() {
    if (!categoryId) {
      setError('Selecione uma categoria.')
      return
    }
    if (!canSubmit) {
      setError('Confirme a operação antes de continuar.')
      return
    }

    startTransition(async () => {
      const result =
        mode === 'selection'
          ? await bulkSetProductCategoryIdAction(selectedIds, categoryId)
          : await bulkSetProductCategoryIdByFiltersAction(filters, categoryId)

      if (!result.ok) {
        setError(result.error)
        return
      }

      window.alert(`${result.count} produto${result.count !== 1 ? 's' : ''} movido${result.count !== 1 ? 's' : ''} para ${categoryName}.`)
      onSuccess?.()
      onClose()
      router.refresh()
    })
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-ink/40 p-4">
      <div className="w-full max-w-lg rounded-lg border border-hairline bg-canvas p-6 shadow-xl">
        <h2 className="text-lg font-semibold text-ink">Mover para categoria</h2>
        <p className="mt-1 text-sm text-mute">
          {mode === 'selection' ? (
            <>
              {affectedCount} produto{affectedCount !== 1 ? 's' : ''} selecionado
              {affectedCount !== 1 ? 's' : ''} nesta página.
            </>
          ) : (
            <>
              {affectedCount} produto{affectedCount !== 1 ? 's' : ''} correspondem ao filtro
              atual
              {!hasAnyAdminFilter(filters) ? ' (catálogo inteiro)' : ''}.
            </>
          )}
        </p>

        <div className="mt-4">
          <CategoryTreePicker
            categories={categories}
            value={categoryId}
            onChange={(id) => {
              setCategoryId(id)
              setError(null)
            }}
            allowAnyNode
          />
        </div>

        {needsLargeConfirm && (
          <label className="mt-4 flex items-start gap-2 text-sm text-ink">
            <input
              type="checkbox"
              checked={confirmLargeBatch}
              onChange={(e) => setConfirmLargeBatch(e.target.checked)}
              className="mt-0.5 h-4 w-4 rounded border-hairline accent-ink"
            />
            <span>
              Confirmo mover {affectedCount} produtos para a categoria escolhida.
            </span>
          </label>
        )}

        {catalogWide && (
          <label className="mt-3 flex items-start gap-2 text-sm text-amber-900">
            <input
              type="checkbox"
              checked={confirmCatalogWide}
              onChange={(e) => setConfirmCatalogWide(e.target.checked)}
              className="mt-0.5 h-4 w-4 rounded border-hairline accent-ink"
            />
            <span>
              Entendo que esta ação afeta todo o catálogo ({catalogTotal} produtos) — nenhum
              filtro está ativo.
            </span>
          </label>
        )}

        {error && <p className="mt-3 text-sm text-red-600">{error}</p>}

        <div className="mt-6 flex justify-end gap-2">
          <button
            type="button"
            onClick={onClose}
            className={getButtonClassName('outline', 'sm')}
            disabled={isPending}
          >
            Cancelar
          </button>
          <button
            type="button"
            onClick={handleSubmit}
            className={getButtonClassName('default', 'sm')}
            disabled={isPending || !canSubmit}
          >
            {isPending ? 'Movendo…' : `Mover ${affectedCount} produto${affectedCount !== 1 ? 's' : ''}`}
          </button>
        </div>
      </div>
    </div>
  )
}
