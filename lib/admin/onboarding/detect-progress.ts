import 'server-only'

import type { AdminOnboardingState, OnboardingProgress, OnboardingProgressItem } from '@/types/admin-onboarding'
import type { BannerSlide } from '@/types/banner-slide'
import type { Category } from '@/types/category'
import type { Product } from '@/types/product'
import type { StoreSettings } from '@/types/store-settings'
import { normalizeBannerVisibility } from '@/lib/banners/banner-viewport'
import { classifyProductImagesInitial, normalizeSupabaseBaseUrl } from '@/lib/catalog/media/classify-url'
import { getAllBannerSlides } from '@/lib/banners'
import { getAllCategoriesAdmin } from '@/lib/categories'
import { getAllProductsAdmin } from '@/lib/products'
import { getStoreSettings } from '@/lib/store/settings-repository'
import {
  OPTIONAL_ONBOARDING_STEP,
  WEIGHTED_ONBOARDING_STEPS,
  productsHref,
} from './steps'

export function isStoreSettingsComplete(settings: StoreSettings): boolean {
  const storeNameOk = settings.storeName.trim().length >= 2
  const whatsappOk = settings.whatsappPhone.replace(/\D/g, '').length >= 10
  const descriptionOk = settings.description.trim().length >= 10
  const contactOk = Boolean(settings.phone.trim() || settings.email.trim())
  return storeNameOk && whatsappOk && descriptionOk && contactOk
}

export function storeSettingsContext(settings: StoreSettings): string {
  const missing: string[] = []
  if (settings.storeName.trim().length < 2) missing.push('nome da loja')
  if (settings.whatsappPhone.replace(/\D/g, '').length < 10) missing.push('WhatsApp válido')
  if (settings.description.trim().length < 10) missing.push('descrição')
  if (!settings.phone.trim() && !settings.email.trim()) missing.push('telefone ou e-mail')
  if (missing.length === 0) return 'WhatsApp e informações principais configurados'
  return `Falta: ${missing.join(', ')}`
}

export function isProductsStepComplete(products: Product[]): boolean {
  return products.some((p) => p.status === 'active')
}

export function productsContext(allProducts: Product[], activeProducts: Product[]): string {
  if (allProducts.length === 0) return 'Nenhum produto cadastrado'
  if (activeProducts.length === 0) return `${allProducts.length} cadastrados · nenhum ativo`
  return `${allProducts.length} cadastrados · ${activeProducts.length} ativos`
}

export function countMediaIssues(products: Product[], supabaseUrl: string): number {
  return products.filter((p) => {
    const status = classifyProductImagesInitial(p.images, supabaseUrl)
    return status === 'empty' || status === 'external'
  }).length
}

export function isCategoriesStepComplete(categories: Category[]): boolean {
  return categories.some((c) => c.visible)
}

export function categoriesContext(categories: Category[]): string {
  const visible = categories.filter((c) => c.visible).length
  const hidden = categories.length - visible
  if (visible === 0) return 'Nenhuma categoria visível'
  if (hidden === 0) return `${visible} visíveis`
  return `${visible} visíveis · ${hidden} oculta${hidden === 1 ? '' : 's'}`
}

export function hasDesktopBanner(slide: BannerSlide): boolean {
  if (!slide.active) return false
  const visibility = normalizeBannerVisibility(slide.visibility)
  if (visibility === 'mobile') return false
  return Boolean(slide.desktopImagePath?.trim())
}

export function hasMobileBanner(slide: BannerSlide): boolean {
  if (!slide.active) return false
  const visibility = normalizeBannerVisibility(slide.visibility)
  if (visibility === 'desktop') return false
  if (slide.mobileImagePath?.trim()) return true
  if (visibility === 'all' && slide.desktopImagePath?.trim()) return true
  return false
}

export function isDesktopBannerStepComplete(slides: BannerSlide[]): boolean {
  return slides.some(hasDesktopBanner)
}

export function isMobileBannerStepComplete(slides: BannerSlide[]): boolean {
  return slides.some(hasMobileBanner)
}

export function desktopBannerContext(slides: BannerSlide[]): string {
  const count = slides.filter(hasDesktopBanner).length
  if (count === 0) return 'Nenhum banner desktop válido'
  return `${count} slide${count === 1 ? '' : 's'} desktop ativo${count === 1 ? '' : 's'}`
}

export function mobileBannerContext(slides: BannerSlide[]): string {
  const count = slides.filter(hasMobileBanner).length
  if (count === 0) return 'Nenhum banner mobile publicado'
  return `${count} slide${count === 1 ? '' : 's'} com cobertura mobile`
}

function isManualStepComplete(state: AdminOnboardingState, stepId: AdminOnboardingState['manuallyCompletedSteps'][number]): boolean {
  return state.manuallyCompletedSteps.includes(stepId)
}

export type OnboardingSnapshot = {
  settings: StoreSettings
  allProducts: Product[]
  activeProducts: Product[]
  categories: Category[]
  slides: BannerSlide[]
  supabaseUrl: string
}

export async function loadOnboardingSnapshot(): Promise<OnboardingSnapshot> {
  const [settings, allProducts, categories, slides] = await Promise.all([
    getStoreSettings(),
    getAllProductsAdmin(),
    getAllCategoriesAdmin(),
    getAllBannerSlides(),
  ])

  const activeProducts = allProducts.filter((product) => product.status === 'active')

  return {
    settings,
    allProducts,
    activeProducts,
    categories,
    slides,
    supabaseUrl: normalizeSupabaseBaseUrl(process.env.NEXT_PUBLIC_SUPABASE_URL),
  }
}

export function computeOnboardingProgressFromSnapshot(
  state: AdminOnboardingState,
  snapshot: OnboardingSnapshot
): OnboardingProgress {
  const { settings, allProducts, activeProducts, categories, slides, supabaseUrl } = snapshot

  const weightedItems: OnboardingProgressItem[] = WEIGHTED_ONBOARDING_STEPS.map((step) => {
    let completed = false
    let autoCompleted = false
    let context = ''
    let href = step.href

    switch (step.id) {
      case 'products':
        completed = isProductsStepComplete(activeProducts)
        autoCompleted = completed
        context = productsContext(allProducts, activeProducts)
        href = productsHref()
        break
      case 'store-settings':
        completed = isStoreSettingsComplete(settings)
        autoCompleted = completed
        context = storeSettingsContext(settings)
        break
      case 'categories':
        completed = isCategoriesStepComplete(categories)
        autoCompleted = completed
        context = categoriesContext(categories)
        break
      case 'banner-desktop':
        completed = isDesktopBannerStepComplete(slides)
        autoCompleted = completed
        context = desktopBannerContext(slides)
        break
      case 'banner-mobile':
        completed = isMobileBannerStepComplete(slides)
        autoCompleted = completed
        context = mobileBannerContext(slides)
        break
      case 'review-storefront':
        completed = isManualStepComplete(state, 'review-storefront')
        autoCompleted = false
        context = completed ? 'Vitrine revisada' : 'Aguardando visita à vitrine'
        break
      case 'first-sale':
        completed = isManualStepComplete(state, 'first-sale')
        autoCompleted = false
        context = completed
          ? 'Link compartilhado'
          : 'Copie o link e compartilhe no WhatsApp'
        break
      default:
        break
    }

    return {
      id: step.id,
      label: step.label,
      href,
      weight: step.weight,
      completed,
      autoCompleted,
      context,
    }
  })

  const optionalItems: OnboardingProgressItem[] = []
  const mediaIssues = countMediaIssues(allProducts, supabaseUrl)
  optionalItems.push({
    id: OPTIONAL_ONBOARDING_STEP.id,
    label: OPTIONAL_ONBOARDING_STEP.label,
    href: OPTIONAL_ONBOARDING_STEP.href,
    weight: 0,
    completed: mediaIssues === 0 && allProducts.length > 0,
    autoCompleted: true,
    context:
      allProducts.length === 0
        ? 'Cadastre produtos primeiro'
        : mediaIssues === 0
          ? 'Imagens associadas'
          : `${mediaIssues} produto${mediaIssues === 1 ? '' : 's'} com imagem pendente`,
  })

  const items = [...weightedItems, ...optionalItems]
  const percentComplete = weightedItems.reduce(
    (sum, item) => sum + (item.completed ? item.weight : 0),
    0
  )

  const storeMature =
    isStoreSettingsComplete(settings) && isProductsStepComplete(activeProducts)

  const headline =
    percentComplete >= 100
      ? 'Loja configurada'
      : percentComplete >= 50
        ? 'Implantação em andamento'
        : 'Comece pela configuração da loja'

  return {
    items,
    percentComplete,
    headline,
    storeMature,
    siteUrl: settings.siteUrl,
  }
}

export async function computeOnboardingProgress(
  state: AdminOnboardingState
): Promise<OnboardingProgress> {
  const snapshot = await loadOnboardingSnapshot()
  return computeOnboardingProgressFromSnapshot(state, snapshot)
}
