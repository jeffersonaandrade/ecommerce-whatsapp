import { CartAddons } from '@/types/cart-addons'
import { PersonalizationSettings } from '@/types/personalization-settings'
import { Product } from '@/types/product'

export function resolvePersonalizationUnitPrice(
  product: Product,
  settings: PersonalizationSettings
): number {
  if (product.personalizationPrice != null) {
    return product.personalizationPrice
  }
  return settings.defaultPrice
}

export function resolveAddonsUnitTotal(
  addons: CartAddons | undefined,
  product: Product,
  settings: PersonalizationSettings
): number {
  if (!addons?.personalization) return 0
  if (!settings.enabled || !product.personalizationEnabled) return 0
  return resolvePersonalizationUnitPrice(product, settings)
}
