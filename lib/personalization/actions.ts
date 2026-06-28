'use server'

import { revalidatePath } from 'next/cache'
import { requireAdmin } from '@/lib/auth/require-admin'
import { getSettingsRepository } from '@/lib/store/get-settings-repository'
import { PersonalizationSettingsInput } from '@/types/personalization-settings'
import { personalizationToStoreSettingsInput } from '@/lib/personalization/personalization-settings'

function revalidatePersonalization() {
  revalidatePath('/admin/comercial/personalizacao')
  revalidatePath('/products')
  revalidatePath('/cart')
}

export async function updatePersonalizationSettingsAction(
  input: PersonalizationSettingsInput
): Promise<{ ok: true } | { ok: false; error: string }> {
  const auth = await requireAdmin()
  if (!auth.ok) return { ok: false, error: auth.error }

  if (input.defaultPrice != null && input.defaultPrice < 0) {
    return { ok: false, error: 'Preço padrão não pode ser negativo.' }
  }
  if (input.nameMaxLength != null && input.nameMaxLength < 1) {
    return { ok: false, error: 'Limite de caracteres do nome inválido.' }
  }
  if (
    input.numberMin != null &&
    input.numberMax != null &&
    input.numberMin > input.numberMax
  ) {
    return { ok: false, error: 'Faixa numérica inválida.' }
  }

  try {
    const repo = getSettingsRepository()
    await repo.update(personalizationToStoreSettingsInput(input))
    revalidatePersonalization()
    return { ok: true }
  } catch (err) {
    return {
      ok: false,
      error: err instanceof Error ? err.message : 'Falha ao salvar personalização.',
    }
  }
}
