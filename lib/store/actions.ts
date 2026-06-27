'use server'

import { revalidatePath } from 'next/cache'
import { requireAdmin } from '@/lib/auth/require-admin'
import { StoreSettingsInput } from '@/types/store-settings'
import { isValidHexColor } from './settings-defaults'
import { generateBrandingFromLogo, saveHeroImage } from './generate-branding'
import { getStoreSettings, updateStoreSettings } from './settings-repository'
import {
  readDefaultStorefrontHeroBuffer,
  readDefaultStorefrontLogoSourceBuffer,
} from './default-storefront-preset'
import { buildRestoreStorefrontPatch } from './restore-default-storefront'
import {
  LOGO_IMAGE_MAX_BYTES,
  validateImageFile,
} from '@/lib/media/validate-image-file'

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
  const auth = await requireAdmin()
  if (!auth.ok) {
    return { ok: false, error: auth.error }
  }

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

  const next = await updateStoreSettings(input)
  revalidateStore()
  return { ok: true, updatedAt: next.updatedAt }
}

export async function uploadStoreLogoAction(
  formData: FormData
): Promise<{ ok: true; updatedAt: string } | { ok: false; error: string }> {
  const auth = await requireAdmin()
  if (!auth.ok) {
    return { ok: false, error: auth.error }
  }

  const file = formData.get('logo')
  const logoError = validateImageFile(file instanceof File ? file : new File([], ''), {
    maxBytes: LOGO_IMAGE_MAX_BYTES,
    sizeMessage: 'Logo deve ter no máximo 2 MB.',
  })
  if (logoError) {
    return { ok: false, error: logoError }
  }

  const validLogo = file as File

  try {
    const buffer = Buffer.from(await validLogo.arrayBuffer())
    const branding = await generateBrandingFromLogo(buffer)
    const next = await updateStoreSettings({
      logoPath: branding.logoPath,
      ogImagePath: branding.ogImagePath,
    })
    revalidateStore()
    return { ok: true, updatedAt: next.updatedAt }
  } catch (error) {
    console.error('[uploadStoreLogoAction]', error)
    const detail = error instanceof Error ? error.message : String(error)
    if (detail.includes('branding upload failed')) {
      return { ok: false, error: 'Falha ao salvar no storage. Tente novamente em instantes.' }
    }
    if (/timeout|timed out|ENOMEM|memory/i.test(detail)) {
      return { ok: false, error: 'Processamento demorou demais. Tente uma imagem menor ou aguarde e reenvie.' }
    }
    return { ok: false, error: 'Falha ao processar logo. Tente outro arquivo ou um JPG/PNG menor.' }
  }
}

export async function uploadHeroImageAction(
  formData: FormData
): Promise<{ ok: true; updatedAt: string } | { ok: false; error: string }> {
  const auth = await requireAdmin()
  if (!auth.ok) {
    return { ok: false, error: auth.error }
  }

  const file = formData.get('hero')
  const heroError = validateImageFile(file instanceof File ? file : new File([], ''), {
    sizeMessage: 'Imagem do hero deve ter no máximo 5 MB.',
    allowExtensionFallback: false,
  })
  if (heroError) {
    return { ok: false, error: heroError }
  }

  const validHero = file as File

  try {
    const buffer = Buffer.from(await validHero.arrayBuffer())
    const heroPath = await saveHeroImage(buffer)
    const next = await updateStoreSettings({ heroImagePath: heroPath })
    revalidateStore()
    return { ok: true, updatedAt: next.updatedAt }
  } catch {
    return { ok: false, error: 'Falha ao processar imagem do hero. Tente outro arquivo.' }
  }
}

export async function getStoreSettingsAction(): Promise<
  Awaited<ReturnType<typeof getStoreSettings>> | { ok: false; error: string }
> {
  const auth = await requireAdmin()
  if (!auth.ok) {
    return { ok: false, error: auth.error }
  }
  return await getStoreSettings()
}

export async function restoreDefaultStorefrontAction(): Promise<
  { ok: true; updatedAt: string } | { ok: false; error: string }
> {
  const auth = await requireAdmin()
  if (!auth.ok) {
    return { ok: false, error: auth.error }
  }

  try {
    const current = await getStoreSettings()
    const heroBuffer = readDefaultStorefrontHeroBuffer()
    const logoBuffer = readDefaultStorefrontLogoSourceBuffer()

    await saveHeroImage(heroBuffer)
    const branding = await generateBrandingFromLogo(logoBuffer)
    const patch = buildRestoreStorefrontPatch(current, branding)
    const next = await updateStoreSettings(patch)
    revalidateStore()
    return { ok: true, updatedAt: next.updatedAt }
  } catch {
    return { ok: false, error: 'Falha ao restaurar aparência padrão. Tente novamente.' }
  }
}
