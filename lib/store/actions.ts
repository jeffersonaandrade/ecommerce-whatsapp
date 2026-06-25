'use server'

import { revalidatePath } from 'next/cache'
import { StoreSettingsInput } from '@/types/store-settings'
import { isValidHexColor } from './settings-defaults'
import { generateBrandingFromLogo, saveHeroImage } from './generate-branding'
import { getStoreSettings, updateStoreSettings } from './settings-repository'

function revalidateStore() {
  revalidatePath('/', 'layout')
  revalidatePath('/icon')
  revalidatePath('/admin/settings')
  revalidatePath('/cart')
  revalidatePath('/sobre')
  revalidatePath('/contato')
  revalidatePath('/politica-de-trocas')
}

export async function updateStoreSettingsAction(
  input: StoreSettingsInput
): Promise<{ ok: true; updatedAt: string } | { ok: false; error: string }> {
  if (input.whatsappPhone && input.whatsappPhone.replace(/\D/g, '').length < 10) {
    return { ok: false, error: 'Telefone WhatsApp inválido.' }
  }
  if (input.siteUrl) {
    try {
      new URL(input.siteUrl)
    } catch {
      return { ok: false, error: 'URL da loja inválida.' }
    }
  }
  if (input.primaryColor && !isValidHexColor(input.primaryColor)) {
    return { ok: false, error: 'Cor primária inválida. Use formato #RRGGBB.' }
  }
  if (input.secondaryColor && !isValidHexColor(input.secondaryColor)) {
    return { ok: false, error: 'Cor secundária inválida. Use formato #RRGGBB.' }
  }

  const next = updateStoreSettings(input)
  revalidateStore()
  return { ok: true, updatedAt: next.updatedAt }
}

export async function uploadStoreLogoAction(
  formData: FormData
): Promise<{ ok: true; updatedAt: string } | { ok: false; error: string }> {
  const file = formData.get('logo')
  if (!(file instanceof File) || file.size === 0) {
    return { ok: false, error: 'Selecione uma imagem válida.' }
  }

  if (file.size > 2 * 1024 * 1024) {
    return { ok: false, error: 'Logo deve ter no máximo 2 MB.' }
  }

  const allowed = ['image/png', 'image/jpeg', 'image/webp']
  if (!allowed.includes(file.type)) {
    return { ok: false, error: 'Formato aceito: PNG, JPG ou WebP.' }
  }

  try {
    const buffer = Buffer.from(await file.arrayBuffer())
    const branding = await generateBrandingFromLogo(buffer)
    const next = updateStoreSettings({
      logoPath: branding.logoPath,
      ogImagePath: branding.ogImagePath,
    })
    revalidateStore()
    return { ok: true, updatedAt: next.updatedAt }
  } catch {
    return { ok: false, error: 'Falha ao processar logo. Tente outro arquivo.' }
  }
}

export async function uploadHeroImageAction(
  formData: FormData
): Promise<{ ok: true; updatedAt: string } | { ok: false; error: string }> {
  const file = formData.get('hero')
  if (!(file instanceof File) || file.size === 0) {
    return { ok: false, error: 'Selecione uma imagem válida.' }
  }

  if (file.size > 5 * 1024 * 1024) {
    return { ok: false, error: 'Imagem do hero deve ter no máximo 5 MB.' }
  }

  const allowed = ['image/png', 'image/jpeg', 'image/webp']
  if (!allowed.includes(file.type)) {
    return { ok: false, error: 'Formato aceito: PNG, JPG ou WebP.' }
  }

  try {
    const buffer = Buffer.from(await file.arrayBuffer())
    const heroPath = await saveHeroImage(buffer)
    const next = updateStoreSettings({ heroImagePath: heroPath })
    revalidateStore()
    return { ok: true, updatedAt: next.updatedAt }
  } catch {
    return { ok: false, error: 'Falha ao processar imagem do hero. Tente outro arquivo.' }
  }
}

export async function getStoreSettingsAction() {
  return getStoreSettings()
}
