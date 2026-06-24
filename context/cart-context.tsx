'use client'

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from 'react'
import { loadCartItems, saveCartItems } from '@/lib/cart-storage'
import { setCatalogCache } from '@/lib/catalog/client-catalog-cache'
import {
  calculateItemCount,
  calculateSubtotal,
  cartItemKey,
  findVariation,
  resolveCartLines,
} from '@/lib/cart-utils'
import { getProductById } from '@/lib/products-client'
import { CartItem, Product } from '@/types/product'

type CartContextValue = {
  items: CartItem[]
  itemCount: number
  subtotal: number
  isHydrated: boolean
  addItem: (productId: string, variationId: string, quantity?: number) => void
  removeItem: (productId: string, variationId: string) => void
  updateQuantity: (
    productId: string,
    variationId: string,
    quantity: number
  ) => void
  clearCart: () => void
}

const CartContext = createContext<CartContextValue | null>(null)

function sanitizeItems(items: CartItem[]): CartItem[] {
  const lines = resolveCartLines(items)
  const validKeys = new Set(
    lines.map((line) => cartItemKey(line.productId, line.variationId))
  )

  return items
    .filter((item) => validKeys.has(cartItemKey(item.productId, item.variationId)))
    .map((item) => {
      const line = lines.find(
        (l) =>
          l.productId === item.productId && l.variationId === item.variationId
      )
      if (!line) return item
      return { ...item, quantity: Math.min(item.quantity, line.maxStock) }
    })
    .filter((item) => item.quantity > 0)
}

export function CartProvider({ children }: { children: ReactNode }) {
  const [items, setItems] = useState<CartItem[]>([])
  const [isHydrated, setIsHydrated] = useState(false)

  useEffect(() => {
    let cancelled = false

    async function hydrate() {
      try {
        const res = await fetch('/api/products')
        if (res.ok) {
          const products = (await res.json()) as Product[]
          if (!cancelled) setCatalogCache(products)
        }
      } catch {
        // catálogo indisponível — carrinho segue com itens já validados
      }

      if (cancelled) return
      const stored = sanitizeItems(loadCartItems())
      setItems(stored)
      if (stored.length !== loadCartItems().length) {
        saveCartItems(stored)
      }
      setIsHydrated(true)
    }

    hydrate()
    return () => {
      cancelled = true
    }
  }, [])

  useEffect(() => {
    if (!isHydrated) return
    saveCartItems(items)
  }, [items, isHydrated])

  const persist = useCallback((next: CartItem[]) => {
    setItems(sanitizeItems(next))
  }, [])

  const addItem = useCallback(
    (productId: string, variationId: string, quantity = 1) => {
      const product = getProductById(productId)
      const variation = product ? findVariation(product, variationId) : undefined
      if (!product || !variation || variation.stock <= 0) return

      const addQty = Math.min(Math.max(1, Math.floor(quantity)), variation.stock)

      setItems((current) => {
        const key = cartItemKey(productId, variationId)
        const existing = current.find(
          (item) => cartItemKey(item.productId, item.variationId) === key
        )

        if (existing) {
          const nextQty = Math.min(existing.quantity + addQty, variation.stock)
          return current.map((item) =>
            cartItemKey(item.productId, item.variationId) === key
              ? { ...item, quantity: nextQty }
              : item
          )
        }

        return [...current, { productId, variationId, quantity: addQty }]
      })
    },
    []
  )

  const removeItem = useCallback((productId: string, variationId: string) => {
    const key = cartItemKey(productId, variationId)
    setItems((current) =>
      current.filter(
        (item) => cartItemKey(item.productId, item.variationId) !== key
      )
    )
  }, [])

  const updateQuantity = useCallback(
    (productId: string, variationId: string, quantity: number) => {
      if (quantity <= 0) {
        removeItem(productId, variationId)
        return
      }

      const product = getProductById(productId)
      const variation = product ? findVariation(product, variationId) : undefined
      if (!variation) {
        removeItem(productId, variationId)
        return
      }

      const nextQty = Math.min(Math.floor(quantity), variation.stock)
      const key = cartItemKey(productId, variationId)

      setItems((current) =>
        current.map((item) =>
          cartItemKey(item.productId, item.variationId) === key
            ? { ...item, quantity: nextQty }
            : item
        )
      )
    },
    [removeItem]
  )

  const clearCart = useCallback(() => {
    persist([])
  }, [persist])

  const lines = useMemo(() => resolveCartLines(items), [items])
  const itemCount = useMemo(() => calculateItemCount(items), [items])
  const subtotal = useMemo(() => calculateSubtotal(lines), [lines])

  const value = useMemo(
    () => ({
      items,
      itemCount,
      subtotal,
      isHydrated,
      addItem,
      removeItem,
      updateQuantity,
      clearCart,
    }),
    [
      items,
      itemCount,
      subtotal,
      isHydrated,
      addItem,
      removeItem,
      updateQuantity,
      clearCart,
    ]
  )

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>
}

export function useCart(): CartContextValue {
  const context = useContext(CartContext)
  if (!context) {
    throw new Error('useCart must be used within CartProvider')
  }
  return context
}
