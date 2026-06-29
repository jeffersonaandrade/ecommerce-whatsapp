export type ProductStatus = 'active' | 'draft' | 'unavailable'

export type ProductVariation = {
  id: string
  size?: string
  color?: string
  sku: string
  stock: number
}

import type { CartAddons } from '@/types/cart-addons'

export type Product = {
  id: string
  name: string
  slug: string
  shortDescription: string
  longDescription: string
  price: number
  promotionalPrice?: number
  category: string
  categoryId?: string | null
  club?: string
  images: string[]
  variations: ProductVariation[]
  status: ProductStatus
  importBatchId?: string
  personalizationEnabled?: boolean
  personalizationPrice?: number | null
}

export type CartItem = {
  productId: string
  variationId: string
  quantity: number
  addons?: CartAddons
}

export type Cart = {
  items: CartItem[]
  total: number
  itemCount: number
}
