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

async function fetchAllProducts(): Promise<Product[]> {
  const supabase = createAdminClient()
  const { data: productRows, error: productsError } = await supabase
    .from('products')
    .select('*')
    .order('id')

  if (productsError) throw new Error(`products read failed: ${productsError.message}`)
  if (!productRows?.length) return []

  const { data: variationRows, error: variationsError } = await supabase
    .from('product_variations')
    .select('*')

  if (variationsError) {
    throw new Error(`product_variations read failed: ${variationsError.message}`)
  }

  const byProduct = new Map<string, ProductVariationRow[]>()
  for (const row of (variationRows ?? []) as ProductVariationRow[]) {
    const list = byProduct.get(row.product_id) ?? []
    list.push(row)
    byProduct.set(row.product_id, list)
  }

  return (productRows as ProductRow[]).map((row) =>
    rowsToProduct(row, byProduct.get(row.id) ?? [])
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

  async getById(id: string): Promise<Product | undefined> {
    return (await fetchAllProducts()).find((p) => p.id === id)
  },

  async getBySlug(slug: string): Promise<Product | undefined> {
    return (await fetchAllProducts()).find((p) => p.slug === slug)
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

    qb = qb
      .order(orderCol, { ascending })
      .range(offset, offset + pageSize - 1)

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

    // hasStock filter (post-fetch, requires variation data)
    if (filters.hasStock === true) {
      products = products.filter(
        (p) => p.variations.reduce((s, v) => s + v.stock, 0) > 0
      )
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

    const total = count ?? products.length
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
}
