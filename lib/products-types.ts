export type ProductCartLite = {
  id: string
  slug: string
  name: string
  price: number
  promotionalPrice?: number
  images: string[]
  variations: Array<{
    id: string
    sku: string
    stock: number
    size?: string
    color?: string
  }>
}
