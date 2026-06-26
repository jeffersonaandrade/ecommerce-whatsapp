import { describe, expect, it } from 'vitest'
import { createDefaultStoreSettings } from './settings-defaults'
import { buildRestoreStorefrontPatch } from './restore-default-storefront'

describe('buildRestoreStorefrontPatch', () => {
  it('aplica preset visual e preserva campos operacionais', () => {
    const current = {
      ...createDefaultStoreSettings(),
      storeName: 'Loja Cliente Real',
      whatsappPhone: '5521999887766',
      siteUrl: 'https://loja-whats.netlify.app',
      email: 'cliente@loja.com',
      phone: '(21) 99999-8888',
      instagram: '@loja',
      facebook: 'fb.com/loja',
      whatsappMessagePrefix: 'Olá!',
      description: 'Descrição customizada QA',
      primaryColor: '#dc2626',
    }

    const patch = buildRestoreStorefrontPatch(current, {
      logoPath: 'logo.webp',
      ogImagePath: 'og-default.jpg',
    })

    expect(patch.storeName).toBe('Loja Cliente Real')
    expect(patch.whatsappPhone).toBe('5521999887766')
    expect(patch.siteUrl).toBe('https://loja-whats.netlify.app')
    expect(patch.email).toBe('cliente@loja.com')
    expect(patch.phone).toBe('(21) 99999-8888')
    expect(patch.instagram).toBe('@loja')
    expect(patch.facebook).toBe('fb.com/loja')
    expect(patch.whatsappMessagePrefix).toBe('Olá!')
    expect(patch.description).toBe('Sua loja esportiva de confiança')
    expect(patch.primaryColor).toBe('#111111')
    expect(patch.heroHeadline).toBe('Vista o jogo')
    expect(patch.logoPath).toBe('logo.webp')
    expect(patch.ogImagePath).toBe('og-default.jpg')
  })
})
