'use client'

import { useEffect, useTransition, useState } from 'react'
import { useRouter } from 'next/navigation'
import { getButtonClassName } from '@/components/ui/button'
import {
  bulkValidateForActivationAction,
  bulkActivateWithOptionsAction,
} from '@/lib/catalog/actions'
import {
  PUBLICATION_ERROR_LABELS,
  type BulkValidationSummary,
} from '@/lib/catalog/publication-rules'

type Props = {
  selectedIds: string[]
  onClose: () => void
  storePersonalizationEnabled?: boolean
}

export function BulkActivateDialog({ selectedIds, onClose, storePersonalizationEnabled = false }: Props) {
  const router = useRouter()
  const [isPending, startTransition] = useTransition()
  const [summary, setSummary] = useState<BulkValidationSummary | null>(null)
  const [validationError, setValidationError] = useState<string | null>(null)
  const [enablePersonalization, setEnablePersonalization] = useState(false)

  useEffect(() => {
    let cancelled = false
    bulkValidateForActivationAction(selectedIds).then((result) => {
      if (cancelled) return
      if (result.ok) {
        setSummary(result.summary)
      } else {
        setValidationError(result.error)
      }
    })
    return () => {
      cancelled = true
    }
  }, [selectedIds])

  function handleActivate() {
    if (!summary?.validIds.length) return
    startTransition(async () => {
      const result = await bulkActivateWithOptionsAction(summary.validIds, {
        enablePersonalization,
      })
      if (!result.ok) {
        setValidationError(result.error)
        return
      }
      onClose()
      router.refresh()
    })
  }

  const canActivate = (summary?.validIds.length ?? 0) > 0 && !isPending
  const showPersonalizationOpt =
    storePersonalizationEnabled && (summary?.validIds.length ?? 0) > 0

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-ink/60" onClick={onClose} />

      <div className="relative w-full max-w-lg rounded-xl border border-hairline bg-canvas shadow-xl">
        <div className="border-b border-hairline px-6 py-4">
          <h2 className="text-lg font-semibold text-ink">Publicar produtos</h2>
        </div>

        <div className="px-6 py-5">
          {/* Loading */}
          {!summary && !validationError && (
            <p className="text-sm text-mute">Validando {selectedIds.length} produto{selectedIds.length !== 1 ? 's' : ''}…</p>
          )}

          {/* Error */}
          {validationError && (
            <p className="text-sm text-red-600">{validationError}</p>
          )}

          {/* Summary */}
          {summary && (
            <div className="space-y-4">
              <div className="grid grid-cols-3 gap-3 text-center">
                <div className="rounded-lg border border-hairline px-3 py-3">
                  <p className="text-2xl font-bold text-ink">{summary.total}</p>
                  <p className="text-xs text-mute">Analisados</p>
                </div>
                <div className="rounded-lg border border-hairline px-3 py-3">
                  <p className="text-2xl font-bold text-green-600">{summary.validIds.length}</p>
                  <p className="text-xs text-mute">Prontos</p>
                </div>
                <div className="rounded-lg border border-hairline px-3 py-3">
                  <p className="text-2xl font-bold text-amber-600">{summary.invalid.length}</p>
                  <p className="text-xs text-mute">Com problemas</p>
                </div>
              </div>

              {summary.invalid.length > 0 && (
                <div>
                  <p className="mb-2 text-xs font-medium uppercase tracking-wide text-mute">
                    Produtos com problemas
                  </p>
                  <ul className="max-h-56 space-y-2 overflow-y-auto pr-1">
                    {summary.invalid.map((item) => (
                      <li
                        key={item.productId}
                        className="rounded-lg border border-hairline bg-soft-cloud px-3 py-2"
                      >
                        <p className="text-sm font-medium text-ink">{item.productName}</p>
                        <p className="mt-0.5 text-xs text-red-600">
                          {item.errors.map((e) => PUBLICATION_ERROR_LABELS[e]).join(' · ')}
                        </p>
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {summary.validIds.length === 0 && summary.invalid.length > 0 && (
                <p className="text-sm text-mute">
                  Nenhum produto pode ser publicado. Corrija os problemas acima e tente novamente.
                </p>
              )}

              {/* Personalization opt-in */}
              {showPersonalizationOpt && (
                <div className="space-y-2 rounded-lg border border-hairline bg-soft-cloud px-4 py-3">
                  <label className="flex cursor-pointer items-start gap-3">
                    <input
                      type="checkbox"
                      checked={enablePersonalization}
                      onChange={(e) => setEnablePersonalization(e.target.checked)}
                      className="mt-0.5 h-4 w-4 rounded border-hairline accent-ink"
                    />
                    <span className="text-sm font-medium text-ink">
                      Também permitir nome e número nestes produtos
                    </span>
                  </label>
                  {enablePersonalization && summary.hasMixedCategories && (
                    <p className="ml-7 text-xs text-amber-700">
                      Você selecionou produtos de categorias diferentes. Ative essa opção apenas se todos aceitarem nome e número.
                    </p>
                  )}
                  <p className="ml-7 text-xs text-mute">
                    Produtos sem preço próprio de personalização usarão o valor padrão da loja.
                  </p>
                </div>
              )}
            </div>
          )}
        </div>

        <div className="flex items-center justify-end gap-3 border-t border-hairline px-6 py-4">
          <button
            type="button"
            onClick={onClose}
            disabled={isPending}
            className={getButtonClassName('outline', 'sm')}
          >
            Cancelar
          </button>
          <button
            type="button"
            onClick={handleActivate}
            disabled={!canActivate}
            className={getButtonClassName('default', 'sm')}
          >
            {isPending
              ? 'Publicando…'
              : summary
                ? `Publicar ${summary.validIds.length} produto${summary.validIds.length !== 1 ? 's' : ''}`
                : 'Publicar'}
          </button>
        </div>
      </div>
    </div>
  )
}
