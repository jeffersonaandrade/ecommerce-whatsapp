export type ProductStatus = 'active' | 'draft' | 'unavailable'

export type ProductVariation = {
  id: string
  size?: string
  color?: string
  sku: string
  stock: number
}

export type Product = {
  id: string
  name: string
  slug: string
  shortDescription: string
  longDescription: string
  price: number
  promotionalPrice?: number
  category: string
  club?: string
  images: string[]
  variations: ProductVariation[]
  status: ProductStatus
}

export type CartItem = {
  productId: string
  variationId: string
  quantity: number
}

export type Cart = {
  items: CartItem[]
  total: number
  itemCount: number
}
