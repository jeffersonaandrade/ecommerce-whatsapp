import { describe, expect, it } from 'vitest'
import { BannerSlide } from '@/types/banner-slide'
import {
  filterSlidesForViewport,
  hasRequiredBannerImages,
  resolveSlideImageSrc,
  assertBannerSlideImages,
} from './banner-viewport'

function slide(overrides: Partial<BannerSlide> = {}): BannerSlide {
  return {
    id: 's1',
    desktopImagePath: 'banners/s1-desktop.webp',
    mobileImagePath: null,
    sortOrder: 0,
    active: true,
    visibility: 'all',
    createdAt: '2026-01-01T00:00:00Z',
    updatedAt: '2026-01-01T00:00:00Z',
    ...overrides,
  }
}

describe('banner-viewport', () => {
  describe('filterSlidesForViewport', () => {
    it('keeps all visibility on both viewports', () => {
      const slides = [slide({ visibility: 'all' })]
      expect(filterSlidesForViewport(slides, false)).toHaveLength(1)
      expect(filterSlidesForViewport(slides, true)).toHaveLength(1)
    })

    it('desktop-only hidden on mobile', () => {
      const slides = [slide({ visibility: 'desktop' })]
      expect(filterSlidesForViewport(slides, false)).toHaveLength(1)
      expect(filterSlidesForViewport(slides, true)).toHaveLength(0)
    })

    it('mobile-only hidden on desktop', () => {
      const slides = [
        slide({
          visibility: 'mobile',
          desktopImagePath: null,
          mobileImagePath: 'banners/s1-mobile.webp',
        }),
      ]
      expect(filterSlidesForViewport(slides, false)).toHaveLength(0)
      expect(filterSlidesForViewport(slides, true)).toHaveLength(1)
    })
  })

  describe('hasRequiredBannerImages', () => {
    it('all and desktop require desktop path', () => {
      expect(hasRequiredBannerImages(slide({ visibility: 'all' }))).toBe(true)
      expect(
        hasRequiredBannerImages(slide({ visibility: 'all', desktopImagePath: null }))
      ).toBe(false)
      expect(
        hasRequiredBannerImages(slide({ visibility: 'desktop', desktopImagePath: null }))
      ).toBe(false)
    })

    it('mobile requires mobile path', () => {
      expect(
        hasRequiredBannerImages(
          slide({
            visibility: 'mobile',
            desktopImagePath: null,
            mobileImagePath: 'banners/m.webp',
          })
        )
      ).toBe(true)
      expect(
        hasRequiredBannerImages(
          slide({ visibility: 'mobile', desktopImagePath: null, mobileImagePath: null })
        )
      ).toBe(false)
    })
  })

  describe('resolveSlideImageSrc', () => {
    it('all without mobile uses desktop on mobile', () => {
      const s = slide({ visibility: 'all', mobileImagePath: null })
      expect(resolveSlideImageSrc(s, true)).toContain('-desktop.webp')
    })

    it('desktop-only returns null on mobile', () => {
      expect(resolveSlideImageSrc(slide({ visibility: 'desktop' }), true)).toBeNull()
    })

    it('mobile-only returns null on desktop', () => {
      expect(
        resolveSlideImageSrc(
          slide({
            visibility: 'mobile',
            desktopImagePath: null,
            mobileImagePath: 'banners/m.webp',
          }),
          false
        )
      ).toBeNull()
    })
  })

  describe('assertBannerSlideImages', () => {
    it('throws when mobile visibility without mobile image', () => {
      expect(() =>
        assertBannerSlideImages({
          visibility: 'mobile',
          desktopImagePath: null,
          mobileImagePath: null,
        })
      ).toThrow(/mobile/i)
    })

    it('throws when desktop required but missing', () => {
      expect(() =>
        assertBannerSlideImages({
          visibility: 'all',
          desktopImagePath: null,
          mobileImagePath: null,
        })
      ).toThrow(/desktop/i)
    })
  })
})
