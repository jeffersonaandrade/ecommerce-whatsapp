import { Product } from '@/types/product'

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
}
