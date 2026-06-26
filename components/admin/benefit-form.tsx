'use client'

import { useState, useTransition } from 'react'
import { useRouter } from 'next/navigation'
import { BenefitItem } from '@/types/benefit-item'
import { Button } from '@/components/ui/button'
import {
  BENEFIT_DESCRIPTION_MAX,
  BENEFIT_TITLE_MAX,
} from '@/lib/benefits/constants'
import {
  createBenefitItemAction,
  deleteBenefitItemAction,
  updateBenefitItemAction,
} from '@/lib/benefits/benefit-actions'

type BenefitFormProps = {
  mode: 'create' | 'edit'
  benefit?: BenefitItem
}

export function BenefitForm({ mode, benefit }: BenefitFormProps) {
  const router = useRouter()
  const [isPending, startTransition] = useTransition()
  const [title, setTitle] = useState(benefit?.title ?? '')
  const [description, setDescription] = useState(benefit?.description ?? '')
  const [sortOrder, setSortOrder] = useState(String(benefit?.sortOrder ?? 0))
  const [active, setActive] = useState(benefit?.active ?? true)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)
  const [deleteConfirm, setDeleteConfirm] = useState(false)

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError(null)
    setSuccess(false)

    const payload = {
      title,
      description,
      sortOrder: parseInt(sortOrder, 10) || 0,
      active,
    }

    startTransition(async () => {
      if (mode === 'create') {
        const result = await createBenefitItemAction(payload)
        if (result.ok) {
          router.push('/admin/content/benefits')
          router.refresh()
        } else {
          setError(result.error)
        }
      } else if (benefit) {
        const result = await updateBenefitItemAction(benefit.id, payload)
        if (result.ok) {
          setSuccess(true)
          router.refresh()
        } else {
          setError(result.error)
        }
      }
    })
  }

  function handleDelete() {
    if (!benefit) return
    setError(null)
    startTransition(async () => {
      const result = await deleteBenefitItemAction(benefit.id)
      if (result.ok) {
        router.push('/admin/content/benefits')
        router.refresh()
      } else {
        setError(result.error)
        setDeleteConfirm(false)
      }
    })
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {error && (
        <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          {error}
        </div>
      )}
      {success && (
        <div className="rounded-lg border border-green-200 bg-green-50 px-4 py-3 text-sm text-green-700">
          Benefício salvo com sucesso.
        </div>
      )}

      <div className="space-y-4 rounded-lg border border-hairline bg-canvas p-6">
        <div>
          <label htmlFor="title" className="mb-1 block text-sm font-medium text-ink">
            Título
          </label>
          <input
            id="title"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            maxLength={BENEFIT_TITLE_MAX}
            required
            className="w-full rounded-md border border-hairline px-3 py-2 text-sm"
          />
          <p className="mt-1 text-xs text-mute">Máximo {BENEFIT_TITLE_MAX} caracteres.</p>
        </div>

        <div>
          <label htmlFor="description" className="mb-1 block text-sm font-medium text-ink">
            Descrição
          </label>
          <textarea
            id="description"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            maxLength={BENEFIT_DESCRIPTION_MAX}
            rows={3}
            className="w-full rounded-md border border-hairline px-3 py-2 text-sm"
          />
          <p className="mt-1 text-xs text-mute">Máximo {BENEFIT_DESCRIPTION_MAX} caracteres.</p>
        </div>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <div>
            <label htmlFor="sortOrder" className="mb-1 block text-sm font-medium text-ink">
              Ordem
            </label>
            <input
              id="sortOrder"
              type="number"
              min={0}
              value={sortOrder}
              onChange={(e) => setSortOrder(e.target.value)}
              className="w-full rounded-md border border-hairline px-3 py-2 text-sm"
            />
          </div>
          <div className="flex items-end">
            <label className="flex items-center gap-2 text-sm text-ink">
              <input
                type="checkbox"
                checked={active}
                onChange={(e) => setActive(e.target.checked)}
                className="rounded border-hairline"
              />
              Ativo na vitrine
            </label>
          </div>
        </div>
      </div>

      <div className="flex flex-wrap items-center gap-3">
        <Button type="submit" disabled={isPending}>
          {isPending ? 'Salvando…' : mode === 'create' ? 'Criar benefício' : 'Salvar alterações'}
        </Button>
        {mode === 'edit' && benefit && (
          <>
            {!deleteConfirm ? (
              <Button
                type="button"
                variant="outline"
                disabled={isPending}
                onClick={() => setDeleteConfirm(true)}
              >
                Excluir
              </Button>
            ) : (
              <>
                <Button
                  type="button"
                  variant="outline"
                  disabled={isPending}
                  onClick={handleDelete}
                  className="border-red-300 text-red-700"
                >
                  Confirmar exclusão
                </Button>
                <Button type="button" variant="outline" disabled={isPending} onClick={() => setDeleteConfirm(false)}>
                  Cancelar
                </Button>
              </>
            )}
          </>
        )}
      </div>
    </form>
  )
}
