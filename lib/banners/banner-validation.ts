import { BannerSlide, BannerSlideInput, BannerSlideVisibility } from '@/types/banner-slide'
import { validateImageFile } from '@/lib/media/validate-image-file'
import { normalizeBannerVisibility } from './banner-viewport'

export function validateBannerImageFile(
  file: File,
  side: 'desktop' | 'mobile' = 'desktop'
): string | null {
  return validateImageFile(file, {
    emptyMessage:
      side === 'mobile'
        ? 'Selecione uma imagem mobile válida.'
        : 'Selecione uma imagem desktop válida.',
  })
}

export function parseBannerVisibility(value: unknown): BannerSlideVisibility {
  if (value === 'desktop' || value === 'mobile' || value === 'all') return value
  return 'all'
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
