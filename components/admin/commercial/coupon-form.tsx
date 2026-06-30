'use client'

import { useState, useTransition } from 'react'
import { useRouter } from 'next/navigation'
import {
  CommercialAction,
  CommercialRule,
  CommercialRuleConditions,
  CommercialRuleStatus,
} from '@/types/commercial-rule'
import type { Category } from '@/types/category'
import { Button } from '@/components/ui/button'
import { Alert } from '@/components/ui/alert'
import { MoneyInput } from '@/components/admin/money-input'
import {
  createCouponRuleAction,
  updateCouponRuleAction,
} from '@/lib/commercial/commercial-coupon-actions'
import { COMMERCIAL_RULE_STATUS_LABELS } from '@/lib/commercial/commercial-rule-labels'
import { normalizeCouponCode } from '@/lib/commercial/commercial-rule-mapper'

type CouponFormProps = {
  mode: 'create' | 'edit'
  rule?: CommercialRule
  categories: Category[]
}

function parseProductIds(value: string): string[] {
  return value
    .split(/[,\n]/)
    .map((s) => s.trim())
    .filter(Boolean)
}

export function CouponForm({ mode, rule, categories }: CouponFormProps) {
  const router = useRouter()
  const [isPending, startTransition] = useTransition()
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)

  const primaryAction = rule?.actions[0]
  const [name, setName] = useState(rule?.name ?? '')
  const [code, setCode] = useState(rule?.code ?? '')
  const [status, setStatus] = useState<CommercialRuleStatus>(rule?.status ?? 'draft')
  const [discountType, setDiscountType] = useState<'discount_percent' | 'discount_fixed'>(
    primaryAction?.type === 'discount_fixed' ? 'discount_fixed' : 'discount_percent'
  )
  const [discountValue, setDiscountValue] = useState<number | null>(
    primaryAction?.value ?? null
  )
  const [minSubtotal, setMinSubtotal] = useState<number | null>(
    rule?.conditions.minSubtotal ?? null
  )
  const [minQty, setMinQty] = useState(rule?.conditions.minQty ?? 0)
  const [selectedCategoryIds, setSelectedCategoryIds] = useState<string[]>(
    rule?.conditions.categoryIds ?? []
  )
  const [productIdsText, setProductIdsText] = useState(
    (rule?.conditions.productIds ?? []).join(', ')
  )
  const [usageLimit, setUsageLimit] = useState<number | null>(rule?.usageLimit ?? null)
  const [startsAt, setStartsAt] = useState(
    rule?.startsAt ? rule.startsAt.slice(0, 16) : ''
  )
  const [endsAt, setEndsAt] = useState(rule?.endsAt ? rule.endsAt.slice(0, 16) : '')

  function buildConditions(): CommercialRuleConditions {
    const productIds = parseProductIds(productIdsText)
    return {
      minSubtotal: minSubtotal != null && minSubtotal > 0 ? minSubtotal : undefined,
      minQty: minQty > 0 ? minQty : undefined,
      categoryIds: selectedCategoryIds.length > 0 ? selectedCategoryIds : undefined,
      productIds: productIds.length > 0 ? productIds : undefined,
    }
  }

  function buildActions(): CommercialAction[] {
    return [
      {
        type: discountType,
        value: discountValue ?? 0,
      },
    ]
  }

  function toggleCategory(id: string) {
    setSelectedCategoryIds((prev) =>
      prev.includes(id) ? prev.filter((c) => c !== id) : [...prev, id]
    )
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError(null)
    setSuccess(false)

    if (discountValue == null || discountValue <= 0) {
      setError('Informe o valor do desconto.')
      return
    }

    const payload = {
      name: name.trim(),
      code: normalizeCouponCode(code),
      status,
      conditions: buildConditions(),
      actions: buildActions(),
      usageLimit: usageLimit != null && usageLimit > 0 ? usageLimit : null,
      startsAt: startsAt ? new Date(startsAt).toISOString() : null,
      endsAt: endsAt ? new Date(endsAt).toISOString() : null,
    }

    startTransition(async () => {
      if (mode === 'create') {
        const result = await createCouponRuleAction(payload)
        if (!result.ok) {
          setError(result.error)
          return
        }
        router.push(`/admin/comercial/cupons/${result.id}?created=1`)
        router.refresh()
        return
      }

      if (!rule) return
      const result = await updateCouponRuleAction(rule.id, payload)
      if (!result.ok) {
        setError(result.error)
        return
      }
      setSuccess(true)
      router.refresh()
    })
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="mx-auto max-w-2xl space-y-4 rounded-lg border border-hairline bg-canvas p-6"
    >
      {error && <Alert type="error" message={error} />}
      {success && <Alert type="success" message="Cupom salvo com sucesso." />}

      <label className="block space-y-1">
        <span className="text-sm font-medium text-ink">Nome do cupom *</span>
        <input
          required
          value={name}
          onChange={(e) => setName(e.target.value)}
          className="w-full rounded-lg border border-hairline px-3 py-2 text-sm"
          placeholder="Ex.: Bem-vindo 10%"
        />
      </label>

      <label className="block space-y-1">
        <span className="text-sm font-medium text-ink">Código *</span>
        <input
          required
          value={code}
          onChange={(e) => setCode(e.target.value.toUpperCase())}
          className="w-full rounded-lg border border-hairline px-3 py-2 text-sm uppercase"
          placeholder="BEMVINDO10"
        />
      </label>

      <label className="block space-y-1">
        <span className="text-sm font-medium text-ink">Status</span>
        <select
          value={status}
          onChange={(e) => setStatus(e.target.value as CommercialRuleStatus)}
          className="w-full rounded-lg border border-hairline bg-white px-3 py-2 text-sm"
        >
          {(Object.keys(COMMERCIAL_RULE_STATUS_LABELS) as CommercialRuleStatus[])
            .filter((s) => s !== 'archived')
            .map((s) => (
              <option key={s} value={s}>
                {COMMERCIAL_RULE_STATUS_LABELS[s]}
              </option>
            ))}
        </select>
      </label>

      <div className="grid gap-3 sm:grid-cols-2">
        <label className="block space-y-1">
          <span className="text-sm font-medium text-ink">Tipo de desconto</span>
          <select
            value={discountType}
            onChange={(e) =>
              setDiscountType(e.target.value as 'discount_percent' | 'discount_fixed')
            }
            className="w-full rounded-lg border border-hairline bg-white px-3 py-2 text-sm"
          >
            <option value="discount_percent">Percentual (%)</option>
            <option value="discount_fixed">Valor fixo (R$)</option>
          </select>
        </label>
        <label className="block space-y-1">
          <span className="text-sm font-medium text-ink">Valor do desconto *</span>
          {discountType === 'discount_fixed' ? (
            <MoneyInput value={discountValue} onChange={setDiscountValue} />
          ) : (
            <input
              type="number"
              min={0.01}
              max={100}
              step={0.01}
              value={discountValue ?? ''}
              onChange={(e) => setDiscountValue(Number(e.target.value) || null)}
              className="w-full rounded-lg border border-hairline px-3 py-2 text-sm"
            />
          )}
        </label>
      </div>

      <div className="grid gap-3 sm:grid-cols-2">
        <label className="block space-y-1">
          <span className="text-sm font-medium text-ink">Pedido mínimo (R$)</span>
          <MoneyInput value={minSubtotal} onChange={setMinSubtotal} />
        </label>
        <label className="block space-y-1">
          <span className="text-sm font-medium text-ink">Quantidade mínima</span>
          <input
            type="number"
            min={0}
            value={minQty}
            onChange={(e) => setMinQty(Number(e.target.value) || 0)}
            className="w-full rounded-lg border border-hairline px-3 py-2 text-sm"
          />
        </label>
      </div>

      <fieldset className="space-y-2 rounded-lg border border-hairline p-4">
        <legend className="px-1 text-sm font-medium text-ink">Categorias elegíveis</legend>
        <p className="text-xs text-mute">Vazio = todas as categorias.</p>
        <div className="max-h-40 space-y-1 overflow-y-auto">
          {categories.map((cat) => (
            <label key={cat.id} className="flex items-center gap-2 text-sm text-ink">
              <input
                type="checkbox"
                checked={selectedCategoryIds.includes(cat.id)}
                onChange={() => toggleCategory(cat.id)}
              />
              {cat.name}
            </label>
          ))}
        </div>
      </fieldset>

      <label className="block space-y-1">
        <span className="text-sm font-medium text-ink">Produtos elegíveis (IDs)</span>
        <textarea
          value={productIdsText}
          onChange={(e) => setProductIdsText(e.target.value)}
          rows={2}
          className="w-full rounded-lg border border-hairline px-3 py-2 text-sm"
          placeholder="uuid-produto-1, uuid-produto-2"
        />
        <p className="text-xs text-mute">Separados por vírgula. Vazio = todos os produtos.</p>
      </label>

      <label className="block space-y-1">
        <span className="text-sm font-medium text-ink">Limite total de uso</span>
        <input
          type="number"
          min={0}
          value={usageLimit ?? ''}
          onChange={(e) => setUsageLimit(Number(e.target.value) || null)}
          className="w-full rounded-lg border border-hairline px-3 py-2 text-sm"
          placeholder="Ilimitado"
        />
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

      {mode === 'edit' && rule && (
        <p className="text-xs text-mute">
          Usos: {rule.usageCount}
          {rule.usageLimit != null ? ` / ${rule.usageLimit}` : ' (sem limite)'}
        </p>
      )}

      <Button type="submit" disabled={isPending}>
        {isPending ? 'Salvando...' : mode === 'create' ? 'Criar cupom' : 'Salvar alterações'}
      </Button>
    </form>
  )
}
