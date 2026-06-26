export type BannerSlide = {
  id: string
  desktopImagePath: string
  mobileImagePath?: string | null
  title?: string | null
  subtitle?: string | null
  ctaLabel?: string | null
  ctaHref?: string | null
  sortOrder: number
  active: boolean
  createdAt: string
  updatedAt: string
}

export type BannerSlideInput = Omit<BannerSlide, 'id' | 'createdAt' | 'updatedAt'>

/** Create payload — optional id when image is uploaded before insert (DT-003). */
export type BannerSlideCreateInput = BannerSlideInput & { id?: string }
