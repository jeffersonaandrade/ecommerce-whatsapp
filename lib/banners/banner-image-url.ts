export type BannerImageSide = 'desktop' | 'mobile'

export function bannerImageUrl(
  slideId: string,
  side: BannerImageSide,
  updatedAt: string
): string {
  return `/api/branding/banners/${slideId}-${side}.webp?v=${encodeURIComponent(updatedAt)}`
}
