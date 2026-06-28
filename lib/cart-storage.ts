import { CartItem } from '@/types/product'
import { CartAddons } from '@/types/cart-addons'
import { canonicalAddonsKey } from '@/lib/personalization/validate-personalization'

export const CART_STORAGE_KEY = 'ecommerce-sports-cart'
export const CART_STORAGE_VERSION = 2

type StoredCart = {
  version: number
  items: CartItem[]
}

function isValidAddons(value: unknown): value is CartAddons {
  if (!value || typeof value !== 'object') return false
  const addons = value as Record<string, unknown>
  if (addons.personalization != null) {
    const p = addons.personalization as Record<string, unknown>
    if (typeof p.name !== 'string' || typeof p.number !== 'string') return false
    if (p.notes != null && typeof p.notes !== 'string') return false
  }
  return true
}

function isValidCartItem(value: unknown): value is CartItem {
  if (!value || typeof value !== 'object') return false
  const item = value as Record<string, unknown>
  const base =
    typeof item.productId === 'string' &&
    typeof item.variationId === 'string' &&
    typeof item.quantity === 'number' &&
    item.quantity > 0 &&
    Number.isFinite(item.quantity)

  if (!base) return false
  if (item.addons !== undefined && !isValidAddons(item.addons)) return false
  return true
}

function normalizeItem(item: CartItem): CartItem {
  const hasAddons = item.addons?.personalization
  const quantity = hasAddons ? 1 : Math.floor(item.quantity)
  return {
    productId: item.productId,
    variationId: item.variationId,
    quantity: Math.max(1, quantity),
    addons: item.addons,
  }
}

function parseLegacyItems(parsed: unknown): CartItem[] {
  if (!Array.isArray(parsed)) return []
  return parsed.filter(isValidCartItem).map(normalizeItem)
}

function parseStoredCart(raw: string): CartItem[] {
  try {
    const parsed: unknown = JSON.parse(raw)
    if (Array.isArray(parsed)) {
      return parseLegacyItems(parsed)
    }
    if (parsed && typeof parsed === 'object') {
      const stored = parsed as Partial<StoredCart>
      if (Array.isArray(stored.items)) {
        return parseLegacyItems(stored.items)
      }
    }
  } catch {
    return []
  }
  return []
}

export function loadCartItems(): CartItem[] {
  if (typeof window === 'undefined') return []

  try {
    const raw = localStorage.getItem(CART_STORAGE_KEY)
    if (!raw) return []
    return parseStoredCart(raw)
  } catch {
    return []
  }
}

export function saveCartItems(items: CartItem[]): void {
  if (typeof window === 'undefined') return

  const payload: StoredCart = {
    version: CART_STORAGE_VERSION,
    items: items.map((item) => ({
      productId: item.productId,
      variationId: item.variationId,
      quantity: item.quantity,
      ...(item.addons ? { addons: item.addons } : {}),
    })),
  }

  localStorage.setItem(CART_STORAGE_KEY, JSON.stringify(payload))
}

export function cartItemKey(
  productId: string,
  variationId: string,
  addons?: CartAddons
): string {
  return `${productId}:${variationId}:${canonicalAddonsKey(addons)}`
}
