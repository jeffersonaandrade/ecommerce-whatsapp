'use server'

import { revalidatePath } from 'next/cache'
import { randomUUID } from 'crypto'
import { requireAdmin } from '@/lib/auth/require-admin'
import { BannerSlideCreateInput, BannerSlideInput } from '@/types/banner-slide'
import { getBannerRepository } from './get-banner-repository'
import { writeBannerImage, deleteBannerImages, deleteBannerImage, BannerImageSide } from './banner-storage'
import { assertBannerDesktopPath, validateBannerImageFile } from './banner-validation'

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

function parseBannerMetadata(formData: FormData): Omit<BannerSlideCreateInput, 'desktopImagePath' | 'id'> {
  const title = String(formData.get('title') ?? '').trim()
  const subtitle = String(formData.get('subtitle') ?? '').trim()
  const ctaLabel = String(formData.get('ctaLabel') ?? '').trim()
  const ctaHref = String(formData.get('ctaHref') ?? '').trim()
  const sortOrder = parseInt(String(formData.get('sortOrder') ?? '0'), 10) || 0
  const active = formData.get('active') !== 'false'

  return {
    mobileImagePath: null,
    title: title || null,
    subtitle: subtitle || null,
    ctaLabel: ctaLabel || null,
    ctaHref: ctaHref || null,
    sortOrder,
    active,
  }
}

export async function createBannerSlideWithDesktopAction(
  formData: FormData
): Promise<{ ok: true; id: string } | { ok: false; error: string }> {
  const auth = await requireAdmin()
  if (!auth.ok) return { ok: false, error: auth.error }

  const file = formData.get('image')
  if (!(file instanceof File)) {
    return { ok: false, error: 'Selecione a imagem desktop antes de criar o slide.' }
  }

  const fileError = validateBannerImageFile(file)
  if (fileError) return { ok: false, error: fileError }

  const metadata = parseBannerMetadata(formData)
  const ctaError = validateCta(metadata)
  if (ctaError) return { ok: false, error: ctaError }

  const slideId = randomUUID()

  try {
    const buffer = Buffer.from(await file.arrayBuffer())
    const desktopImagePath = await writeBannerImage(slideId, 'desktop', buffer)

    const repo = getBannerRepository()
    const slide = await repo.create({
      id: slideId,
      ...metadata,
      desktopImagePath,
    })

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
      error: err instanceof Error ? err.message : 'Falha ao criar slide com imagem desktop.',
    }
  }
}

export async function createBannerSlideAction(
  input: BannerSlideCreateInput
): Promise<{ ok: true; id: string } | { ok: false; error: string }> {
  const auth = await requireAdmin()
  if (!auth.ok) return { ok: false, error: auth.error }

  try {
    assertBannerDesktopPath(input.desktopImagePath)
  } catch (err) {
    return { ok: false, error: err instanceof Error ? err.message : 'Imagem desktop obrigatória.' }
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

  const fileError = validateBannerImageFile(file)
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
