import { describe, expect, it } from 'vitest'
import {
  assertBannerDesktopPath,
  hasBannerDesktopImage,
  validateBannerImageFile,
  validateBannerSlideInput,
  visibilityRequiresDesktop,
  visibilityRequiresMobile,
} from './banner-validation'

describe('banner-validation', () => {
  it('rejeita desktop path vazio no create legado', () => {
    expect(() => assertBannerDesktopPath('')).toThrow(/desktop/i)
    expect(() => assertBannerDesktopPath('   ')).toThrow(/desktop/i)
  })

  it('hasBannerDesktopImage ignora paths vazios', () => {
    expect(hasBannerDesktopImage('')).toBe(false)
    expect(hasBannerDesktopImage('banners/slide-desktop.webp')).toBe(true)
  })

  it('validateBannerImageFile rejeita arquivo vazio', () => {
    const empty = new File([], 'empty.png', { type: 'image/png' })
    expect(validateBannerImageFile(empty)).toMatch(/válida/i)
    expect(validateBannerImageFile(empty, 'mobile')).toMatch(/mobile/i)
  })

  it('validateBannerImageFile aceita png válido', () => {
    const file = new File([new Uint8Array([1, 2, 3])], 'banner.png', { type: 'image/png' })
    expect(validateBannerImageFile(file)).toBeNull()
  })

  it('visibilityRequiresDesktop e visibilityRequiresMobile', () => {
    expect(visibilityRequiresDesktop('all')).toBe(true)
    expect(visibilityRequiresDesktop('mobile')).toBe(false)
    expect(visibilityRequiresMobile('mobile')).toBe(true)
    expect(visibilityRequiresMobile('all')).toBe(false)
  })

  it('validateBannerSlideInput por visibility', () => {
    expect(
      validateBannerSlideInput({
        visibility: 'mobile',
        desktopImagePath: null,
        mobileImagePath: 'banners/m.webp',
      })
    ).toBeNull()

    expect(
      validateBannerSlideInput({
        visibility: 'mobile',
        desktopImagePath: null,
        mobileImagePath: null,
      })
    ).toMatch(/mobile/i)

    expect(
      validateBannerSlideInput({
        visibility: 'all',
        desktopImagePath: null,
        mobileImagePath: null,
      })
    ).toMatch(/desktop/i)
  })
})
