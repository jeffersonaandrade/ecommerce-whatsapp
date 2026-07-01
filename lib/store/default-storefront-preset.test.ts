import { describe, expect, it } from 'vitest'
import { getDefaultStorefrontVisualPreset } from './default-storefront-preset'

describe('getDefaultStorefrontVisualPreset', () => {
  it('carrega preset visual neutro versionado', () => {
    const preset = getDefaultStorefrontVisualPreset()
    expect(preset.description).toBe('')
    expect(preset.primaryColor).toBe('#111111')
    expect(preset.secondaryColor).toBe('#f5f5f5')
    expect(preset.heroHeadline).toBe('')
    expect(preset.heroImagePath).toBeNull()
    expect(preset).not.toHaveProperty('storeName')
  })
})
