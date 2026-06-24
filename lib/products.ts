import 'server-only'

import { Product } from '@/types/product'
import { getProductRepository } from '@/lib/catalog/json-product-repository'

function readCatalog(): Product[] {
  return getProductRepository().getAll()
}

export function getAllProducts(): Product[] {
  return readCatalog().filter((p) => p.status === 'active')
}

export function getAllProductsAdmin(): Product[] {
  return readCatalog()
}

export function getFeaturedProducts(limit: number = 6): Product[] {
  return getAllProducts().slice(0, limit)
}

export function getProductBySlug(slug: string): Product | undefined {
  const product = readCatalog().find((p) => p.slug === slug)
  if (!product || product.status !== 'active') return undefined
  return product
}

export function getProductById(id: string): Product | undefined {
  const product = readCatalog().find((p) => p.id === id)
  if (!product || product.status !== 'active') return undefined
  return product
}

export function getProductByIdAdmin(id: string): Product | undefined {
  return readCatalog().find((p) => p.id === id)
}

export function getProductsByCategory(category: string): Product[] {
  return getAllProducts().filter((p) => p.category === category)
}

export function getCategories(): string[] {
  const categories = new Set<string>()
  getAllProducts().forEach((p) => categories.add(p.category))
  return Array.from(categories).sort()
}

export function getCategoriesAdmin(): string[] {
  const categories = new Set<string>()
  getAllProductsAdmin().forEach((p) => categories.add(p.category))
  return Array.from(categories).sort()
}
