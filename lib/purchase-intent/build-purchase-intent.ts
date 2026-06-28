import { buildPurchaseIntentFromPricing } from '@/lib/pricing/build-purchase-intent'
import { CartPricing } from '@/types/cart-pricing'
import { PurchaseIntent } from '@/types/purchase-intent'

export function buildPurchaseIntentFromCart(
  pricing: CartPricing,
  baseUrl: string
): PurchaseIntent | null {
  return buildPurchaseIntentFromPricing(pricing, baseUrl)
}
