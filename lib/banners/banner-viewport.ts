import {
  BannerSlide,
  BannerSlideCreateInput,
  BannerSlideInput,
  BannerSlideVisibility,
} from '@/types/banner-slide'
import { bannerImageUrl } from './banner-image-url'

export function normalizeBannerVisibility(
  visibility: BannerSlideVisibility | undefined
): BannerSlideVisibility {
  return visibility ?? 'all'
}

export function filterSlidesForViewport(
  slides: BannerSlide[],
  isMobile: boolean
): BannerSlide[] {
  return slides.filter((slide) => {
    const visibility = normalizeBannerVisibility(slide.visibility)
    if (visibility === 'all') return true
    if (visibility === 'desktop') return !isMobile
    return isMobile
  })
}

export function hasRequiredBannerImages(slide: BannerSlide): boolean {
  const visibility = normalizeBannerVisibility(slide.visibility)
  if (visibility === 'mobile') {
    return Boolean(slide.mobileImagePath?.trim())
  }
  return Boolean(slide.desktopImagePath?.trim())
}

export function assertBannerSlideImages(
  input: Pick<BannerSlideInput, 'visibility' | 'desktopImagePath' | 'mobileImagePath'>
): void {
  const visibility = normalizeBannerVisibility(input.visibility)
  if (visibility === 'mobile') {
    if (!input.mobileImagePath?.trim()) {
      throw new Error('Imagem mobile é obrigatória para slide somente mobile.')
    }
    return
  }
  if (!input.desktopImagePath?.trim()) {
    throw new Error('Imagem desktop é obrigatória para este slide.')
  }
}

export function resolveSlideImageSrc(slide: BannerSlide, isMobile: boolean): string | null {
  const visibility = normalizeBannerVisibility(slide.visibility)

  if (isMobile) {
    if (visibility === 'desktop') return null
    if (slide.mobileImagePath?.trim()) {
      return bannerImageUrl(slide.id, 'mobile', slide.updatedAt)
    }
    if (slide.desktopImagePath?.trim() && visibility === 'all') {
      return bannerImageUrl(slide.id, 'desktop', slide.updatedAt)
    }
    if (visibility === 'mobile' && slide.mobileImagePath?.trim()) {
      return bannerImageUrl(slide.id, 'mobile', slide.updatedAt)
    }
    return null
  }

  if (visibility === 'mobile') return null
  if (!slide.desktopImagePath?.trim()) return null
  return bannerImageUrl(slide.id, 'desktop', slide.updatedAt)
}

export function resolveSlidePictureSources(slide: BannerSlide): {
  desktopSrc: string | null
  mobileSrc: string | null
} {
  const visibility = normalizeBannerVisibility(slide.visibility)
  const desktopSrc = slide.desktopImagePath?.trim()
    ? bannerImageUrl(slide.id, 'desktop', slide.updatedAt)
    : null

  if (visibility === 'mobile') {
    const mobileSrc = slide.mobileImagePath?.trim()
      ? bannerImageUrl(slide.id, 'mobile', slide.updatedAt)
      : null
    return { desktopSrc: mobileSrc, mobileSrc }
  }

  const mobileSrc = slide.mobileImagePath?.trim()
    ? bannerImageUrl(slide.id, 'mobile', slide.updatedAt)
    : desktopSrc

  return { desktopSrc, mobileSrc }
}

export function assertBannerCreatePayload(input: BannerSlideCreateInput): void {
  assertBannerSlideImages(input)
}
