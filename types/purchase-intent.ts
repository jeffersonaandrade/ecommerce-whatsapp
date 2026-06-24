export type PurchaseIntentLine = {
  productName: string
  slug: string
  productUrl: string
  size?: string
  color?: string
  sku: string
  quantity: number
  lineSubtotal: number
}

export type PurchaseIntent = {
  id: string
  createdAt: string
  lines: PurchaseIntentLine[]
  cartTotal: number
}
