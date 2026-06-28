import { Product, ProductStatus } from '@/types/product'
import type { ProductQuery, ProductQueryResult, StorefrontProductQuery } from '@/lib/query'

export type VariationInput = {
  id?: string
  size?: string
  color?: string
  sku: string
  stock: number
}

export type ProductInput = Omit<
  Product,
  'id' | 'slug' | 'shortDescription' | 'variations'
> & {
  slug?: string
  shortDescription?: string
  variations: VariationInput[]
}

export interface ProductRepository {
  getAll(): Promise<Product[]>
  getActive(): Promise<Product[]>
  getById(id: string): Promise<Product | undefined>
  getBySlug(slug: string): Promise<Product | undefined>
  getByIds(ids: string[], fields?: ProductQuery['fields']): Promise<Product[]>
  create(input: ProductInput): Promise<Product>
  update(id: string, input: ProductInput): Promise<Product>
  delete(id: string): Promise<void>
  saveAll(products: Product[]): Promise<void>
  query(q: ProductQuery): Promise<ProductQueryResult>
  queryStorefront(q: StorefrontProductQuery): Promise<ProductQueryResult>
  getStorefrontFeatured(limit: number): Promise<Product[]>
  bulkSetStatus(ids: string[], status: ProductStatus): Promise<void>
  bulkSetCategory(ids: string[], category: string): Promise<void>
  deleteMany(ids: string[]): Promise<void>
  setProductImages(id: string, images: string[]): Promise<Product>
  bulkSetProductImages(items: { id: string; images: string[] }[]): Promise<void>
  findConflictingSkus(skus: string[], excludeProductId?: string): Promise<string[]>
}
