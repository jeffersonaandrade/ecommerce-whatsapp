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
import { loadCartItems, saveCartItems, cartItemKey } from '@/lib/cart-storage'
import { fetchCatalogProductsByIds } from '@/lib/catalog/client-catalog-cache'
import { calculateItemCount, findVariation, cartItemKey as utilsCartItemKey } from '@/lib/cart-utils'
import { computeTotals } from '@/lib/pricing/compute-totals'
import { getProductById } from '@/lib/products-client'
import { CartAddons } from '@/types/cart-addons'
import { CartPricing } from '@/types/cart-pricing'
import { CommercialRule } from '@/types/commercial-rule'
import {
  CommercialPolicy,
  CommercialProductPolicyOverride,
  CommercialSalesChannels,
} from '@/types/commercial-policy'
import { PersonalizationSettings } from '@/types/personalization-settings'
import { CartItem, Product } from '@/types/product'
import {
  hasPersonalizationAddons,
  validatePersonalizationAddon,
} from '@/lib/personalization/validate-personalization'

export type CartPricingConfig = {
  personalizationSettings: PersonalizationSettings
  commercialRules: CommercialRule[]
  commercialPolicies?: CommercialPolicy[]
  policyOverrides?: CommercialProductPolicyOverride[]
  salesChannels?: CommercialSalesChannels
}

type CartContextValue = {
  items: CartItem[]
  itemCount: number
  pricing: CartPricing
  subtotal: number
  cartTotal: number
  isHydrated: boolean
  personalizationSettings: PersonalizationSettings
  addItem: (
    productId: string,
    variationId: string,
    quantity?: number,
    addons?: CartAddons
  ) => string | null
  removeItem: (productId: string, variationId: string, addons?: CartAddons) => void
  updateQuantity: (
    productId: string,
    variationId: string,
    quantity: number,
    addons?: CartAddons
  ) => void
  clearCart: () => void
}

const emptyPricing: CartPricing = {
  lines: [],
  merchandiseSubtotal: 0,
  addonsSubtotal: 0,
  commercialDiscount: 0,
  cartTotal: 0,
}

const defaultPersonalizationSettings: PersonalizationSettings = {
  enabled: false,
  defaultPrice: 0,
  nameMaxLength: 15,
  numberMin: 0,
  numberMax: 99,
  notesRequired: false,
  notesMaxLength: 200,
  updatedAt: new Date(0).toISOString(),
}

const CartContext = createContext<CartContextValue | null>(null)

function buildPricing(
  items: CartItem[],
  config: CartPricingConfig
): CartPricing {
  if (items.length === 0) return emptyPricing
  return computeTotals(items, {
    getProductById,
    personalizationSettings: config.personalizationSettings,
    commercialRules: config.commercialRules,
    commercialPolicies: config.commercialPolicies,
    policyOverrides: config.policyOverrides,
    salesChannels: config.salesChannels,
  })
}

function sanitizeItems(items: CartItem[], config: CartPricingConfig): CartItem[] {
  const pricing = buildPricing(items, config)
  const validKeys = new Set(
    pricing.lines.map((line) =>
      utilsCartItemKey(line.productId, line.variationId, line.addons)
    )
  )

  return items
    .filter((item) =>
      validKeys.has(utilsCartItemKey(item.productId, item.variationId, item.addons))
    )
    .map((item) => {
      const key = utilsCartItemKey(item.productId, item.variationId, item.addons)
      const line = pricing.lines.find(
        (l) => utilsCartItemKey(l.productId, l.variationId, l.addons) === key
      )
      if (!line) return item
      return { ...item, quantity: Math.min(item.quantity, line.maxStock) }
    })
    .filter((item) => item.quantity > 0)
}

export function CartProvider({
  children,
  pricingConfig,
}: {
  children: ReactNode
  pricingConfig?: CartPricingConfig
}) {
  const [items, setItems] = useState<CartItem[]>([])
  const [isHydrated, setIsHydrated] = useState(false)
  const [commercialRules, setCommercialRules] = useState<CommercialRule[]>(
    pricingConfig?.commercialRules ?? []
  )
  const [commercialPolicies, setCommercialPolicies] = useState<CommercialPolicy[]>(
    pricingConfig?.commercialPolicies ?? []
  )
  const [policyOverrides] = useState<CommercialProductPolicyOverride[]>(
    pricingConfig?.policyOverrides ?? []
  )
  const salesChannels = pricingConfig?.salesChannels

  const personalizationSettings =
    pricingConfig?.personalizationSettings ?? defaultPersonalizationSettings

  const config: CartPricingConfig = useMemo(
    () => ({
      personalizationSettings,
      commercialRules,
      commercialPolicies,
      policyOverrides,
      salesChannels,
    }),
    [personalizationSettings, commercialRules, commercialPolicies, policyOverrides, salesChannels]
  )

  useEffect(() => {
    if (pricingConfig?.commercialRules) return
    fetch('/api/commercial-rules/active')
      .then((res) => (res.ok ? res.json() : []))
      .then((rules: CommercialRule[]) => setCommercialRules(rules))
      .catch(() => {})
  }, [pricingConfig?.commercialRules])

  useEffect(() => {
    if (pricingConfig?.commercialPolicies) return
    fetch('/api/commercial-policies/active')
      .then((res) => (res.ok ? res.json() : []))
      .then((policies: CommercialPolicy[]) => setCommercialPolicies(policies))
      .catch(() => {})
  }, [pricingConfig?.commercialPolicies])

  useEffect(() => {
    let cancelled = false

    async function hydrate() {
      const stored = loadCartItems()
      const productIds = [...new Set(stored.map((item) => item.productId))]

      if (productIds.length > 0) {
        try {
          await fetchCatalogProductsByIds(productIds)
        } catch {
          // catálogo indisponível
        }
      }

      if (cancelled) return
      const sanitized = sanitizeItems(stored, config)
      setItems(sanitized)
      if (sanitized.length !== stored.length) {
        saveCartItems(sanitized)
      }
      setIsHydrated(true)
    }

    hydrate()
    return () => {
      cancelled = true
    }
  }, [config])

  useEffect(() => {
    if (!isHydrated) return
    saveCartItems(items)
  }, [items, isHydrated])

  const persist = useCallback(
    (next: CartItem[]) => {
      setItems(sanitizeItems(next, config))
    },
    [config]
  )

  const addItem = useCallback(
    (
      productId: string,
      variationId: string,
      quantity = 1,
      addons?: CartAddons
    ): string | null => {
      const product = getProductById(productId)
      const variation = product ? findVariation(product, variationId) : undefined
      if (!product || !variation || variation.stock <= 0) return null

      if (addons?.personalization) {
        const error = validatePersonalizationAddon(
          addons.personalization,
          personalizationSettings
        )
        if (error) return error
        if (!product.personalizationEnabled || !personalizationSettings.enabled) {
          return 'Personalização indisponível para este produto.'
        }
      }

      const hasAddons = hasPersonalizationAddons(addons)
      const addQty = hasAddons
        ? 1
        : Math.min(Math.max(1, Math.floor(quantity)), variation.stock)

      setItems((current) => {
        const key = cartItemKey(productId, variationId, addons)
        const existing = current.find(
          (item) => cartItemKey(item.productId, item.variationId, item.addons) === key
        )

        if (existing) {
          if (hasAddons) return current
          const nextQty = Math.min(existing.quantity + addQty, variation.stock)
          return current.map((item) =>
            cartItemKey(item.productId, item.variationId, item.addons) === key
              ? { ...item, quantity: nextQty }
              : item
          )
        }

        return [
          ...current,
          {
            productId,
            variationId,
            quantity: addQty,
            ...(addons ? { addons } : {}),
          },
        ]
      })

      return null
    },
    [personalizationSettings]
  )

  const removeItem = useCallback(
    (productId: string, variationId: string, addons?: CartAddons) => {
      const key = cartItemKey(productId, variationId, addons)
      setItems((current) =>
        current.filter(
          (item) => cartItemKey(item.productId, item.variationId, item.addons) !== key
        )
      )
    },
    []
  )

  const updateQuantity = useCallback(
    (
      productId: string,
      variationId: string,
      quantity: number,
      addons?: CartAddons
    ) => {
      if (hasPersonalizationAddons(addons)) return

      if (quantity <= 0) {
        removeItem(productId, variationId, addons)
        return
      }

      const product = getProductById(productId)
      const variation = product ? findVariation(product, variationId) : undefined
      if (!variation) {
        removeItem(productId, variationId, addons)
        return
      }

      const nextQty = Math.min(Math.floor(quantity), variation.stock)
      const key = cartItemKey(productId, variationId, addons)

      setItems((current) =>
        current.map((item) =>
          cartItemKey(item.productId, item.variationId, item.addons) === key
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

  const pricing = useMemo(() => buildPricing(items, config), [items, config])
  const itemCount = useMemo(() => calculateItemCount(items), [items])

  const value = useMemo(
    () => ({
      items,
      itemCount,
      pricing,
      subtotal: pricing.merchandiseSubtotal,
      cartTotal: pricing.cartTotal,
      isHydrated,
      personalizationSettings,
      addItem,
      removeItem,
      updateQuantity,
      clearCart,
    }),
    [
      items,
      itemCount,
      pricing,
      isHydrated,
      personalizationSettings,
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

export function useProductPersonalizationPrice(product: Product): number {
  const { personalizationSettings } = useCart()
  if (product.personalizationPrice != null) return product.personalizationPrice
  return personalizationSettings.defaultPrice
}
