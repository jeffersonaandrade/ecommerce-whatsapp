import type { CartAddons } from '@/types/cart-addons'

export type PurchaseIntentLine = {
  productName: string
  slug: string
  productUrl: string
  size?: string
  color?: string
  sku: string
  quantity: number
  lineSubtotal: number
  addons?: CartAddons
  addonsExtra?: number
  lineMerchandiseTotal: number
}

export type PurchaseIntent = {
  id: string
  createdAt: string
  lines: PurchaseIntentLine[]
  merchandiseSubtotal: number
  addonsSubtotal: number
  commercialDiscount: number
  appliedRuleName?: string
  cartTotal: number
}
