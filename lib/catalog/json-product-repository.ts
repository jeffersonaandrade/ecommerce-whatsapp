import 'server-only'

import { Product } from '@/types/product'
import { ProductInput, ProductRepository } from './product-repository'
import { loadCatalogFromDisk, persistCatalog } from './catalog-storage'
import {
  assignVariationIds,
  deriveShortDescription,
  slugifyUnique,
} from './product-utils'

function nextProductId(products: Product[]): string {
  const numeric = products
    .map((p) => parseInt(p.id, 10))
    .filter((n) => !Number.isNaN(n))
  const max = numeric.length ? Math.max(...numeric) : 0
  return String(max + 1)
}

function buildProduct(input: ProductInput, existing: Product[]): Product {
  const slug = slugifyUnique(input.slug ?? input.name, existing)
  const longDescription = input.longDescription.trim()
  return {
    id: nextProductId(existing),
    name: input.name.trim(),
    slug,
    shortDescription:
      input.shortDescription?.trim() || deriveShortDescription(longDescription),
    longDescription,
    price: input.price,
    promotionalPrice: input.promotionalPrice || undefined,
    category: input.category.trim(),
    club: input.club?.trim() || undefined,
    images: input.images.filter(Boolean).slice(0, 5),
    variations: assignVariationIds(input.variations),
    status: input.status,
  }
}

export const jsonProductRepository: ProductRepository = {
  async getAll(): Promise<Product[]> {
    return loadCatalogFromDisk()
  },

  async getById(id: string): Promise<Product | undefined> {
    return loadCatalogFromDisk().find((p) => p.id === id)
  },

  async getBySlug(slug: string): Promise<Product | undefined> {
    return loadCatalogFromDisk().find((p) => p.slug === slug)
  },

  async create(input: ProductInput): Promise<Product> {
    const products = loadCatalogFromDisk()
    const product = buildProduct(input, products)
    persistCatalog([...products, product])
    return product
  },

  async update(id: string, input: ProductInput): Promise<Product> {
    const products = loadCatalogFromDisk()
    const index = products.findIndex((p) => p.id === id)
    if (index === -1) throw new Error('Produto não encontrado')

    const others = products.filter((p) => p.id !== id)
    const slug = slugifyUnique(input.slug ?? input.name, others, id)
    const longDescription = input.longDescription.trim()
    const updated: Product = {
      ...products[index],
      name: input.name.trim(),
      slug,
      shortDescription:
        input.shortDescription?.trim() || deriveShortDescription(longDescription),
      longDescription,
      price: input.price,
      promotionalPrice: input.promotionalPrice || undefined,
      category: input.category.trim(),
      club: input.club?.trim() || undefined,
      images: input.images.filter(Boolean).slice(0, 5),
      variations: assignVariationIds(input.variations, products[index].variations),
      status: input.status,
    }
    const next = [...products]
    next[index] = updated
    persistCatalog(next)
    return updated
  },

  async delete(id: string): Promise<void> {
    const products = loadCatalogFromDisk()
    persistCatalog(products.filter((p) => p.id !== id))
  },

  async saveAll(products: Product[]): Promise<void> {
    persistCatalog(products)
  },
}
