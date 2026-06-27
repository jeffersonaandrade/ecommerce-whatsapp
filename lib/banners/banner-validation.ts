import { BannerSlide, BannerSlideInput, BannerSlideVisibility } from '@/types/banner-slide'
import { normalizeBannerVisibility } from './banner-viewport'

export function validateBannerImageFile(
  file: File,
  side: 'desktop' | 'mobile' = 'desktop'
): string | null {
  if (!(file instanceof File) || file.size === 0) {
    return side === 'mobile'
      ? 'Selecione uma imagem mobile válida.'
      : 'Selecione uma imagem desktop válida.'
  }
  if (file.size > 5 * 1024 * 1024) {
    return 'Imagem deve ter no máximo 5 MB.'
  }
  const allowed = ['image/png', 'image/jpeg', 'image/webp']
  const ext = file.name.split('.').pop()?.toLowerCase()
  const extOk = ext === 'png' || ext === 'jpg' || ext === 'jpeg' || ext === 'webp'
  if (!allowed.includes(file.type) && !extOk) {
    return 'Formato aceito: PNG, JPG ou WebP.'
  }
  return null
}

export function parseBannerVisibility(value: unknown): BannerSlideVisibility {
  if (value === 'desktop' || value === 'mobile' || value === 'all') return value
  return 'all'
}

/** @deprecated Use assertBannerSlideImages from banner-viewport */
export function assertBannerDesktopPath(desktopImagePath: string | null | undefined): void {
  if (!desktopImagePath?.trim()) {
    throw new Error('Imagem desktop é obrigatória para criar um slide.')
  }
}

export function hasBannerDesktopImage(desktopImagePath: string | null | undefined): boolean {
  return Boolean(desktopImagePath?.trim())
}

export function visibilityRequiresDesktop(visibility: BannerSlideVisibility | undefined): boolean {
  const v = normalizeBannerVisibility(visibility)
  return v === 'all' || v === 'desktop'
}

export function visibilityRequiresMobile(visibility: BannerSlideVisibility | undefined): boolean {
  return normalizeBannerVisibility(visibility) === 'mobile'
}

export function validateBannerSlideInput(
  input: Pick<BannerSlideInput, 'visibility' | 'desktopImagePath' | 'mobileImagePath'>
): string | null {
  const visibility = normalizeBannerVisibility(input.visibility)
  if (visibility === 'mobile' && !input.mobileImagePath?.trim()) {
    return 'Imagem mobile é obrigatória para slide somente mobile.'
  }
  if (visibility !== 'mobile' && !input.desktopImagePath?.trim()) {
    return 'Imagem desktop é obrigatória para este slide.'
  }
  return null
}
