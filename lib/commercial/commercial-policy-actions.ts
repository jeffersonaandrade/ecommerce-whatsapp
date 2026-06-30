'use server'

import { revalidatePath } from 'next/cache'
import { requireAdmin } from '@/lib/auth/require-admin'
import {
  CommercialPolicyInput,
  CommercialPolicyUpdateInput,
  PolicyAction,
} from '@/types/commercial-policy'
import { getCommercialPolicyRepository } from './get-commercial-policy-repository'

function revalidatePolicies() {
  revalidatePath('/admin/comercial')
  revalidatePath('/admin/comercial/politicas')
  revalidatePath('/cart')
  revalidatePath('/products')
  revalidatePath('/')
}

function validatePolicyInput(input: CommercialPolicyInput): string | null {
  if (!input.name.trim()) return 'Informe o nome da política.'

  const hasDiscountAction = input.actions.some(
    (a) =>
      (a.type === 'discount_percent' || a.type === 'discount_fixed') &&
      (a.value ?? 0) > 0
  )
  if (!hasDiscountAction) {
    return 'Informe ao menos uma ação de desconto (% ou valor fixo).'
  }

  for (const action of input.actions) {
    if (action.type === 'discount_percent' && (action.value ?? 0) > 100) {
      return 'Desconto percentual não pode exceder 100%.'
    }
    if (
      (action.type === 'discount_percent' || action.type === 'discount_fixed') &&
      (action.value ?? 0) <= 0
    ) {
      return 'Valor do desconto deve ser maior que zero.'
    }
  }

  if (input.conditions.minQty != null && input.conditions.minQty < 1) {
    return 'Quantidade mínima deve ser pelo menos 1.'
  }

  if (input.startsAt && input.endsAt) {
    if (new Date(input.startsAt) > new Date(input.endsAt)) {
      return 'Data de início deve ser anterior à data de fim.'
    }
  }

  return null
}

export async function createCommercialPolicyAction(
  input: CommercialPolicyInput
): Promise<{ ok: true; id: string } | { ok: false; error: string }> {
  const auth = await requireAdmin()
  if (!auth.ok) return { ok: false, error: auth.error }

  const error = validatePolicyInput(input)
  if (error) return { ok: false, error }

  try {
    const repo = getCommercialPolicyRepository()
    const policy = await repo.create(input)
    revalidatePolicies()
    return { ok: true, id: policy.id }
  } catch (err) {
    return {
      ok: false,
      error: err instanceof Error ? err.message : 'Falha ao criar política.',
    }
  }
}

export async function updateCommercialPolicyAction(
  id: string,
  input: CommercialPolicyUpdateInput
): Promise<{ ok: true } | { ok: false; error: string }> {
  const auth = await requireAdmin()
  if (!auth.ok) return { ok: false, error: auth.error }

  if (input.actions || input.name !== undefined || input.conditions) {
    const repo = getCommercialPolicyRepository()
    const existing = await repo.getById(id)
    if (!existing) return { ok: false, error: 'Política não encontrada.' }

    const merged: CommercialPolicyInput = {
      name: input.name ?? existing.name,
      channel: input.channel ?? existing.channel,
      priority: input.priority ?? existing.priority,
      enabled: input.enabled ?? existing.enabled,
      isDefault: input.isDefault ?? existing.isDefault,
      conditions: input.conditions ?? existing.conditions,
      actions: input.actions ?? existing.actions,
      startsAt: input.startsAt !== undefined ? input.startsAt : existing.startsAt,
      endsAt: input.endsAt !== undefined ? input.endsAt : existing.endsAt,
    }
    const error = validatePolicyInput(merged)
    if (error) return { ok: false, error }
  }

  try {
    const repo = getCommercialPolicyRepository()
    await repo.update(id, input)
    revalidatePolicies()
    return { ok: true }
  } catch (err) {
    return {
      ok: false,
      error: err instanceof Error ? err.message : 'Falha ao atualizar política.',
    }
  }
}

export async function deleteCommercialPolicyAction(
  id: string
): Promise<{ ok: true } | { ok: false; error: string }> {
  const auth = await requireAdmin()
  if (!auth.ok) return { ok: false, error: auth.error }

  try {
    const repo = getCommercialPolicyRepository()
    await repo.update(id, { enabled: false })
    revalidatePolicies()
    return { ok: true }
  } catch (err) {
    return {
      ok: false,
      error: err instanceof Error ? err.message : 'Falha ao desativar política.',
    }
  }
}

export function buildDefaultPolicyActions(
  discountType: 'discount_percent' | 'discount_fixed',
  value: number
): PolicyAction[] {
  return [{ type: discountType, value }]
}
