import { calculateSubtotal, type CartLine } from '@/lib/cart-utils'
import { PurchaseIntent, PurchaseIntentLine } from '@/types/purchase-intent'

function createIntentId(): string {
  const stamp = Date.now().toString(36)
  const random = Math.random().toString(36).slice(2, 8)
  return `intent-${stamp}-${random}`
}

export function buildPurchaseIntentFromCart(
  lines: CartLine[],
  baseUrl: string
): PurchaseIntent | null {
  if (lines.length === 0) return null

  const normalizedBase = baseUrl.replace(/\/$/, '')
  const intentLines: PurchaseIntentLine[] = lines.map((line) => ({
    productName: line.name,
    slug: line.slug,
    productUrl: `${normalizedBase}/products/${line.slug}`,
    size: line.size,
    color: line.color,
    sku: line.sku ?? '',
    quantity: line.quantity,
    lineSubtotal: line.lineTotal,
  }))

  return {
    id: createIntentId(),
    createdAt: new Date().toISOString(),
    lines: intentLines,
    cartTotal: calculateSubtotal(lines),
  }
}
