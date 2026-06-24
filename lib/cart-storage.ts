import { CartItem } from '@/types/product'

export const CART_STORAGE_KEY = 'ecommerce-sports-cart'

function isValidCartItem(value: unknown): value is CartItem {
  if (!value || typeof value !== 'object') return false
  const item = value as Record<string, unknown>
  return (
    typeof item.productId === 'string' &&
    typeof item.variationId === 'string' &&
    typeof item.quantity === 'number' &&
    item.quantity > 0 &&
    Number.isFinite(item.quantity)
  )
}

export function loadCartItems(): CartItem[] {
  if (typeof window === 'undefined') return []

  try {
    const raw = localStorage.getItem(CART_STORAGE_KEY)
    if (!raw) return []

    const parsed: unknown = JSON.parse(raw)
    if (!Array.isArray(parsed)) return []

    return parsed.filter(isValidCartItem).map((item) => ({
      productId: item.productId,
      variationId: item.variationId,
      quantity: Math.floor(item.quantity),
    }))
  } catch {
    return []
  }
}

export function saveCartItems(items: CartItem[]): void {
  if (typeof window === 'undefined') return

  const minimal = items.map(({ productId, variationId, quantity }) => ({
    productId,
    variationId,
    quantity,
  }))

  localStorage.setItem(CART_STORAGE_KEY, JSON.stringify(minimal))
}
