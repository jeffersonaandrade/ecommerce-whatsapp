'use client'

import { useState, useTransition } from 'react'
import { useRouter } from 'next/navigation'
import { Category } from '@/types/category'
import { getButtonClassName } from '@/components/ui/button'
import { bulkSetProductCategoryIdAction } from '@/lib/catalog/actions'
import { CategoryTreePicker } from './category-tree-picker'

type BulkMoveCategoryDialogProps = {
  selectedIds: string[]
  categories: Category[]
  onClose: () => void
}

export function BulkMoveCategoryDialog({
  selectedIds,
  categories,
  onClose,
}: BulkMoveCategoryDialogProps) {
  const router = useRouter()
  const [categoryId, setCategoryId] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [isPending, startTransition] = useTransition()

  function handleSubmit() {
    if (!categoryId) {
      setError('Selecione uma categoria.')
      return
    }

    startTransition(async () => {
      const result = await bulkSetProductCategoryIdAction(selectedIds, categoryId)
      if (!result.ok) {
        setError(result.error)
        return
      }
      onClose()
      router.refresh()
    })
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-ink/40 p-4">
      <div className="w-full max-w-lg rounded-lg border border-hairline bg-canvas p-6 shadow-xl">
        <h2 className="text-lg font-semibold text-ink">Mover para categoria</h2>
        <p className="mt-1 text-sm text-mute">
          {selectedIds.length} produto{selectedIds.length !== 1 ? 's' : ''} selecionado
          {selectedIds.length !== 1 ? 's' : ''}.
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
            disabled={isPending}
          >
            {isPending ? 'Movendo…' : 'Mover produtos'}
          </button>
        </div>
      </div>
    </div>
  )
}
