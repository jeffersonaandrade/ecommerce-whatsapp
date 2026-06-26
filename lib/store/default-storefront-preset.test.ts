import { describe, expect, it } from 'vitest'
import { getDefaultStorefrontVisualPreset } from './default-storefront-preset'

describe('getDefaultStorefrontVisualPreset', () => {
  it('carrega preset visual premium versionado', () => {
    const preset = getDefaultStorefrontVisualPreset()
    expect(preset.description).toBe('Sua loja esportiva de confiança')
    expect(preset.primaryColor).toBe('#111111')
    expect(preset.secondaryColor).toBe('#f5f5f5')
    expect(preset.heroHeadline).toBe('Vista o jogo')
    expect(preset.heroImagePath).toBe('hero.webp')
    expect(preset).not.toHaveProperty('storeName')
  })
})
