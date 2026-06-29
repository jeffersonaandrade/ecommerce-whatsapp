import { describe, expect, it } from 'vitest'
import type { BannerSlide } from '@/types/banner-slide'
import type { Category } from '@/types/category'
import { createDefaultStoreSettings } from '@/lib/store/settings-defaults'
import type { AdminOnboardingState } from '@/types/admin-onboarding'
import { createDefaultOnboardingState } from './defaults'
import {
  categoriesContext,
  computeOnboardingProgressFromSnapshot,
  desktopBannerContext,
  isCategoriesStepComplete,
  isDesktopBannerStepComplete,
  isMobileBannerStepComplete,
  isProductsStepComplete,
  isStoreSettingsComplete,
  mobileBannerContext,
  productsContext,
  storeSettingsContext,
  type OnboardingSnapshot,
} from './detect-progress'
import { WEIGHTED_ONBOARDING_STEPS } from './steps'

function category(overrides: Partial<Category> = {}): Category {
  return {
    id: 'c1',
    name: 'Categoria',
    slug: 'categoria',
    description: '',
    sortOrder: 0,
    visible: false,
    depth: 0,
    path: 'categoria',
    createdAt: '2026-01-01T00:00:00Z',
    updatedAt: '2026-01-01T00:00:00Z',
    ...overrides,
  }
}

function slide(overrides: Partial<BannerSlide> = {}): BannerSlide {
  return {
    id: 's1',
    desktopImagePath: 'banners/s1.webp',
    mobileImagePath: null,
    sortOrder: 0,
    active: true,
    visibility: 'all',
    createdAt: '2026-01-01T00:00:00Z',
    updatedAt: '2026-01-01T00:00:00Z',
    ...overrides,
  }
}

function snapshot(overrides: Partial<OnboardingSnapshot> = {}): OnboardingSnapshot {
  return {
    settings: createDefaultStoreSettings(),
    productCounts: { all: 0, active: 0 },
    mediaIssueCount: 0,
    categories: [],
    slides: [],
    supabaseUrl: 'https://example.supabase.co',
    ...overrides,
  }
}

describe('onboarding step weights', () => {
  it('sums to 100%', () => {
    const total = WEIGHTED_ONBOARDING_STEPS.reduce((sum, step) => sum + step.weight, 0)
    expect(total).toBe(100)
  })
})

describe('store-settings completion', () => {
  it('requires name, whatsapp, description and contact', () => {
    const settings = createDefaultStoreSettings()
    expect(isStoreSettingsComplete(settings)).toBe(false)

    const complete = {
      ...settings,
      storeName: 'Minha Loja',
      description: 'Descrição com mais de dez caracteres',
      phone: '11999999999',
    }
    expect(isStoreSettingsComplete(complete)).toBe(true)
    expect(storeSettingsContext(complete)).toContain('configurados')
  })
})

describe('products completion', () => {
  it('requires at least one active product', () => {
    expect(isProductsStepComplete({ all: 2, active: 1 })).toBe(true)
    expect(productsContext({ all: 2, active: 1 })).toBe('2 cadastrados · 1 ativos')
  })
})

describe('categories completion', () => {
  it('requires visible category', () => {
    const categories = [category({ visible: true }), category({ id: 'c2', visible: false })]
    expect(isCategoriesStepComplete(categories)).toBe(true)
    expect(categoriesContext(categories)).toBe('1 visíveis · 1 oculta')
  })
})

describe('banner completion', () => {
  it('desktop requires active slide with desktop image', () => {
    expect(isDesktopBannerStepComplete([slide()])).toBe(true)
    expect(isDesktopBannerStepComplete([slide({ active: false })])).toBe(false)
    expect(desktopBannerContext([slide()])).toContain('desktop')
  })

  it('mobile accepts dedicated mobile or all-with-desktop fallback', () => {
    expect(
      isMobileBannerStepComplete([
        slide({ visibility: 'mobile', desktopImagePath: null, mobileImagePath: 'banners/m.webp' }),
      ])
    ).toBe(true)
    expect(isMobileBannerStepComplete([slide({ visibility: 'all' })])).toBe(true)
    expect(mobileBannerContext([])).toBe('Nenhum banner mobile publicado')
  })
})

describe('computeOnboardingProgressFromSnapshot', () => {
  it('calculates weighted percent with explicit rules', () => {
    const settings = {
      ...createDefaultStoreSettings(),
      storeName: 'Minha Loja',
      description: 'Descrição com mais de dez caracteres',
      phone: '11999999999',
    }
    const progress = computeOnboardingProgressFromSnapshot(createDefaultOnboardingState(), {
      ...snapshot({
        settings,
        productCounts: { all: 1, active: 1 },
        categories: [category({ visible: true })],
        slides: [slide()],
      }),
    })

    expect(progress.percentComplete).toBe(90)
    expect(progress.items.find((i) => i.id === 'products')?.completed).toBe(true)
    expect(progress.items.find((i) => i.id === 'store-settings')?.completed).toBe(true)
    expect(progress.items.find((i) => i.id === 'review-storefront')?.context).toBe(
      'Aguardando visita à vitrine'
    )
  })

  it('marks manual steps complete from state', () => {
    const state: AdminOnboardingState = {
      ...createDefaultOnboardingState(),
      manuallyCompletedSteps: ['review-storefront', 'first-sale'],
    }
    const progress = computeOnboardingProgressFromSnapshot(
      state,
      snapshot({
        productCounts: { all: 1, active: 1 },
        categories: [category({ visible: true })],
        slides: [slide()],
        settings: {
          ...createDefaultStoreSettings(),
          storeName: 'Minha Loja',
          description: 'Descrição com mais de dez caracteres',
          phone: '11999999999',
        },
      })
    )

    expect(progress.percentComplete).toBe(100)
    expect(progress.headline).toBe('Loja configurada')
    expect(progress.storeMature).toBe(true)
  })

  it('includes optional media step', () => {
    const progress = computeOnboardingProgressFromSnapshot(
      createDefaultOnboardingState(),
      snapshot({ productCounts: { all: 1, active: 1 }, mediaIssueCount: 1 })
    )

    expect(progress.items.some((i) => i.id === 'review-media')).toBe(true)
    expect(progress.items.find((i) => i.id === 'review-media')?.completed).toBe(false)
  })

  it('permite concluir mídia manualmente com pendências', () => {
    const state: AdminOnboardingState = {
      ...createDefaultOnboardingState(),
      manuallyCompletedSteps: ['review-media'],
    }
    const progress = computeOnboardingProgressFromSnapshot(
      state,
      snapshot({ productCounts: { all: 10, active: 5 }, mediaIssueCount: 3382 })
    )

    const media = progress.items.find((i) => i.id === 'review-media')
    expect(media?.completed).toBe(true)
    expect(media?.context).toContain('concluído manualmente')
  })

  it('permite concluir etapa ponderada manualmente', () => {
    const state: AdminOnboardingState = {
      ...createDefaultOnboardingState(),
      manuallyCompletedSteps: ['banner-mobile'],
    }
    const progress = computeOnboardingProgressFromSnapshot(state, snapshot())

    const step = progress.items.find((i) => i.id === 'banner-mobile')
    expect(step?.completed).toBe(true)
    expect(step?.context).toContain('concluído manualmente')
  })
})
