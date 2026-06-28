'use server'

import { revalidatePath } from 'next/cache'
import { requireAdmin } from '@/lib/auth/require-admin'
import {
  CommercialRuleInput,
  CommercialRuleStatus,
  CommercialRuleUpdateInput,
} from '@/types/commercial-rule'
import { getCommercialRuleRepository } from './get-commercial-rule-repository'

function revalidateCommercial() {
  revalidatePath('/admin/comercial')
  revalidatePath('/admin/comercial/promocoes')
  revalidatePath('/cart')
  revalidatePath('/products')
  revalidatePath('/')
}

function validateRuleInput(input: CommercialRuleInput): string | null {
  if (!input.name.trim()) return 'Informe o nome da promoção.'
  if (input.config.requiredQuantity < 2) {
    return 'Quantidade necessária deve ser no mínimo 2.'
  }
  if (input.config.discountAmount <= 0) {
    return 'Valor do desconto deve ser maior que zero.'
  }
  if (input.startsAt && input.endsAt) {
    if (new Date(input.startsAt) > new Date(input.endsAt)) {
      return 'Data de início deve ser anterior à data de fim.'
    }
  }
  return null
}

export async function createCommercialRuleAction(
  input: CommercialRuleInput
): Promise<{ ok: true; id: string } | { ok: false; error: string }> {
  const auth = await requireAdmin()
  if (!auth.ok) return { ok: false, error: auth.error }

  const error = validateRuleInput(input)
  if (error) return { ok: false, error }

  try {
    const repo = getCommercialRuleRepository()
    const rule = await repo.create({
      ...input,
      appliesTo: input.appliesTo ?? 'all_products',
    })
    revalidateCommercial()
    return { ok: true, id: rule.id }
  } catch (err) {
    return {
      ok: false,
      error: err instanceof Error ? err.message : 'Falha ao criar promoção.',
    }
  }
}

export async function updateCommercialRuleAction(
  id: string,
  input: CommercialRuleUpdateInput
): Promise<{ ok: true } | { ok: false; error: string }> {
  const auth = await requireAdmin()
  if (!auth.ok) return { ok: false, error: auth.error }

  if (input.config || input.name !== undefined) {
    const repo = getCommercialRuleRepository()
    const existing = await repo.getById(id)
    if (!existing) return { ok: false, error: 'Promoção não encontrada.' }
    const merged: CommercialRuleInput = {
      name: input.name ?? existing.name,
      type: input.type ?? existing.type,
      status: input.status ?? existing.status,
      priority: input.priority ?? existing.priority,
      appliesTo: input.appliesTo ?? existing.appliesTo,
      startsAt: input.startsAt !== undefined ? input.startsAt : existing.startsAt,
      endsAt: input.endsAt !== undefined ? input.endsAt : existing.endsAt,
      config: input.config ?? existing.config,
    }
    const error = validateRuleInput(merged)
    if (error) return { ok: false, error }
  }

  try {
    const repo = getCommercialRuleRepository()
    await repo.update(id, input)
    revalidateCommercial()
    return { ok: true }
  } catch (err) {
    return {
      ok: false,
      error: err instanceof Error ? err.message : 'Falha ao atualizar promoção.',
    }
  }
}

export async function archiveCommercialRuleAction(
  id: string
): Promise<{ ok: true } | { ok: false; error: string }> {
  return updateCommercialRuleAction(id, { status: 'archived' as CommercialRuleStatus })
}
