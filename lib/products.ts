import { Product } from '@/types/product'
import { getProductRepository } from '@/lib/catalog/get-product-repository'
import type { ProductQuery, ProductQueryResult } from '@/lib/query'
import { productMatchesCategoryFilter } from '@/lib/catalog/category-utils'
import { isStorefrontTestResidue } from '@/lib/catalog/storefront-categories'
import { getStorefrontCategories } from '@/lib/categories'

async function loadCatalog(): Promise<Product[]> {
  return getProductRepository().getAll()
}

function isStorefrontProduct(product: Product): boolean {
  return product.status === 'active' && !isStorefrontTestResidue(product)
}

export async function getAllProducts(): Promise<Product[]> {
  return (await loadCatalog()).filter(isStorefrontProduct)
}

export async function getAllProductsAdmin(): Promise<Product[]> {
  return loadCatalog()
}

export async function getFeaturedProducts(limit: number = 6): Promise<Product[]> {
  return (await getAllProducts()).slice(0, limit)
}

export async function getProductBySlug(slug: string): Promise<Product | undefined> {
  const product = await getProductRepository().getBySlug(slug)
  if (!product || !isStorefrontProduct(product)) return undefined
  return product
}

export async function getProductById(id: string): Promise<Product | undefined> {
  const product = await getProductRepository().getById(id)
  if (!product || !isStorefrontProduct(product)) return undefined
  return product
}

export async function getProductByIdAdmin(id: string): Promise<Product | undefined> {
  return getProductRepository().getById(id)
}

export async function getProductsByCategory(categoryParam: string): Promise<Product[]> {
  const categories = await getStorefrontCategories()
  return (await getAllProducts()).filter((p) =>
    productMatchesCategoryFilter(p.category, categoryParam, categories)
  )
}

export async function getCategories(): Promise<string[]> {
  const categories = new Set<string>()
  ;(await getAllProducts()).forEach((p) => categories.add(p.category))
  return Array.from(categories).sort()
}

export async function getCategoriesAdmin(): Promise<string[]> {
  const categories = new Set<string>()
  ;(await getAllProductsAdmin()).forEach((p) => categories.add(p.category))
  return Array.from(categories).sort()
}

export async function queryProductsAdmin(q: ProductQuery): Promise<ProductQueryResult> {
  return getProductRepository().query(q)
}
