'use client'

import { useState, useTransition } from 'react'
import { useRouter } from 'next/navigation'
import {
  CommercialPolicy,
  CommercialPolicyInput,
  EligibilityStrategy,
  PolicyAction,
  PolicyAccumulation,
  PolicySalesChannel,
  PolicyStageGates,
} from '@/types/commercial-policy'
import { Button } from '@/components/ui/button'
import { Alert } from '@/components/ui/alert'
import { MoneyInput } from '@/components/admin/money-input'
import {
  createCommercialPolicyAction,
  updateCommercialPolicyAction,
} from '@/lib/commercial/commercial-policy-actions'
import {
  ELIGIBILITY_STRATEGY_LABELS,
  POLICY_CHANNEL_LABELS,
  STAGE_GATE_LABELS,
} from '@/lib/commercial/commercial-policy-labels'
import { defaultStageGatesForChannel } from '@/lib/commercial/engine/sales-channel-defaults'

type PolicyFormProps = {
  mode: 'create' | 'edit'
  policy?: CommercialPolicy
}

function getPrimaryDiscountAction(actions: PolicyAction[]): {
  type: 'discount_percent' | 'discount_fixed'
  value: number
} {
  const percent = actions.find((a) => a.type === 'discount_percent')
  if (percent?.value) return { type: 'discount_percent', value: percent.value }
  const fixed = actions.find((a) => a.type === 'discount_fixed')
  if (fixed?.value) return { type: 'discount_fixed', value: fixed.value }
  return { type: 'discount_percent', value: 10 }
}

type GateKey = keyof PolicyStageGates

const GATE_KEYS: GateKey[] = [
  'allowAutoRules',
  'allowManualRules',
  'allowOtherPolicies',
  'allowAdjustments',
  'allowFreight',
]

export function PolicyForm({ mode, policy }: PolicyFormProps) {
  const router = useRouter()
  const [isPending, startTransition] = useTransition()
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)

  const initialDiscount = getPrimaryDiscountAction(policy?.actions ?? [])

  const [name, setName] = useState(policy?.name ?? '')
  const [channel, setChannel] = useState<PolicySalesChannel>(policy?.channel ?? 'wholesale')
  const [priority, setPriority] = useState(policy?.priority ?? 10)
  const [enabled, setEnabled] = useState(policy?.enabled ?? true)
  const [isDefault, setIsDefault] = useState(policy?.isDefault ?? false)
  const [minQty, setMinQty] = useState(policy?.conditions.minQty ?? 10)
  const [eligibilityStrategy, setEligibilityStrategy] = useState<EligibilityStrategy>(
    policy?.conditions.eligibilityStrategy ?? 'cart_total'
  )
  const [discountType, setDiscountType] = useState<'discount_percent' | 'discount_fixed'>(
    initialDiscount.type
  )
  const [discountValue, setDiscountValue] = useState<number | null>(initialDiscount.value)
  const [startsAt, setStartsAt] = useState(
    policy?.startsAt ? policy.startsAt.slice(0, 16) : ''
  )
  const [endsAt, setEndsAt] = useState(policy?.endsAt ? policy.endsAt.slice(0, 16) : '')

  const channelDefaults = defaultStageGatesForChannel(channel)
  const [accumulation, setAccumulation] = useState<PolicyAccumulation>(() => {
    if (policy?.accumulation && Object.keys(policy.accumulation).length > 0) {
      return policy.accumulation
    }
    return {}
  })
  const [useCustomAccumulation, setUseCustomAccumulation] = useState(
    Boolean(policy?.accumulation && Object.keys(policy.accumulation).length > 0)
  )

  function gateValue(key: GateKey): boolean {
    if (!useCustomAccumulation) return channelDefaults[key]
    return accumulation[key] ?? channelDefaults[key]
  }

  function setGateValue(key: GateKey, value: boolean) {
    setAccumulation((prev) => ({ ...prev, [key]: value }))
  }

  function buildInput(): CommercialPolicyInput {
    const actions: PolicyAction[] = [
      {
        type: discountType,
        value: discountType === 'discount_percent' ? (discountValue ?? 0) : (discountValue ?? 0),
      },
    ]

    const accumulationInput: PolicyAccumulation | undefined = useCustomAccumulation
      ? accumulation
      : undefined

    return {
      name: name.trim(),
      channel,
      priority,
      enabled,
      isDefault,
      conditions: {
        minQty: minQty > 0 ? minQty : undefined,
        eligibilityStrategy,
      },
      actions,
      accumulation: accumulationInput,
      startsAt: startsAt ? new Date(startsAt).toISOString() : null,
      endsAt: endsAt ? new Date(endsAt).toISOString() : null,
    }
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError(null)
    setSuccess(false)

    if (discountValue == null || discountValue <= 0) {
      setError('Informe o valor do desconto.')
      return
    }

    if (discountType === 'discount_percent' && discountValue > 100) {
      setError('Desconto percentual não pode exceder 100%.')
      return
    }

    startTransition(async () => {
      const input = buildInput()
      if (mode === 'create') {
        const result = await createCommercialPolicyAction(input)
        if (!result.ok) {
          setError(result.error)
          return
        }
        router.push(`/admin/comercial/politicas/${result.id}?created=1`)
        router.refresh()
        return
      }

      if (!policy) return
      const result = await updateCommercialPolicyAction(policy.id, input)
      if (!result.ok) {
        setError(result.error)
        return
      }
      setSuccess(true)
      router.refresh()
    })
  }

  return (
    <form onSubmit={handleSubmit} className="mx-auto max-w-2xl space-y-4 rounded-lg border border-hairline bg-canvas p-6">
      {error && <Alert type="error" message={error} />}
      {success && <Alert type="success" message="Política salva com sucesso." />}

      <label className="block space-y-1">
        <span className="text-sm font-medium text-ink">Nome da política *</span>
        <input
          required
          value={name}
          onChange={(e) => setName(e.target.value)}
          className="w-full rounded-lg border border-hairline px-3 py-2 text-sm"
          placeholder="Ex.: Atacado 10+ peças"
        />
      </label>

      <label className="block space-y-1">
        <span className="text-sm font-medium text-ink">Canal</span>
        <select
          value={channel}
          onChange={(e) => setChannel(e.target.value as PolicySalesChannel)}
          className="w-full rounded-lg border border-hairline bg-white px-3 py-2 text-sm"
        >
          {(Object.keys(POLICY_CHANNEL_LABELS) as PolicySalesChannel[]).map((c) => (
            <option key={c} value={c}>
              {POLICY_CHANNEL_LABELS[c]}
            </option>
          ))}
        </select>
        <p className="text-xs text-mute">
          Vitrine V1 usa canal varejo; políticas de atacado ficam prontas para quando a UI B2B existir.
        </p>
      </label>

      <div className="grid gap-3 sm:grid-cols-2">
        <label className="block space-y-1">
          <span className="text-sm font-medium text-ink">Prioridade</span>
          <input
            type="number"
            value={priority}
            onChange={(e) => setPriority(Number(e.target.value) || 0)}
            className="w-full rounded-lg border border-hairline px-3 py-2 text-sm"
          />
        </label>
        <label className="block space-y-1">
          <span className="text-sm font-medium text-ink">Quantidade mínima</span>
          <input
            type="number"
            min={1}
            value={minQty}
            onChange={(e) => setMinQty(Number(e.target.value) || 1)}
            className="w-full rounded-lg border border-hairline px-3 py-2 text-sm"
          />
        </label>
      </div>

      <label className="block space-y-1">
        <span className="text-sm font-medium text-ink">Critério de elegibilidade</span>
        <select
          value={eligibilityStrategy}
          onChange={(e) => setEligibilityStrategy(e.target.value as EligibilityStrategy)}
          className="w-full rounded-lg border border-hairline bg-white px-3 py-2 text-sm"
        >
          {(Object.keys(ELIGIBILITY_STRATEGY_LABELS) as EligibilityStrategy[]).map((s) => (
            <option key={s} value={s}>
              {ELIGIBILITY_STRATEGY_LABELS[s]}
            </option>
          ))}
        </select>
      </label>

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

      <fieldset className="space-y-3 rounded-lg border border-hairline p-4">
        <legend className="px-1 text-sm font-medium text-ink">Acumulação (gates)</legend>
        <label className="flex items-center gap-2 text-sm text-ink">
          <input
            type="checkbox"
            checked={useCustomAccumulation}
            onChange={(e) => setUseCustomAccumulation(e.target.checked)}
          />
          Sobrescrever defaults do canal
        </label>
        {!useCustomAccumulation && (
          <p className="text-xs text-mute">
            Usando defaults do canal ({POLICY_CHANNEL_LABELS[channel]}). Marque acima para customizar.
          </p>
        )}
        <div className="space-y-2">
          {GATE_KEYS.map((key) => (
            <label
              key={key}
              className={`flex items-center gap-2 text-sm text-ink ${!useCustomAccumulation ? 'opacity-60' : ''}`}
            >
              <input
                type="checkbox"
                checked={gateValue(key)}
                disabled={!useCustomAccumulation}
                onChange={(e) => setGateValue(key, e.target.checked)}
              />
              {STAGE_GATE_LABELS[key]}
            </label>
          ))}
        </div>
      </fieldset>

      <div className="flex flex-wrap gap-4">
        <label className="flex items-center gap-2 text-sm text-ink">
          <input
            type="checkbox"
            checked={enabled}
            onChange={(e) => setEnabled(e.target.checked)}
          />
          Ativa
        </label>
        <label className="flex items-center gap-2 text-sm text-ink">
          <input
            type="checkbox"
            checked={isDefault}
            onChange={(e) => setIsDefault(e.target.checked)}
          />
          Política padrão do canal
        </label>
      </div>

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
        {isPending ? 'Salvando...' : mode === 'create' ? 'Criar política' : 'Salvar alterações'}
      </Button>
    </form>
  )
}
