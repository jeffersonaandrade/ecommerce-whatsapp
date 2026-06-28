'use client'

import { useState, useTransition } from 'react'
import { useRouter } from 'next/navigation'
import { getButtonClassName } from '@/components/ui/button'
import {
  bulkSetProductStatusAction,
  bulkDeleteProductsAction,
} from '@/lib/catalog/actions'
import { BulkActivateDialog } from './bulk-activate-dialog'

type BulkActionsBarProps = {
  selectedIds: string[]
  onClear: () => void
  storePersonalizationEnabled?: boolean
}

export function BulkActionsBar({ selectedIds, onClear, storePersonalizationEnabled = false }: BulkActionsBarProps) {
  const router = useRouter()
  const [isPending, startTransition] = useTransition()
  const [showActivateDialog, setShowActivateDialog] = useState(false)
  const count = selectedIds.length

  if (count === 0) return null

  function handleAction(action: () => Promise<{ ok: boolean; error?: string; count?: number }>) {
    startTransition(async () => {
      const result = await action()
      if (!result.ok && 'error' in result) {
        window.alert(result.error)
        return
      }
      onClear()
      router.refresh()
    })
  }

  return (
    <>
      {showActivateDialog && (
        <BulkActivateDialog
          selectedIds={selectedIds}
          onClose={() => {
            setShowActivateDialog(false)
            onClear()
          }}
          storePersonalizationEnabled={storePersonalizationEnabled}
        />
      )}

      <div className="fixed bottom-0 left-0 right-0 z-40 border-t border-hairline bg-canvas shadow-lg">
        <div className="mx-auto flex max-w-7xl items-center justify-between gap-4 px-4 py-3 sm:px-6 lg:px-8">
          <span className="text-sm font-medium text-ink">
            {count} produto{count !== 1 ? 's' : ''} selecionado{count !== 1 ? 's' : ''}
          </span>

          <div className="flex items-center gap-2">
            <button
              type="button"
              disabled={isPending}
              onClick={() => setShowActivateDialog(true)}
              className={getButtonClassName('outline', 'sm')}
            >
              Ativar
            </button>

            <button
              type="button"
              disabled={isPending}
              onClick={() =>
                handleAction(() => bulkSetProductStatusAction(selectedIds, 'draft'))
              }
              className={getButtonClassName('outline', 'sm')}
            >
              Rascunho
            </button>

            <button
              type="button"
              disabled={isPending}
              onClick={() => {
                if (
                  !window.confirm(
                    `Excluir ${count} produto${count !== 1 ? 's' : ''}? Esta ação não pode ser desfeita.`
                  )
                )
                  return
                handleAction(() => bulkDeleteProductsAction(selectedIds))
              }}
              className={getButtonClassName('outline', 'sm', 'text-red-600 border-red-300 hover:bg-red-50')}
            >
              Excluir
            </button>

            <button
              type="button"
              onClick={onClear}
              className="text-sm text-mute hover:text-ink"
            >
              Cancelar
            </button>
          </div>
        </div>
      </div>
    </>
  )
}
