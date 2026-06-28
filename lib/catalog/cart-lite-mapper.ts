import { Product } from '@/types/product'
import type { ProductCartLite } from '@/lib/products-types'

export function cartLiteToProduct(lite: ProductCartLite): Product {
  return {
    id: lite.id,
    slug: lite.slug,
    name: lite.name,
    shortDescription: lite.name,
    longDescription: '',
    price: lite.price,
    promotionalPrice: lite.promotionalPrice,
    category: '',
    images: lite.images,
    variations: lite.variations.map((v) => ({
      id: v.id,
      sku: v.sku,
      stock: v.stock,
      size: v.size,
      color: v.color,
    })),
    status: 'active',
    personalizationEnabled: lite.personalizationEnabled ?? false,
    personalizationPrice: lite.personalizationPrice ?? null,
  }
}
