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
  getAll(): Product[]
  getById(id: string): Product | undefined
  getBySlug(slug: string): Product | undefined
  create(input: ProductInput): Product
  update(id: string, input: ProductInput): Product
  delete(id: string): void
  saveAll(products: Product[]): void
}
