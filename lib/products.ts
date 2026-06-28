import { cache } from 'react'
import { unstable_cache } from 'next/cache'
import { Product } from '@/types/product'
import { getProductRepository } from '@/lib/catalog/get-product-repository'
import type { ProductQuery, ProductQueryResult, StorefrontProductQuery } from '@/lib/query'
import type { ProductCartLite } from '@/lib/products-types'
import { cartLiteToProduct as cartLiteToProductMapper } from '@/lib/catalog/cart-lite-mapper'
import { isStorefrontTestResidue } from '@/lib/catalog/storefront-categories'

export type { ProductCartLite } from '@/lib/products-types'

const STOREFRONT_REVALIDATE_SECONDS = 60

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
  return getCachedFeaturedProducts(limit)
}

const getCachedFeaturedProducts = unstable_cache(
  async (limit: number) => {
    const repo = getProductRepository()
    const products = await repo.getStorefrontFeatured(limit)
    return products.filter(isStorefrontProduct)
  },
  ['storefront-featured'],
  { revalidate: STOREFRONT_REVALIDATE_SECONDS, tags: ['storefront'] }
)

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
  return getCachedProductBySlug(slug)
}

async function fetchProductBySlugUncached(slug: string): Promise<Product | undefined> {
  const product = await getProductRepository().getBySlug(slug)
  if (!product || !isStorefrontProduct(product)) return undefined
  return product
}

const getCachedProductBySlug = (slug: string) =>
  unstable_cache(
    () => fetchProductBySlugUncached(slug),
    ['storefront-product-slug', slug],
    { revalidate: STOREFRONT_REVALIDATE_SECONDS, tags: ['storefront', `product-${slug}`] }
  )()

export async function getProductById(id: string): Promise<Product | undefined> {
  const product = await getProductRepository().getById(id)
  if (!product || !isStorefrontProduct(product)) return undefined
  return product
}

export async function getProductByIdAdmin(id: string): Promise<Product | undefined> {
  return getProductRepository().getById(id)
}

export async function getProductsByCategory(categoryParam: string): Promise<Product[]> {
  const result = await queryStorefrontProducts({
    category: categoryParam,
    pagination: { page: 1, pageSize: 5000 },
    fields: 'list',
  })
  return result.products
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

export function toProductCartLite(product: Product): ProductCartLite {
  return {
    id: product.id,
    slug: product.slug,
    name: product.name,
    price: product.price,
    promotionalPrice: product.promotionalPrice,
    images: product.images,
    personalizationEnabled: product.personalizationEnabled ?? false,
    personalizationPrice: product.personalizationPrice ?? null,
    variations: product.variations.map((v) => ({
      id: v.id,
      sku: v.sku,
      stock: v.stock,
      size: v.size,
      color: v.color,
    })),
  }
}

export function cartLiteToProduct(lite: ProductCartLite): Product {
  return cartLiteToProductMapper(lite)
}

export async function getStorefrontProductsLiteByIds(ids: string[]): Promise<ProductCartLite[]> {
  const uniqueIds = [...new Set(ids.map((id) => id.trim()).filter(Boolean))]
  if (!uniqueIds.length) return []

  const products = await getProductRepository().getByIds(uniqueIds, 'list')
  return products.filter(isStorefrontProduct).map(toProductCartLite)
}

export async function getStorefrontProductsLite(): Promise<ProductCartLite[]> {
  const result = await queryStorefrontProducts({
    pagination: { page: 1, pageSize: 5000 },
    fields: 'list',
  })
  return result.products.map(toProductCartLite)
}
