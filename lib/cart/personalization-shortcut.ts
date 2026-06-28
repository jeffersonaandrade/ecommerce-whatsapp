import { hasPersonalizationAddons } from '@/lib/personalization/validate-personalization'
import type { PricedCartLine } from '@/types/cart-pricing'
import { Product } from '@/types/product'

export type PersonalizationShortcutInput = {
  globalEnabled: boolean
  product: Product | undefined
  line: Pick<PricedCartLine, 'addons' | 'maxStock'>
  isCatalogReady?: boolean
}

export function canShowPersonalizationShortcut(
  input: PersonalizationShortcutInput
): boolean {
  if (input.isCatalogReady === false) return false
  if (!input.globalEnabled) return false
  if (hasPersonalizationAddons(input.line.addons)) return false
  if (!input.product || input.product.status !== 'active') return false
  if (!input.product.personalizationEnabled) return false
  if (input.line.maxStock <= 0) return false
  return true
}

export const FROM_CART_PARAM = 'fromCart'

export function buildPersonalizationPdpUrl(slug: string, variationId: string): string {
  const params = new URLSearchParams({
    personalizar: '1',
    fromCart: '1',
    variation: variationId,
  })
  return `/products/${slug}?${params.toString()}`
}

export function shouldReplaceUnpersonalizedCartLine(input: {
  fromCartIntent: boolean
  personalizarIntent: boolean
  hasPersonalization: boolean
}): boolean {
  return (
    input.fromCartIntent &&
    input.personalizarIntent &&
    input.hasPersonalization
  )
}
