'use server'

import { revalidatePath } from 'next/cache'
import { randomUUID } from 'crypto'
import { requireAdmin } from '@/lib/auth/require-admin'
import { BannerSlideCreateInput, BannerSlideInput } from '@/types/banner-slide'
import { getBannerRepository } from './get-banner-repository'
import { writeBannerImage, deleteBannerImages, deleteBannerImage, BannerImageSide } from './banner-storage'
import {
  parseBannerVisibility,
  validateBannerImageFile,
  validateBannerSlideInput,
  visibilityRequiresMobile,
} from './banner-validation'
import { assertBannerSlideImages } from './banner-viewport'

function revalidateBanners() {
  revalidatePath('/')
  revalidatePath('/admin/banners')
}

function validateCta(input: Partial<BannerSlideInput>): string | null {
  const hasLabel = input.ctaLabel != null && input.ctaLabel.trim() !== ''
  const hasHref = input.ctaHref != null && input.ctaHref.trim() !== ''
  if (hasLabel !== hasHref)
    return 'Preencha título e link do CTA juntos ou deixe ambos vazios.'
  return null
}

function parseBannerMetadata(
  formData: FormData
): Omit<BannerSlideCreateInput, 'desktopImagePath' | 'mobileImagePath' | 'id'> {
  const title = String(formData.get('title') ?? '').trim()
  const subtitle = String(formData.get('subtitle') ?? '').trim()
  const ctaLabel = String(formData.get('ctaLabel') ?? '').trim()
  const ctaHref = String(formData.get('ctaHref') ?? '').trim()
  const sortOrder = parseInt(String(formData.get('sortOrder') ?? '0'), 10) || 0
  const active = formData.get('active') !== 'false'
  const visibility = parseBannerVisibility(formData.get('visibility'))

  return {
    title: title || null,
    subtitle: subtitle || null,
    ctaLabel: ctaLabel || null,
    ctaHref: ctaHref || null,
    sortOrder,
    active,
    visibility,
  }
}

export async function createBannerSlideWithDesktopAction(
  formData: FormData
): Promise<{ ok: true; id: string } | { ok: false; error: string }> {
  const auth = await requireAdmin()
  if (!auth.ok) return { ok: false, error: auth.error }

  const metadata = parseBannerMetadata(formData)
  const ctaError = validateCta(metadata)
  if (ctaError) return { ok: false, error: ctaError }

  const mobileOnly = visibilityRequiresMobile(metadata.visibility)
  const desktopFile = formData.get('image')
  const mobileFile = formData.get('mobileImage')

  const primaryFile = mobileOnly ? mobileFile : desktopFile
  const primarySide: BannerImageSide = mobileOnly ? 'mobile' : 'desktop'

  if (!(primaryFile instanceof File)) {
    return {
      ok: false,
      error: mobileOnly
        ? 'Selecione a imagem mobile antes de criar o slide.'
        : 'Selecione a imagem desktop antes de criar o slide.',
    }
  }

  const fileError = validateBannerImageFile(primaryFile, primarySide)
  if (fileError) return { ok: false, error: fileError }

  const slideId = randomUUID()

  try {
    const buffer = Buffer.from(await primaryFile.arrayBuffer())
    const imagePath = await writeBannerImage(slideId, primarySide, buffer)

    const payload: BannerSlideCreateInput = {
      id: slideId,
      ...metadata,
      desktopImagePath: null,
      mobileImagePath: mobileOnly ? imagePath : null,
    }

    if (!mobileOnly) {
      payload.desktopImagePath = imagePath
    }

    const inputError = validateBannerSlideInput(payload)
    if (inputError) return { ok: false, error: inputError }

    const repo = getBannerRepository()
    const slide = await repo.create(payload)

    revalidateBanners()
    return { ok: true, id: slide.id }
  } catch (err) {
    try {
      await deleteBannerImages(slideId)
    } catch {
      // ignore rollback errors
    }
    return {
      ok: false,
      error: err instanceof Error ? err.message : 'Falha ao criar slide.',
    }
  }
}

export async function createBannerSlideAction(
  input: BannerSlideCreateInput
): Promise<{ ok: true; id: string } | { ok: false; error: string }> {
  const auth = await requireAdmin()
  if (!auth.ok) return { ok: false, error: auth.error }

  try {
    assertBannerSlideImages(input)
  } catch (err) {
    return { ok: false, error: err instanceof Error ? err.message : 'Imagens obrigatórias ausentes.' }
  }

  const ctaError = validateCta(input)
  if (ctaError) return { ok: false, error: ctaError }

  try {
    const repo = getBannerRepository()
    const slide = await repo.create(input)
    revalidateBanners()
    return { ok: true, id: slide.id }
  } catch (err) {
    return { ok: false, error: err instanceof Error ? err.message : 'Falha ao criar slide.' }
  }
}

export async function updateBannerSlideAction(
  id: string,
  input: Partial<BannerSlideInput>
): Promise<{ ok: true } | { ok: false; error: string }> {
  const auth = await requireAdmin()
  if (!auth.ok) return { ok: false, error: auth.error }

  const ctaError = validateCta(input)
  if (ctaError) return { ok: false, error: ctaError }

  try {
    const repo = getBannerRepository()
    const existing = await repo.getById(id)
    if (!existing) return { ok: false, error: 'Slide não encontrado.' }

    const merged: BannerSlideInput = { ...existing, ...input }
    const inputError = validateBannerSlideInput(merged)
    if (inputError) return { ok: false, error: inputError }

    await repo.update(id, input)
    revalidateBanners()
    return { ok: true }
  } catch (err) {
    return { ok: false, error: err instanceof Error ? err.message : 'Falha ao atualizar slide.' }
  }
}

export async function deleteBannerSlideAction(
  id: string
): Promise<{ ok: true } | { ok: false; error: string }> {
  const auth = await requireAdmin()
  if (!auth.ok) return { ok: false, error: auth.error }

  try {
    const repo = getBannerRepository()
    await deleteBannerImages(id)
    await repo.delete(id)
    revalidateBanners()
    return { ok: true }
  } catch (err) {
    return { ok: false, error: err instanceof Error ? err.message : 'Falha ao excluir slide.' }
  }
}

async function uploadBannerImageAction(
  id: string,
  side: BannerImageSide,
  formData: FormData
): Promise<{ ok: true } | { ok: false; error: string }> {
  const auth = await requireAdmin()
  if (!auth.ok) return { ok: false, error: auth.error }

  const file = formData.get('image')
  if (!(file instanceof File) || file.size === 0)
    return { ok: false, error: 'Selecione uma imagem válida.' }

  const fileError = validateBannerImageFile(file, side)
  if (fileError) return { ok: false, error: fileError }

  try {
    const buffer = Buffer.from(await file.arrayBuffer())
    const imagePath = await writeBannerImage(id, side, buffer)
    const repo = getBannerRepository()
    const field = side === 'desktop' ? 'desktopImagePath' : 'mobileImagePath'
    await repo.update(id, { [field]: imagePath })
    revalidateBanners()
    return { ok: true }
  } catch (err) {
    return { ok: false, error: err instanceof Error ? err.message : 'Falha ao salvar imagem.' }
  }
}

export async function uploadBannerDesktopAction(
  id: string,
  formData: FormData
): Promise<{ ok: true } | { ok: false; error: string }> {
  return uploadBannerImageAction(id, 'desktop', formData)
}

export async function uploadBannerMobileAction(
  id: string,
  formData: FormData
): Promise<{ ok: true } | { ok: false; error: string }> {
  return uploadBannerImageAction(id, 'mobile', formData)
}

export async function removeBannerMobileAction(
  id: string
): Promise<{ ok: true } | { ok: false; error: string }> {
  return removeBannerImageAction(id, 'mobile')
}

export async function removeBannerDesktopAction(
  id: string
): Promise<{ ok: true } | { ok: false; error: string }> {
  return removeBannerImageAction(id, 'desktop')
}

async function removeBannerImageAction(
  id: string,
  side: BannerImageSide
): Promise<{ ok: true } | { ok: false; error: string }> {
  const auth = await requireAdmin()
  if (!auth.ok) return { ok: false, error: auth.error }

  try {
    const repo = getBannerRepository()
    const slide = await repo.getById(id)
    if (!slide) return { ok: false, error: 'Slide não encontrado.' }

    const pathField = side === 'desktop' ? slide.desktopImagePath : slide.mobileImagePath
    if (pathField) {
      await deleteBannerImage(id, side)
    }

    const update =
      side === 'desktop'
        ? { desktopImagePath: null }
        : { mobileImagePath: null }
    await repo.update(id, update)
    revalidateBanners()
    return { ok: true }
  } catch (err) {
    return { ok: false, error: err instanceof Error ? err.message : 'Falha ao remover imagem.' }
  }
}

export async function reorderBannerSlideAction(
  id: string,
  direction: 'up' | 'down'
): Promise<{ ok: true } | { ok: false; error: string }> {
  const auth = await requireAdmin()
  if (!auth.ok) return { ok: false, error: auth.error }

  try {
    const repo = getBannerRepository()
    const slide = await repo.getById(id)
    if (!slide) return { ok: false, error: 'Slide não encontrado.' }
    const delta = direction === 'up' ? -15 : 15
    await repo.update(id, { sortOrder: Math.max(0, slide.sortOrder + delta) })
    revalidateBanners()
    return { ok: true }
  } catch (err) {
    return { ok: false, error: err instanceof Error ? err.message : 'Falha ao reordenar.' }
  }
}
