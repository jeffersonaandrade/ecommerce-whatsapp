'use server'

import { revalidatePath } from 'next/cache'
import { requireAdmin } from '@/lib/auth/require-admin'
import { getDataProvider } from '@/lib/data/provider'
import { BenefitItemInput } from '@/types/benefit-item'
import { updateStoreSettings } from '@/lib/store/settings-repository'
import { getBenefitRepository } from './get-benefit-repository'
import { validateBenefitCreateCount, validateBenefitInput } from './benefit-validation'
import { BENEFIT_TITLE_MAX, BENEFIT_DESCRIPTION_MAX } from './constants'

function revalidateBenefits() {
  revalidatePath('/')
  revalidatePath('/admin/content')
  revalidatePath('/admin/content/benefits')
}

function ensureSupabase(): string | null {
  if (getDataProvider() !== 'supabase') {
    return 'Benefícios editáveis estão disponíveis apenas com Supabase.'
  }
  return null
}

export async function createBenefitItemAction(
  input: BenefitItemInput
): Promise<{ ok: true; id: string } | { ok: false; error: string }> {
  const auth = await requireAdmin()
  if (!auth.ok) return { ok: false, error: auth.error }

  const providerError = ensureSupabase()
  if (providerError) return { ok: false, error: providerError }

  const validationError = validateBenefitInput(input)
  if (validationError) return { ok: false, error: validationError }

  try {
    const repo = getBenefitRepository()
    const count = await repo.count()
    const countError = validateBenefitCreateCount(count)
    if (countError) return { ok: false, error: countError }

    const item = await repo.create(input)
    revalidateBenefits()
    return { ok: true, id: item.id }
  } catch (err) {
    return { ok: false, error: err instanceof Error ? err.message : 'Falha ao criar benefício.' }
  }
}

export async function updateBenefitItemAction(
  id: string,
  input: Partial<BenefitItemInput>
): Promise<{ ok: true } | { ok: false; error: string }> {
  const auth = await requireAdmin()
  if (!auth.ok) return { ok: false, error: auth.error }

  const providerError = ensureSupabase()
  if (providerError) return { ok: false, error: providerError }

  if (input.title !== undefined || input.description !== undefined) {
    if (input.title !== undefined) {
      const title = input.title.trim()
      if (!title) return { ok: false, error: 'Informe o título do benefício.' }
      if (title.length > BENEFIT_TITLE_MAX) {
        return { ok: false, error: `Título deve ter no máximo ${BENEFIT_TITLE_MAX} caracteres.` }
      }
    }
    if (input.description !== undefined && input.description.trim().length > BENEFIT_DESCRIPTION_MAX) {
      return { ok: false, error: `Descrição deve ter no máximo ${BENEFIT_DESCRIPTION_MAX} caracteres.` }
    }
  }

  try {
    const repo = getBenefitRepository()
    const existing = await repo.getById(id)
    if (!existing) return { ok: false, error: 'Benefício não encontrado.' }

    await repo.update(id, input)
    revalidateBenefits()
    return { ok: true }
  } catch (err) {
    return { ok: false, error: err instanceof Error ? err.message : 'Falha ao atualizar benefício.' }
  }
}

export async function deleteBenefitItemAction(
  id: string
): Promise<{ ok: true } | { ok: false; error: string }> {
  const auth = await requireAdmin()
  if (!auth.ok) return { ok: false, error: auth.error }

  const providerError = ensureSupabase()
  if (providerError) return { ok: false, error: providerError }

  try {
    const repo = getBenefitRepository()
    const existing = await repo.getById(id)
    if (!existing) return { ok: false, error: 'Benefício não encontrado.' }

    await repo.delete(id)
    revalidateBenefits()
    return { ok: true }
  } catch (err) {
    return { ok: false, error: err instanceof Error ? err.message : 'Falha ao excluir benefício.' }
  }
}

export async function reorderBenefitItemAction(
  id: string,
  direction: 'up' | 'down'
): Promise<{ ok: true } | { ok: false; error: string }> {
  const auth = await requireAdmin()
  if (!auth.ok) return { ok: false, error: auth.error }

  const providerError = ensureSupabase()
  if (providerError) return { ok: false, error: providerError }

  try {
    const repo = getBenefitRepository()
    const item = await repo.getById(id)
    if (!item) return { ok: false, error: 'Benefício não encontrado.' }
    const delta = direction === 'up' ? -15 : 15
    await repo.update(id, { sortOrder: Math.max(0, item.sortOrder + delta) })
    revalidateBenefits()
    return { ok: true }
  } catch (err) {
    return { ok: false, error: err instanceof Error ? err.message : 'Falha ao reordenar.' }
  }
}

export async function updateBenefitsSectionAction(input: {
  benefitsEyebrow: string
  benefitsTitle: string
}): Promise<{ ok: true } | { ok: false; error: string }> {
  const auth = await requireAdmin()
  if (!auth.ok) return { ok: false, error: auth.error }

  const providerError = ensureSupabase()
  if (providerError) return { ok: false, error: providerError }

  const eyebrow = input.benefitsEyebrow.trim()
  const title = input.benefitsTitle.trim()
  if (!eyebrow) return { ok: false, error: 'Informe o texto do eyebrow.' }
  if (!title) return { ok: false, error: 'Informe o título da seção.' }
  if (eyebrow.length > 80) return { ok: false, error: 'Eyebrow deve ter no máximo 80 caracteres.' }
  if (title.length > 80) return { ok: false, error: 'Título da seção deve ter no máximo 80 caracteres.' }

  try {
    await updateStoreSettings({
      benefitsEyebrow: eyebrow,
      benefitsTitle: title,
    })
    revalidateBenefits()
    return { ok: true }
  } catch (err) {
    return { ok: false, error: err instanceof Error ? err.message : 'Falha ao salvar cabeçalho.' }
  }
}
