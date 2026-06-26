import { Product, ProductStatus } from '@/types/product'
import type { ProductQuery, ProductQueryResult } from '@/lib/query'

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
  getById(id: string): Promise<Product | undefined>
  getBySlug(slug: string): Promise<Product | undefined>
  create(input: ProductInput): Promise<Product>
  update(id: string, input: ProductInput): Promise<Product>
  delete(id: string): Promise<void>
  saveAll(products: Product[]): Promise<void>
  query(q: ProductQuery): Promise<ProductQueryResult>
  bulkSetStatus(ids: string[], status: ProductStatus): Promise<void>
  bulkSetCategory(ids: string[], category: string): Promise<void>
  deleteMany(ids: string[]): Promise<void>
}
