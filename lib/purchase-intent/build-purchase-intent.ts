import { calculateSubtotal, type CartLine } from '@/lib/cart-utils'
import { PurchaseIntent, PurchaseIntentLine } from '@/types/purchase-intent'

function createOrderReference(): string {
  const now = new Date()
  const date = now.toISOString().slice(0, 10).replace(/-/g, '')
  const seq = Math.floor(Math.random() * 10000)
    .toString()
    .padStart(4, '0')
  return `TEMP-${date}-${seq}`
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
    id: createOrderReference(),
    createdAt: new Date().toISOString(),
    lines: intentLines,
    cartTotal: calculateSubtotal(lines),
  }
}
