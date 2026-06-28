import { CartPricing } from '@/types/cart-pricing'
import { PurchaseIntent, PurchaseIntentLine } from '@/types/purchase-intent'

function createOrderReference(): string {
  const now = new Date()
  const date = now.toISOString().slice(0, 10).replace(/-/g, '')
  const seq = Math.floor(Math.random() * 10000)
    .toString()
    .padStart(4, '0')
  return `TEMP-${date}-${seq}`
}

export function buildPurchaseIntentFromPricing(
  pricing: CartPricing,
  baseUrl: string
): PurchaseIntent | null {
  if (pricing.lines.length === 0) return null

  const normalizedBase = baseUrl.replace(/\/$/, '')
  const intentLines: PurchaseIntentLine[] = pricing.lines.map((line) => ({
    productName: line.name,
    slug: line.slug,
    productUrl: `${normalizedBase}/products/${line.slug}`,
    size: line.size,
    color: line.color,
    sku: line.sku ?? '',
    quantity: line.quantity,
    lineSubtotal: line.lineMerchandiseTotal,
    addons: line.addons,
    addonsExtra: line.addonsUnitTotal * line.quantity,
    lineMerchandiseTotal: line.lineMerchandiseTotal,
  }))

  return {
    id: createOrderReference(),
    createdAt: new Date().toISOString(),
    lines: intentLines,
    merchandiseSubtotal: pricing.merchandiseSubtotal,
    addonsSubtotal: pricing.addonsSubtotal,
    commercialDiscount: pricing.commercialDiscount,
    appliedRuleName: pricing.appliedRule?.ruleName,
    cartTotal: pricing.cartTotal,
  }
}
