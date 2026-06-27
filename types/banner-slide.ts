export type BannerSlideVisibility = 'all' | 'desktop' | 'mobile'

export type BannerSlide = {
  id: string
  desktopImagePath: string | null
  mobileImagePath?: string | null
  title?: string | null
  subtitle?: string | null
  ctaLabel?: string | null
  ctaHref?: string | null
  sortOrder: number
  active: boolean
  visibility: BannerSlideVisibility
  createdAt: string
  updatedAt: string
}

export type BannerSlideInput = Omit<BannerSlide, 'id' | 'createdAt' | 'updatedAt'>

/** Create payload — optional id when image is uploaded before insert (DT-003). */
export type BannerSlideCreateInput = BannerSlideInput & { id?: string }

export const BANNER_VISIBILITY_OPTIONS: {
  value: BannerSlideVisibility
  label: string
}[] = [
  { value: 'all', label: 'Desktop e mobile' },
  { value: 'desktop', label: 'Somente desktop' },
  { value: 'mobile', label: 'Somente mobile' },
]
