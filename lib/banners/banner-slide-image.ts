import { BannerSlide } from '@/types/banner-slide'
import { resolveSlideImageSrc } from './banner-viewport'

export function resolveBannerSlidePreloadSrc(
  slide: BannerSlide,
  isMobile: boolean
): string | null {
  return resolveSlideImageSrc(slide, isMobile)
}
