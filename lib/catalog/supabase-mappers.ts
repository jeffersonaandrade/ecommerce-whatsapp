import { Product, ProductStatus } from '@/types/product'

export type ProductRow = {
  id: string
  slug: string
  name: string
  short_description: string
  long_description?: string
  price: number
  promotional_price: number | null
  category: string
  club: string | null
  images: string[]
  status: ProductStatus
  import_batch_id: string | null
  personalization_enabled?: boolean | null
  personalization_price?: number | null
  created_at?: string
  updated_at?: string
}

export type ProductVariationRow = {
  id: string
  product_id: string
  size: string | null
  color: string | null
  sku: string
  stock: number
}

export function rowsToProduct(
  row: ProductRow,
  variations: ProductVariationRow[]
): Product {
  return {
    id: row.id,
    slug: row.slug,
    name: row.name,
    shortDescription: row.short_description,
    longDescription: row.long_description ?? '',
    price: Number(row.price),
    promotionalPrice:
      row.promotional_price != null ? Number(row.promotional_price) : undefined,
    category: row.category,
    club: row.club ?? undefined,
    images: row.images ?? [],
    variations: variations.map((v) => ({
      id: v.id,
      size: v.size ?? undefined,
      color: v.color ?? undefined,
      sku: v.sku,
      stock: v.stock,
    })),
    status: row.status,
    importBatchId: row.import_batch_id ?? undefined,
    personalizationEnabled: row.personalization_enabled ?? false,
    personalizationPrice:
      row.personalization_price != null ? Number(row.personalization_price) : null,
  }
}

export function productToRow(product: Product): ProductRow {
  return {
    id: product.id,
    slug: product.slug,
    name: product.name,
    short_description: product.shortDescription,
    long_description: product.longDescription,
    price: product.price,
    promotional_price: product.promotionalPrice ?? null,
    category: product.category,
    club: product.club ?? null,
    images: product.images,
    status: product.status,
    import_batch_id: product.importBatchId ?? null,
    personalization_enabled: product.personalizationEnabled ?? false,
    personalization_price: product.personalizationPrice ?? null,
    updated_at: new Date().toISOString(),
  }
}

export function variationsToRows(productId: string, product: Product): ProductVariationRow[] {
  return product.variations.map((v) => ({
    id: v.id,
    product_id: productId,
    size: v.size ?? null,
    color: v.color ?? null,
    sku: v.sku,
    stock: v.stock,
  }))
}
