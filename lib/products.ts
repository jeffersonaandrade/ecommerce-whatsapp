/**
 * Products abstraction layer
 *
 * This module abstracts product data access.
 * When backend/DB is integrated, only this file changes.
 * Pages continue to work unchanged.
 */

import { Product } from '@/types/product'
import { mockProducts } from '@/data/mock-products'

export function getAllProducts(): Product[] {
  return mockProducts.filter((p) => p.status === 'active')
}

export function getFeaturedProducts(limit: number = 6): Product[] {
  return getAllProducts().slice(0, limit)
}

export function getProductBySlug(slug: string): Product | undefined {
  return mockProducts.find((p) => p.slug === slug)
}

export function getProductById(id: string): Product | undefined {
  return mockProducts.find((p) => p.id === id)
}

export function getProductsByCategory(category: string): Product[] {
  return getAllProducts().filter((p) => p.category === category)
}

export function getCategories(): string[] {
  const categories = new Set<string>()
  mockProducts.forEach((p) => {
    if (p.status === 'active') {
      categories.add(p.category)
    }
  })
  return Array.from(categories).sort()
}
