'use client'

import { useState, useTransition } from 'react'
import { useRouter } from 'next/navigation'
import {
  CommercialRule,
  CommercialRuleInput,
  CommercialRuleStatus,
} from '@/types/commercial-rule'
import { Button } from '@/components/ui/button'
import { Alert } from '@/components/ui/alert'
import { MoneyInput } from '@/components/admin/money-input'
import { PromotionSimulator } from '@/components/admin/commercial/promotion-simulator'
import {
  createCommercialRuleAction,
  updateCommercialRuleAction,
} from '@/lib/commercial/commercial-actions'
import { COMMERCIAL_RULE_STATUS_LABELS } from '@/lib/commercial/commercial-rule-labels'

type PromotionFormProps = {
  mode: 'create' | 'edit'
  rule?: CommercialRule
}

export function PromotionForm({ mode, rule }: PromotionFormProps) {
  const router = useRouter()
  const [isPending, startTransition] = useTransition()
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)

  const [name, setName] = useState(rule?.name ?? '')
  const [status, setStatus] = useState<CommercialRuleStatus>(rule?.status ?? 'draft')
  const [priority, setPriority] = useState(rule?.priority ?? 10)
  const [requiredQuantity, setRequiredQuantity] = useState(
    rule?.config.requiredQuantity ?? 3
  )
  const [discountAmount, setDiscountAmount] = useState<number | null>(
    rule?.config.discountAmount ?? null
  )
  const [startsAt, setStartsAt] = useState(
    rule?.startsAt ? rule.startsAt.slice(0, 16) : ''
  )
  const [endsAt, setEndsAt] = useState(rule?.endsAt ? rule.endsAt.slice(0, 16) : '')

  function buildInput(): CommercialRuleInput {
    return {
      name: name.trim(),
      type: 'quantity_discount',
      status,
      priority,
      appliesTo: 'all_products',
      startsAt: startsAt ? new Date(startsAt).toISOString() : null,
      endsAt: endsAt ? new Date(endsAt).toISOString() : null,
      config: {
        requiredQuantity,
        discountAmount: discountAmount ?? 0,
      },
    }
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError(null)
    setSuccess(false)

    if (discountAmount == null || discountAmount <= 0) {
      setError('Informe o valor do desconto.')
      return
    }

    startTransition(async () => {
      const input = buildInput()
      if (mode === 'create') {
        const result = await createCommercialRuleAction(input)
        if (!result.ok) {
          setError(result.error)
          return
        }
        router.push(`/admin/comercial/promocoes/${result.id}?created=1`)
        router.refresh()
        return
      }

      if (!rule) return
      const result = await updateCommercialRuleAction(rule.id, input)
      if (!result.ok) {
        setError(result.error)
        return
      }
      setSuccess(true)
      router.refresh()
    })
  }

  return (
    <form onSubmit={handleSubmit} className="grid gap-8 lg:grid-cols-2">
      <div className="space-y-4 rounded-lg border border-hairline bg-canvas p-6">
        {error && <Alert type="error" message={error} />}
        {success && (
          <Alert type="success" message="Promoção salva com sucesso." />
        )}

        <label className="block space-y-1">
          <span className="text-sm font-medium text-ink">Nome da promoção *</span>
          <input
            required
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="w-full rounded-lg border border-hairline px-3 py-2 text-sm"
            placeholder="Ex.: Leve 3 com desconto"
          />
        </label>

        <label className="block space-y-1">
          <span className="text-sm font-medium text-ink">Status</span>
          <select
            value={status}
            onChange={(e) => setStatus(e.target.value as CommercialRuleStatus)}
            className="w-full rounded-lg border border-hairline bg-white px-3 py-2 text-sm"
          >
            {(Object.keys(COMMERCIAL_RULE_STATUS_LABELS) as CommercialRuleStatus[]).map(
              (s) => (
                <option key={s} value={s}>
                  {COMMERCIAL_RULE_STATUS_LABELS[s]}
                </option>
              )
            )}
          </select>
        </label>

        <label className="block space-y-1">
          <span className="text-sm font-medium text-ink">Prioridade</span>
          <input
            type="number"
            value={priority}
            onChange={(e) => setPriority(Number(e.target.value) || 0)}
            className="w-full rounded-lg border border-hairline px-3 py-2 text-sm"
          />
          <p className="text-xs text-mute">
            Maior prioridade vence quando várias promoções estão elegíveis.
          </p>
        </label>

        <label className="block space-y-1">
          <span className="text-sm font-medium text-ink">Quantidade necessária *</span>
          <input
            type="number"
            min={2}
            required
            value={requiredQuantity}
            onChange={(e) => setRequiredQuantity(Number(e.target.value) || 2)}
            className="w-full rounded-lg border border-hairline px-3 py-2 text-sm"
          />
        </label>

        <label className="block space-y-1">
          <span className="text-sm font-medium text-ink">Valor do desconto por grupo *</span>
          <MoneyInput value={discountAmount} onChange={setDiscountAmount} />
        </label>

        <div className="grid gap-3 sm:grid-cols-2">
          <label className="block space-y-1">
            <span className="text-sm font-medium text-ink">Início (opcional)</span>
            <input
              type="datetime-local"
              value={startsAt}
              onChange={(e) => setStartsAt(e.target.value)}
              className="w-full rounded-lg border border-hairline px-3 py-2 text-sm"
            />
          </label>
          <label className="block space-y-1">
            <span className="text-sm font-medium text-ink">Fim (opcional)</span>
            <input
              type="datetime-local"
              value={endsAt}
              onChange={(e) => setEndsAt(e.target.value)}
              className="w-full rounded-lg border border-hairline px-3 py-2 text-sm"
            />
          </label>
        </div>

        <Button type="submit" disabled={isPending}>
          {isPending ? 'Salvando...' : mode === 'create' ? 'Criar promoção' : 'Salvar alterações'}
        </Button>
      </div>

      <PromotionSimulator
        name={name}
        priority={priority}
        requiredQuantity={requiredQuantity}
        discountAmount={discountAmount ?? 0}
      />
    </form>
  )
}
