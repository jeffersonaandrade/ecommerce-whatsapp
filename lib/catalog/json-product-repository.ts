import 'server-only'

import { Product, ProductStatus } from '@/types/product'
import { ProductInput, ProductRepository } from './product-repository'
import type {
  ProductQuery,
  ProductQueryResult,
  ProductStatusCounts,
} from '@/lib/query'
import type { StorefrontProductQuery } from '@/lib/query/storefront-query'
import { classifyProductImagesInitial } from '@/lib/catalog/media/classify-url'
import type { MediaFilter } from '@/lib/catalog/media/types'
import { isStorefrontTestResidue } from '@/lib/catalog/storefront-categories'
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
    importBatchId: input.importBatchId,
  }
}

export const jsonProductRepository: ProductRepository = {
  async getAll(): Promise<Product[]> {
    return loadCatalogFromDisk()
  },

  async getActive(): Promise<Product[]> {
    return loadCatalogFromDisk().filter((p) => p.status === 'active')
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
      importBatchId: input.importBatchId ?? products[index].importBatchId,
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

  async query(q: ProductQuery): Promise<ProductQueryResult> {
    const all = loadCatalogFromDisk()
    const { filters = {}, sort = {}, pagination = {} } = q
    const page = Math.max(1, pagination.page ?? 1)
    const pageSize = pagination.pageSize ?? 25

    // counts are computed against all products (ignoring status filter)
    const countsBase = filters.search
      ? all.filter((p) => matchesSearch(p, filters.search!))
      : all

    const counts: ProductStatusCounts = countsBase.reduce(
      (acc, p) => {
        acc.all++
        if (p.status === 'active') acc.active++
        else if (p.status === 'draft') acc.draft++
        else if (p.status === 'unavailable') acc.unavailable++
        const stock = p.variations.reduce((s, v) => s + v.stock, 0)
        if (stock === 0) acc.noStock++
        return acc
      },
      { all: 0, active: 0, draft: 0, unavailable: 0, noStock: 0 }
    )

    let filtered = all

    if (filters.status?.length) {
      filtered = filtered.filter((p) => filters.status!.includes(p.status))
    }
    if (filters.category) {
      const cat = filters.category.toLowerCase()
      filtered = filtered.filter((p) => p.category.toLowerCase() === cat)
    }
    if (filters.hasStock === true) {
      filtered = filtered.filter(
        (p) => p.variations.reduce((s, v) => s + v.stock, 0) > 0
      )
    } else if (filters.hasStock === false) {
      filtered = filtered.filter(
        (p) => p.variations.reduce((s, v) => s + v.stock, 0) === 0
      )
    }
    if (filters.hasDiscount === true) {
      filtered = filtered.filter(
        (p) => p.promotionalPrice != null && p.promotionalPrice < p.price
      )
    }
    if (filters.search) {
      filtered = filtered.filter((p) => matchesSearch(p, filters.search!))
    }
    if (filters.batchId) {
      filtered = filtered.filter((p) => p.importBatchId === filters.batchId)
    }
    if (filters.mediaStatus && filters.mediaStatus !== 'all') {
      filtered = filtered.filter((p) => matchesMediaStatus(p.images, filters.mediaStatus!))
    }

    // sort
    const by = sort.by ?? 'createdAt'
    const asc = sort.dir === 'asc'
    filtered = [...filtered].sort((a, b) => {
      let cmp = 0
      if (by === 'name') {
        cmp = a.name.localeCompare(b.name, 'pt-BR')
      } else if (by === 'price') {
        cmp = a.price - b.price
      } else {
        // createdAt: use numeric id as proxy (higher id = newer)
        cmp = parseInt(a.id, 10) - parseInt(b.id, 10)
      }
      return asc ? cmp : -cmp
    })

    const total = filtered.length
    const totalPages = Math.max(1, Math.ceil(total / pageSize))
    const offset = (page - 1) * pageSize
    const products = filtered.slice(offset, offset + pageSize)

    return { products, total, page, pageSize, totalPages, counts }
  },

  async bulkSetStatus(ids: string[], status: ProductStatus): Promise<void> {
    const products = loadCatalogFromDisk()
    const idSet = new Set(ids)
    persistCatalog(
      products.map((p) => (idSet.has(p.id) ? { ...p, status } : p))
    )
  },

  async bulkSetCategory(ids: string[], category: string): Promise<void> {
    const products = loadCatalogFromDisk()
    const idSet = new Set(ids)
    persistCatalog(
      products.map((p) => (idSet.has(p.id) ? { ...p, category } : p))
    )
  },

  async deleteMany(ids: string[]): Promise<void> {
    const products = loadCatalogFromDisk()
    const idSet = new Set(ids)
    persistCatalog(products.filter((p) => !idSet.has(p.id)))
  },

  async setProductImages(id: string, images: string[]): Promise<Product> {
    const products = loadCatalogFromDisk()
    const index = products.findIndex((p) => p.id === id)
    if (index === -1) throw new Error('Produto não encontrado')
    const updated = {
      ...products[index],
      images: images.filter(Boolean).slice(0, 5),
    }
    const next = [...products]
    next[index] = updated
    persistCatalog(next)
    return updated
  },

  async bulkSetProductImages(items: { id: string; images: string[] }[]): Promise<void> {
    for (const item of items) {
      await jsonProductRepository.setProductImages(item.id, item.images)
    }
  },

  async queryStorefront(q: StorefrontProductQuery): Promise<ProductQueryResult> {
    const all = loadCatalogFromDisk().filter(isStorefrontProduct)
    const { category, pagination = {} } = q
    const page = Math.max(1, pagination.page ?? 1)
    const pageSize = pagination.pageSize ?? 24

    let filtered = all
    if (category) {
      const cat = category.toLowerCase()
      filtered = filtered.filter((p) => p.category.toLowerCase().includes(cat))
    }

    const total = filtered.length
    const totalPages = Math.max(1, Math.ceil(total / pageSize))
    const offset = (page - 1) * pageSize
    const products = filtered.slice(offset, offset + pageSize)
    const counts: ProductStatusCounts = {
      all: total,
      active: total,
      draft: 0,
      unavailable: 0,
      noStock: 0,
    }
    return { products, total, page, pageSize, totalPages, counts }
  },

  async getStorefrontFeatured(limit: number): Promise<Product[]> {
    return loadCatalogFromDisk()
      .filter(isStorefrontProduct)
      .filter((p) => p.variations.some((v) => v.stock > 0))
      .slice(0, limit)
  },
}

function matchesMediaStatus(images: string[], filter: MediaFilter): boolean {
  if (filter === 'all') return true
  const status = classifyProductImagesInitial(images)
  if (filter === 'broken') return status === 'external'
  return status === filter
}

function isStorefrontProduct(product: Product): boolean {
  return product.status === 'active' && !isStorefrontTestResidue(product)
}

function matchesSearch(p: Product, search: string): boolean {
  const q = search.toLowerCase()
  if (p.name.toLowerCase().includes(q)) return true
  return p.variations.some((v) => v.sku.toLowerCase().includes(q))
}
