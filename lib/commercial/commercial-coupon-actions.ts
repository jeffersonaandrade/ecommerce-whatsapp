'use server'

import { revalidatePath } from 'next/cache'
import { requireAdmin } from '@/lib/auth/require-admin'
import {
  CommercialRuleStatus,
  CouponRuleInput,
} from '@/types/commercial-rule'
import { getCommercialRuleRepository } from './get-commercial-rule-repository'
import { normalizeCouponCode } from './commercial-rule-mapper'

function revalidateCoupons() {
  revalidatePath('/admin/comercial')
  revalidatePath('/admin/comercial/cupons')
  revalidatePath('/cart')
  revalidatePath('/')
}

function validateCouponInput(input: CouponRuleInput): string | null {
  if (!input.name.trim()) return 'Informe o nome do cupom.'
  const code = normalizeCouponCode(input.code)
  if (!code) return 'Informe o código do cupom.'

  const action = input.actions[0]
  if (!action) return 'Informe o desconto do cupom.'
  if (action.type === 'discount_percent') {
    if (action.value <= 0 || action.value > 100) {
      return 'Desconto percentual deve estar entre 0 e 100.'
    }
  } else if (action.value <= 0) {
    return 'Desconto fixo deve ser maior que zero.'
  }

  if (input.usageLimit != null && input.usageLimit < 1) {
    return 'Limite de uso deve ser no mínimo 1.'
  }

  if (input.startsAt && input.endsAt) {
    if (new Date(input.startsAt) > new Date(input.endsAt)) {
      return 'Data de início deve ser anterior à data de fim.'
    }
  }

  return null
}

export async function createCouponRuleAction(
  input: CouponRuleInput
): Promise<{ ok: true; id: string } | { ok: false; error: string }> {
  const auth = await requireAdmin()
  if (!auth.ok) return { ok: false, error: auth.error }

  const error = validateCouponInput(input)
  if (error) return { ok: false, error }

  try {
    const repo = getCommercialRuleRepository()
    const rule = await repo.create({
      name: input.name.trim(),
      trigger: 'manual',
      code: normalizeCouponCode(input.code),
      status: input.status,
      priority: input.priority ?? 0,
      startsAt: input.startsAt ?? null,
      endsAt: input.endsAt ?? null,
      conditions: input.conditions ?? {},
      actions: input.actions,
      usageLimit: input.usageLimit ?? null,
      config: { requiredQuantity: 0, discountAmount: 0 },
    })
    revalidateCoupons()
    return { ok: true, id: rule.id }
  } catch (err) {
    return {
      ok: false,
      error: err instanceof Error ? err.message : 'Falha ao criar cupom.',
    }
  }
}

export async function updateCouponRuleAction(
  id: string,
  input: Partial<CouponRuleInput>
): Promise<{ ok: true } | { ok: false; error: string }> {
  const auth = await requireAdmin()
  if (!auth.ok) return { ok: false, error: auth.error }

  const repo = getCommercialRuleRepository()
  const existing = await repo.getById(id)
  if (!existing || existing.trigger !== 'manual') {
    return { ok: false, error: 'Cupom não encontrado.' }
  }

  const merged: CouponRuleInput = {
    name: input.name ?? existing.name,
    code: input.code ?? existing.code ?? '',
    status: input.status ?? existing.status,
    priority: input.priority ?? existing.priority,
    startsAt: input.startsAt !== undefined ? input.startsAt : existing.startsAt,
    endsAt: input.endsAt !== undefined ? input.endsAt : existing.endsAt,
    conditions: input.conditions ?? existing.conditions,
    actions: input.actions ?? existing.actions,
    usageLimit: input.usageLimit !== undefined ? input.usageLimit : existing.usageLimit,
  }

  const error = validateCouponInput(merged)
  if (error) return { ok: false, error }

  try {
    await repo.update(id, {
      name: merged.name.trim(),
      code: normalizeCouponCode(merged.code),
      status: merged.status,
      priority: merged.priority,
      startsAt: merged.startsAt,
      endsAt: merged.endsAt,
      conditions: merged.conditions,
      actions: merged.actions,
      usageLimit: merged.usageLimit,
    })
    revalidateCoupons()
    return { ok: true }
  } catch (err) {
    return {
      ok: false,
      error: err instanceof Error ? err.message : 'Falha ao atualizar cupom.',
    }
  }
}

export async function archiveCouponRuleAction(
  id: string
): Promise<{ ok: true } | { ok: false; error: string }> {
  const auth = await requireAdmin()
  if (!auth.ok) return { ok: false, error: auth.error }

  const repo = getCommercialRuleRepository()
  const existing = await repo.getById(id)
  if (!existing || existing.trigger !== 'manual') {
    return { ok: false, error: 'Cupom não encontrado.' }
  }

  try {
    await repo.update(id, { status: 'archived' as CommercialRuleStatus })
    revalidateCoupons()
    return { ok: true }
  } catch (err) {
    return {
      ok: false,
      error: err instanceof Error ? err.message : 'Falha ao arquivar cupom.',
    }
  }
}
