import type { OnboardingStepId } from '@/types/admin-onboarding'

export type WeightedStepDef = {
  id: OnboardingStepId
  label: string
  href: string
  weight: number
}

export const WEIGHTED_ONBOARDING_STEPS: WeightedStepDef[] = [
  { id: 'products', label: 'Produtos', href: '/admin/products', weight: 40 },
  { id: 'store-settings', label: 'Configurações', href: '/admin/settings', weight: 20 },
  { id: 'categories', label: 'Categorias', href: '/admin/categories', weight: 15 },
  { id: 'banner-desktop', label: 'Banner desktop', href: '/admin/banners', weight: 10 },
  { id: 'banner-mobile', label: 'Banner mobile', href: '/admin/banners', weight: 5 },
  { id: 'review-storefront', label: 'Revisar loja', href: '/', weight: 5 },
  { id: 'first-sale', label: 'Primeira venda', href: '/', weight: 5 },
]

export const OPTIONAL_ONBOARDING_STEP: WeightedStepDef = {
  id: 'review-media',
  label: 'Central de Mídia',
  href: '/admin/products/media',
  weight: 0,
}

export function productsHref(): string {
  return '/admin/import'
}
