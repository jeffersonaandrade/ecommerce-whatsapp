import { beforeEach, describe, expect, it, vi } from 'vitest'

const { mockRequireAdmin, mockGetStoreSettings, mockUpdateStoreSettings, mockSaveHero, mockGenerateBranding } =
  vi.hoisted(() => ({
    mockRequireAdmin: vi.fn(),
    mockGetStoreSettings: vi.fn(),
    mockUpdateStoreSettings: vi.fn(),
    mockSaveHero: vi.fn(),
    mockGenerateBranding: vi.fn(),
  }))

vi.mock('@/lib/auth/require-admin', () => ({
  requireAdmin: mockRequireAdmin,
}))

vi.mock('./settings-repository', () => ({
  getStoreSettings: mockGetStoreSettings,
  updateStoreSettings: mockUpdateStoreSettings,
}))

vi.mock('./generate-branding', () => ({
  saveHeroImage: mockSaveHero,
  generateBrandingFromLogo: mockGenerateBranding,
}))

vi.mock('./default-storefront-preset', () => ({
  getDefaultStorefrontVisualPreset: () => ({
    description: 'Sua loja esportiva de confiança',
    primaryColor: '#111111',
    secondaryColor: '#f5f5f5',
    heroHeadline: 'Vista o jogo',
    heroHeadlineLine2: 'Com autenticidade',
    heroSubheadline: 'Equipamento esportivo premium selecionado para quem leva performance a sério.',
    heroCtaLabel: 'Explorar produtos',
    heroCtaHref: '/products',
    heroImagePath: 'hero.webp',
    aboutText: 'Somos uma loja especializada em artigos esportivos.',
    address: '',
    cityState: '',
    businessHours: 'Seg–Sex, 9h–18h',
    exchangePolicyText: 'Trocas em até 7 dias.',
  }),
  readDefaultStorefrontHeroBuffer: () => Buffer.from('hero'),
  readDefaultStorefrontLogoSourceBuffer: () => Buffer.from('logo'),
}))

vi.mock('next/cache', () => ({
  revalidatePath: vi.fn(),
}))

import { restoreDefaultStorefrontAction } from './actions'
import { createDefaultStoreSettings } from './settings-defaults'

describe('restoreDefaultStorefrontAction', () => {
  beforeEach(() => {
    mockRequireAdmin.mockReset()
    mockGetStoreSettings.mockReset()
    mockUpdateStoreSettings.mockReset()
    mockSaveHero.mockReset()
    mockGenerateBranding.mockReset()
  })

  it('retorna erro quando requireAdmin falha', async () => {
    mockRequireAdmin.mockResolvedValue({ ok: false, error: 'Não autenticado' })

    const result = await restoreDefaultStorefrontAction()

    expect(result).toEqual({ ok: false, error: 'Não autenticado' })
    expect(mockUpdateStoreSettings).not.toHaveBeenCalled()
  })

  it('restaura aparência preservando storeName e WhatsApp', async () => {
    mockRequireAdmin.mockResolvedValue({ ok: true })
    mockGetStoreSettings.mockResolvedValue({
      ...createDefaultStoreSettings(),
      storeName: 'Loja Preservada',
      whatsappPhone: '5511888777666',
      siteUrl: 'https://example.com',
    })
    mockSaveHero.mockResolvedValue('hero.webp')
    mockGenerateBranding.mockResolvedValue({ logoPath: 'logo.webp', ogImagePath: 'og-default.jpg' })
    mockUpdateStoreSettings.mockResolvedValue({
      ...createDefaultStoreSettings(),
      updatedAt: '2026-06-26T00:00:00.000Z',
    })

    const result = await restoreDefaultStorefrontAction()

    expect(result.ok).toBe(true)
    expect(mockSaveHero).toHaveBeenCalled()
    expect(mockGenerateBranding).toHaveBeenCalled()
    expect(mockUpdateStoreSettings).toHaveBeenCalledWith(
      expect.objectContaining({
        storeName: 'Loja Preservada',
        whatsappPhone: '5511888777666',
        siteUrl: 'https://example.com',
        description: 'Sua loja esportiva de confiança',
        primaryColor: '#111111',
      })
    )
  })
})
