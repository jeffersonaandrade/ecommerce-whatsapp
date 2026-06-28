import 'server-only'

import { Product, ProductStatus } from '@/types/product'
import { createAdminClient } from '@/lib/supabase/admin'
import { ProductInput, ProductRepository } from './product-repository'
import type {
  ProductQuery,
  ProductQueryResult,
  ProductStatusCounts,
} from '@/lib/query'
import {
  assignVariationIds,
  deriveShortDescription,
  slugifyUnique,
} from './product-utils'
import {
  productToRow,
  rowsToProduct,
  variationsToRows,
  type ProductRow,
  type ProductVariationRow,
} from './supabase-mappers'

type ProductRowWithVariations = ProductRow & { product_variations: ProductVariationRow[] }

async function fetchProducts(status?: ProductStatus): Promise<Product[]> {
  const supabase = createAdminClient()
  const pageSize = 500
  const products: Product[] = []
  let from = 0

  while (true) {
    let qb = supabase
      .from('products')
      .select('*, product_variations(*)')
      .order('id')
      .range(from, from + pageSize - 1)

    if (status) {
      qb = qb.eq('status', status)
    }

    const { data, error } = await qb

    if (error) throw new Error(`products read failed: ${error.message}`)
    if (!data?.length) break

    products.push(
      ...(data as ProductRowWithVariations[]).map((row) =>
        rowsToProduct(row, row.product_variations ?? [])
      )
    )

    if (data.length < pageSize) break
    from += pageSize
  }

  return products
}

async function fetchProductById(id: string): Promise<Product | undefined> {
  const supabase = createAdminClient()
  const { data, error } = await supabase
    .from('products')
    .select('*, product_variations(*)')
    .eq('id', id)
    .maybeSingle()

  if (error) throw new Error(`product read failed: ${error.message}`)
  if (!data) return undefined

  const row = data as ProductRowWithVariations
  return rowsToProduct(row, row.product_variations ?? [])
}

async function fetchProductBySlug(slug: string): Promise<Product | undefined> {
  const supabase = createAdminClient()
  const { data, error } = await supabase
    .from('products')
    .select('*, product_variations(*)')
    .eq('slug', slug)
    .maybeSingle()

  if (error) throw new Error(`product read failed: ${error.message}`)
  if (!data) return undefined

  const row = data as ProductRowWithVariations
  return rowsToProduct(row, row.product_variations ?? [])
}

async function fetchAllProducts(): Promise<Product[]> {
  return fetchProducts()
}

function productTotalStock(product: Product): number {
  return product.variations.reduce((sum, variation) => sum + variation.stock, 0)
}

function filterProductsByStock(products: Product[], hasStock: boolean): Product[] {
  return products.filter((product) =>
    hasStock ? productTotalStock(product) > 0 : productTotalStock(product) === 0
  )
}

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

async function persistProduct(product: Product): Promise<void> {
  const supabase = createAdminClient()
  const { error: productError } = await supabase
    .from('products')
    .upsert(productToRow(product), { onConflict: 'id' })

  if (productError) throw new Error(`product upsert failed: ${productError.message}`)

  await supabase.from('product_variations').delete().eq('product_id', product.id)

  const variationRows = variationsToRows(product.id, product)
  if (variationRows.length) {
    const { error: variationError } = await supabase
      .from('product_variations')
      .insert(variationRows)

    if (variationError) {
      throw new Error(`product_variations insert failed: ${variationError.message}`)
    }
  }
}

export const supabaseProductRepository: ProductRepository = {
  async getAll(): Promise<Product[]> {
    return fetchAllProducts()
  },

  async getActive(): Promise<Product[]> {
    return fetchProducts('active')
  },

  async getById(id: string): Promise<Product | undefined> {
    return fetchProductById(id)
  },

  async getBySlug(slug: string): Promise<Product | undefined> {
    return fetchProductBySlug(slug)
  },

  async create(input: ProductInput): Promise<Product> {
    const existing = await fetchAllProducts()
    const product = buildProduct(input, existing)
    await persistProduct(product)
    return product
  },

  async update(id: string, input: ProductInput): Promise<Product> {
    const products = await fetchAllProducts()
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
    await persistProduct(updated)
    return updated
  },

  async delete(id: string): Promise<void> {
    const supabase = createAdminClient()
    const { error } = await supabase.from('products').delete().eq('id', id)
    if (error) throw new Error(`product delete failed: ${error.message}`)
  },

  async saveAll(products: Product[]): Promise<void> {
    const supabase = createAdminClient()
    const current = await fetchAllProducts()
    const currentIds = current.map((p) => p.id)

    if (currentIds.length) {
      await supabase.from('product_variations').delete().in('product_id', currentIds)
      await supabase.from('products').delete().in('id', currentIds)
    }

    for (const product of products) {
      await persistProduct(product)
    }
  },

  async query(q: ProductQuery): Promise<ProductQueryResult> {
    const supabase = createAdminClient()
    const { filters = {}, sort = {}, pagination = {} } = q
    const page = Math.max(1, pagination.page ?? 1)
    const pageSize = pagination.pageSize ?? 25
    const offset = (page - 1) * pageSize

    const orderCol =
      sort.by === 'name'
        ? 'name'
        : sort.by === 'price'
          ? 'price'
          : 'id'
    const ascending = sort.dir === 'asc'

    const useStockFilter = filters.hasStock !== undefined

    let qb = supabase
      .from('products')
      .select('*, product_variations(*)', { count: 'exact' })

    if (filters.status?.length) qb = qb.in('status', filters.status)
    if (filters.category) qb = qb.ilike('category', filters.category)
    if (filters.hasDiscount) qb = qb.not('promotional_price', 'is', null)
    if (filters.batchId) qb = qb.eq('import_batch_id', filters.batchId)
    if (filters.search) {
      // name search; SKU search via second query below
      qb = qb.ilike('name', `%${filters.search}%`)
    }

    qb = qb.order(orderCol, { ascending })
    if (!useStockFilter) {
      qb = qb.range(offset, offset + pageSize - 1)
    }

    const { data, error, count } = await qb

    if (error) throw new Error(`products query failed: ${error.message}`)

    let products = ((data ?? []) as (ProductRow & { product_variations: ProductVariationRow[] })[]).map(
      (row) => rowsToProduct(row, row.product_variations ?? [])
    )

    // SKU search: find additional products by SKU and merge
    if (filters.search) {
      const { data: varRows } = await supabase
        .from('product_variations')
        .select('product_id')
        .ilike('sku', `%${filters.search}%`)

      const skuProductIds = new Set((varRows ?? []).map((r: { product_id: string }) => r.product_id))
      const existingIds = new Set(products.map((p) => p.id))
      const missing = [...skuProductIds].filter((id) => !existingIds.has(id))
      if (missing.length) {
        const { data: extra } = await supabase
          .from('products')
          .select('*, product_variations(*)')
          .in('id', missing)
        const extraProducts = ((extra ?? []) as (ProductRow & { product_variations: ProductVariationRow[] })[]).map(
          (row) => rowsToProduct(row, row.product_variations ?? [])
        )
        products = [...products, ...extraProducts]
      }
    }

    let total: number
    if (useStockFilter) {
      products = filterProductsByStock(products, filters.hasStock!)
      total = products.length
      products = products.slice(offset, offset + pageSize)
    } else {
      total = count ?? products.length
    }

    // counts: one GROUP BY query ignoring status filter
    const countsResult = await supabase.rpc('get_product_status_counts').maybeSingle()

    let counts: ProductStatusCounts
    if (countsResult.error || !countsResult.data) {
      // fallback: derive from full fetch (only if RPC not available)
      const all = await fetchAllProducts()
      counts = all.reduce(
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
    } else {
      counts = countsResult.data as ProductStatusCounts
    }

    const totalPages = Math.max(1, Math.ceil(total / pageSize))

    return { products, total, page, pageSize, totalPages, counts }
  },

  async bulkSetStatus(ids: string[], status: ProductStatus): Promise<void> {
    if (!ids.length) return
    const supabase = createAdminClient()
    const { error } = await supabase
      .from('products')
      .update({ status })
      .in('id', ids)
    if (error) throw new Error(`bulkSetStatus failed: ${error.message}`)
  },

  async bulkSetCategory(ids: string[], category: string): Promise<void> {
    if (!ids.length) return
    const supabase = createAdminClient()
    const { error } = await supabase
      .from('products')
      .update({ category })
      .in('id', ids)
    if (error) throw new Error(`bulkSetCategory failed: ${error.message}`)
  },

  async deleteMany(ids: string[]): Promise<void> {
    if (!ids.length) return
    const supabase = createAdminClient()
    await supabase.from('product_variations').delete().in('product_id', ids)
    const { error } = await supabase.from('products').delete().in('id', ids)
    if (error) throw new Error(`deleteMany failed: ${error.message}`)
  },

  async setProductImages(id: string, images: string[]): Promise<Product> {
    const normalized = images.filter(Boolean).slice(0, 5)
    const supabase = createAdminClient()
    const { error } = await supabase.from('products').update({ images: normalized }).eq('id', id)
    if (error) throw new Error(`setProductImages failed: ${error.message}`)

    const product = await supabaseProductRepository.getById(id)
    if (!product) throw new Error('Produto não encontrado')
    return product
  },

  async bulkSetProductImages(items: { id: string; images: string[] }[]): Promise<void> {
    for (const item of items) {
      await supabaseProductRepository.setProductImages(item.id, item.images)
    }
  },
}
