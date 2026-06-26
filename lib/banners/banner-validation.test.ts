import { describe, expect, it } from 'vitest'
import {
  assertBannerDesktopPath,
  hasBannerDesktopImage,
  validateBannerImageFile,
} from './banner-validation'

describe('banner-validation', () => {
  it('rejeita desktop path vazio no create', () => {
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
  })

  it('validateBannerImageFile aceita png válido', () => {
    const file = new File([new Uint8Array([1, 2, 3])], 'banner.png', { type: 'image/png' })
    expect(validateBannerImageFile(file)).toBeNull()
  })
})
