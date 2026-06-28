'use client'

import { useState, useTransition } from 'react'
import { PersonalizationSettings } from '@/types/personalization-settings'
import { Button } from '@/components/ui/button'
import { MoneyInput } from '@/components/admin/money-input'
import { updatePersonalizationSettingsAction } from '@/lib/personalization/actions'

type PersonalizationSettingsFormProps = {
  initial: PersonalizationSettings
}

export function PersonalizationSettingsForm({
  initial,
}: PersonalizationSettingsFormProps) {
  const [isPending, startTransition] = useTransition()
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)

  const [enabled, setEnabled] = useState(initial.enabled)
  const [defaultPrice, setDefaultPrice] = useState<number | null>(initial.defaultPrice)
  const [nameMaxLength, setNameMaxLength] = useState(initial.nameMaxLength)
  const [numberMin, setNumberMin] = useState(initial.numberMin)
  const [numberMax, setNumberMax] = useState(initial.numberMax)
  const [notesRequired, setNotesRequired] = useState(initial.notesRequired)
  const [notesMaxLength, setNotesMaxLength] = useState(initial.notesMaxLength)

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError(null)
    setSuccess(false)

    startTransition(async () => {
      const result = await updatePersonalizationSettingsAction({
        enabled,
        defaultPrice: defaultPrice ?? 0,
        nameMaxLength,
        numberMin,
        numberMax,
        notesRequired,
        notesMaxLength,
      })

      if (!result.ok) {
        setError(result.error)
        return
      }
      setSuccess(true)
    })
  }

  return (
    <form onSubmit={handleSubmit} className="mx-auto max-w-2xl space-y-6 rounded-lg border border-hairline bg-canvas p-6">
      <label className="flex items-center gap-2 text-sm font-medium text-ink">
        <input
          type="checkbox"
          checked={enabled}
          onChange={(e) => setEnabled(e.target.checked)}
          className="h-4 w-4 rounded border-hairline"
        />
        Personalização ativa na loja
      </label>

      <label className="block space-y-1">
        <span className="text-sm font-medium text-ink">Preço padrão da personalização</span>
        <MoneyInput value={defaultPrice} onChange={setDefaultPrice} />
      </label>

      <div className="grid gap-4 sm:grid-cols-2">
        <label className="block space-y-1">
          <span className="text-sm font-medium text-ink">Máx. caracteres — nome</span>
          <input
            type="number"
            min={1}
            value={nameMaxLength}
            onChange={(e) => setNameMaxLength(Number(e.target.value) || 1)}
            className="w-full rounded-lg border border-hairline px-3 py-2 text-sm"
          />
        </label>
        <label className="block space-y-1">
          <span className="text-sm font-medium text-ink">Máx. caracteres — observação</span>
          <input
            type="number"
            min={1}
            value={notesMaxLength}
            onChange={(e) => setNotesMaxLength(Number(e.target.value) || 1)}
            className="w-full rounded-lg border border-hairline px-3 py-2 text-sm"
          />
        </label>
        <label className="block space-y-1">
          <span className="text-sm font-medium text-ink">Número mínimo</span>
          <input
            type="number"
            value={numberMin}
            onChange={(e) => setNumberMin(Number(e.target.value) || 0)}
            className="w-full rounded-lg border border-hairline px-3 py-2 text-sm"
          />
        </label>
        <label className="block space-y-1">
          <span className="text-sm font-medium text-ink">Número máximo</span>
          <input
            type="number"
            value={numberMax}
            onChange={(e) => setNumberMax(Number(e.target.value) || 99)}
            className="w-full rounded-lg border border-hairline px-3 py-2 text-sm"
          />
        </label>
      </div>

      <label className="flex items-start gap-2 text-sm font-medium text-ink">
        <input
          type="checkbox"
          checked={notesRequired}
          onChange={(e) => setNotesRequired(e.target.checked)}
          className="mt-0.5 h-4 w-4 rounded border-hairline"
        />
        <span>
          Exigir observação na personalização
          <span className="mt-0.5 block text-xs font-normal text-mute">
            Desmarcado por padrão. O cliente usa observação só para detalhes extras além do nome e número.
          </span>
        </span>
      </label>

      {error && <p className="text-sm text-error">{error}</p>}
      {success && (
        <p className="text-sm font-medium text-success" role="status">
          Configurações salvas.
        </p>
      )}

      <Button type="submit" disabled={isPending}>
        {isPending ? 'Salvando...' : 'Salvar personalização'}
      </Button>
    </form>
  )
}
