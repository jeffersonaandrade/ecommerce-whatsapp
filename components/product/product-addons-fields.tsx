'use client'

import { useState } from 'react'
import { PersonalizationAddon } from '@/types/cart-addons'
import { PersonalizationSettings } from '@/types/personalization-settings'
import { formatPrice } from '@/lib/formatters'

type ProductAddonsFieldsProps = {
  settings: PersonalizationSettings
  unitPrice: number
  onChange: (enabled: boolean, addon: PersonalizationAddon | null) => void
  error?: string | null
}

export function ProductAddonsFields({
  settings,
  unitPrice,
  onChange,
  error,
}: ProductAddonsFieldsProps) {
  const [enabled, setEnabled] = useState(false)
  const [name, setName] = useState('')
  const [number, setNumber] = useState('')
  const [notes, setNotes] = useState('')

  function emit(nextEnabled: boolean, nextName: string, nextNumber: string, nextNotes: string) {
    if (!nextEnabled) {
      onChange(false, null)
      return
    }
    onChange(true, {
      name: nextName,
      number: nextNumber,
      notes: nextNotes.trim() || undefined,
    })
  }

  function handleToggle(checked: boolean) {
    setEnabled(checked)
    emit(checked, name, number, notes)
  }

  return (
    <div className="space-y-4 rounded-lg border border-hairline bg-soft-cloud p-4">
      <label className="flex cursor-pointer items-start gap-3">
        <input
          type="checkbox"
          checked={enabled}
          onChange={(e) => handleToggle(e.target.checked)}
          className="mt-1 h-4 w-4 rounded border-hairline"
        />
        <span>
          <span className="block text-sm font-semibold text-ink">
            Adicionar personalização
          </span>
          <span className="text-sm text-mute">
            + {formatPrice(unitPrice)} por peça
          </span>
        </span>
      </label>

      {enabled && (
        <div className="space-y-3 border-t border-hairline pt-4">
          <div>
            <label htmlFor="perso-name" className="mb-1 block text-sm font-medium text-ink">
              Nome na camisa
            </label>
            <input
              id="perso-name"
              type="text"
              maxLength={settings.nameMaxLength}
              value={name}
              onChange={(e) => {
                setName(e.target.value)
                emit(true, e.target.value, number, notes)
              }}
              className="w-full rounded-lg border border-hairline px-3 py-2 text-sm"
              placeholder={`Até ${settings.nameMaxLength} caracteres`}
            />
          </div>

          <div>
            <label htmlFor="perso-number" className="mb-1 block text-sm font-medium text-ink">
              Número
            </label>
            <input
              id="perso-number"
              type="number"
              min={settings.numberMin}
              max={settings.numberMax}
              value={number}
              onChange={(e) => {
                setNumber(e.target.value)
                emit(true, name, e.target.value, notes)
              }}
              className="w-full rounded-lg border border-hairline px-3 py-2 text-sm"
              placeholder={`${settings.numberMin}–${settings.numberMax}`}
            />
          </div>

          <div>
            <label htmlFor="perso-notes" className="mb-1 block text-sm font-medium text-ink">
              Observação{settings.notesRequired ? ' *' : ''}
            </label>
            <textarea
              id="perso-notes"
              maxLength={settings.notesMaxLength}
              rows={2}
              value={notes}
              onChange={(e) => {
                setNotes(e.target.value)
                emit(true, name, number, e.target.value)
              }}
              className="w-full rounded-lg border border-hairline px-3 py-2 text-sm"
              placeholder={
                settings.notesRequired
                  ? 'Obrigatório'
                  : 'Opcional — detalhes para a confecção'
              }
            />
          </div>
        </div>
      )}

      {error && (
        <p className="text-sm font-medium text-error" role="alert">
          {error}
        </p>
      )}
    </div>
  )
}
