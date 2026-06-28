import { cache } from 'react'
import { Product } from '@/types/product'
import { getProductRepository } from '@/lib/catalog/get-product-repository'
import type { ProductQuery, ProductQueryResult, StorefrontProductQuery } from '@/lib/query'
import { productMatchesCategoryFilter } from '@/lib/catalog/category-utils'
import { isStorefrontTestResidue } from '@/lib/catalog/storefront-categories'
import { getStorefrontCategories } from '@/lib/categories'

async function loadStorefrontCatalog(): Promise<Product[]> {
  return getProductRepository().getActive()
}

async function loadAdminCatalog(): Promise<Product[]> {
  return getProductRepository().getAll()
}

function isStorefrontProduct(product: Product): boolean {
  return product.status === 'active' && !isStorefrontTestResidue(product)
}

export function isProductInStock(product: Product): boolean {
  return product.variations.some((v) => v.stock > 0)
}

export async function getAllProducts(): Promise<Product[]> {
  return (await loadStorefrontCatalog()).filter(isStorefrontProduct)
}

export const getAllProductsAdmin = cache(async (): Promise<Product[]> => {
  return loadAdminCatalog()
})

export async function getFeaturedProducts(limit: number = 6): Promise<Product[]> {
  const repo = getProductRepository()
  const products = await repo.getStorefrontFeatured(limit)
  return products.filter(isStorefrontProduct)
}

export async function queryStorefrontProducts(
  q: StorefrontProductQuery
): Promise<ProductQueryResult> {
  const result = await getProductRepository().queryStorefront({
    ...q,
    fields: q.fields ?? 'list',
  })
  return {
    ...result,
    products: result.products.filter(isStorefrontProduct),
    total: result.total,
  }
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
  const result = await queryStorefrontProducts({
    pagination: { page: 1, pageSize: 5000 },
    fields: 'list',
  })
  return result.products.filter((p) =>
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

export type ProductCartLite = {
  id: string
  slug: string
  name: string
  price: number
  promotionalPrice?: number
  images: string[]
  variations: Array<{
    id: string
    sku: string
    stock: number
    size?: string
    color?: string
  }>
}

export function toProductCartLite(product: Product): ProductCartLite {
  return {
    id: product.id,
    slug: product.slug,
    name: product.name,
    price: product.price,
    promotionalPrice: product.promotionalPrice,
    images: product.images,
    variations: product.variations.map((v) => ({
      id: v.id,
      sku: v.sku,
      stock: v.stock,
      size: v.size,
      color: v.color,
    })),
  }
}

export async function getStorefrontProductsLite(): Promise<ProductCartLite[]> {
  const result = await queryStorefrontProducts({
    pagination: { page: 1, pageSize: 5000 },
    fields: 'list',
  })
  return result.products.map(toProductCartLite)
}
