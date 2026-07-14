import 'server-only'

import { Product, ProductStatus } from '@/types/product'
import { createAdminClient } from '@/lib/supabase/admin'
import { ProductInput, ProductRepository } from './product-repository'
import type {
  ProductQuery,
  ProductQueryResult,
  ProductStatusCounts,
} from '@/lib/query'
import type { ProductFilters } from '@/lib/query'
import type { StorefrontProductQuery } from '@/lib/query/storefront-query'
import { CHUNK_SIZE, runInChunks } from './supabase-chunk'
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
import { getCategoryRepository } from './get-category-repository'
import { getSubtreeIds } from './category-tree'
import { resolveCategoryParam } from './category-utils'
import { listProductIdsByQuery } from './product-list-by-filters'

const PRODUCT_LIST_SELECT =
  'id, slug, name, short_description, price, promotional_price, category, club, images, status, import_batch_id, personalization_enabled, personalization_price, product_variations(id, sku, stock, size, color)'

function productSelect(fields: ProductQuery['fields']): string {
  return fields === 'list' ? PRODUCT_LIST_SELECT : '*, product_variations(*)'
}

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

type RpcProductRow = ProductRow & {
  product_variations: ProductVariationRow[]
}

function mapRpcProducts(rows: RpcProductRow[]): Product[] {
  return rows.map((row) => rowsToProduct(row, row.product_variations ?? []))
}

async function fetchSlugIndex(): Promise<Pick<Product, 'id' | 'slug'>[]> {
  const supabase = createAdminClient()
  const { data, error } = await supabase.from('products').select('id, slug')
  if (error) throw new Error(`products slug index failed: ${error.message}`)
  return (data ?? []) as Pick<Product, 'id' | 'slug'>[]
}

/** Novo produto: UUID (igual ao import CSV). IDs numéricos sequenciais + upsert
 * sobrescreviam silenciosamente em condição de corrida ou misturando UUID/numérico. */
function newProductId(): string {
  return crypto.randomUUID()
}

async function fetchProductStatusCounts(): Promise<ProductStatusCounts> {
  const supabase = createAdminClient()
  const { data, error } = await supabase.rpc('get_product_status_counts').maybeSingle()
  if (error || !data) {
    throw new Error(`get_product_status_counts failed: ${error?.message ?? 'empty response'}`)
  }
  return data as ProductStatusCounts
}

async function queryViaAdminRpc(q: ProductQuery): Promise<ProductQueryResult> {
  const supabase = createAdminClient()
  const { filters = {}, sort = {}, pagination = {} } = q
  const page = Math.max(1, pagination.page ?? 1)
  const pageSize = pagination.pageSize ?? 25
  const orderCol =
    sort.by === 'name' ? 'name' : sort.by === 'price' ? 'price' : 'id'

  const { data, error } = await supabase.rpc('query_admin_products_page', {
    p_media:
      filters.mediaStatus && filters.mediaStatus !== 'all' ? filters.mediaStatus : null,
    p_status: filters.status?.length ? filters.status : null,
    p_search: filters.search ?? null,
    p_has_stock: filters.hasStock ?? null,
    p_page: page,
    p_page_size: pageSize,
    p_order_col: orderCol,
    p_asc: sort.dir !== 'desc',
  })

  if (error) throw new Error(`query_admin_products_page failed: ${error.message}`)

  const payload = (data ?? { total: 0, products: [] }) as {
    total: number
    products: RpcProductRow[]
  }

  const products = mapRpcProducts(payload.products ?? [])
  const total = payload.total ?? products.length
  const totalPages = Math.max(1, Math.ceil(total / pageSize))
  const counts = await fetchProductStatusCounts()

  return { products, total, page, pageSize, totalPages, counts }
}

async function queryStorefrontViaRpc(
  categoryParam: string,
  page: number,
  pageSize: number,
  fields: StorefrontProductQuery['fields']
): Promise<ProductQueryResult> {
  const supabase = createAdminClient()
  const { data, error } = await supabase.rpc('query_storefront_products_page', {
    p_category_param: categoryParam,
    p_page: page,
    p_page_size: pageSize,
  })

  if (error) throw new Error(`query_storefront_products_page failed: ${error.message}`)

  const payload = (data ?? { total: 0, products: [] }) as {
    total: number
    products: RpcProductRow[]
  }

  let products = mapRpcProducts(payload.products ?? []).filter((p) =>
    p.variations.some((v) => v.stock >= 0)
  )

  if (fields === 'list') {
    products = products.map((product) => ({
      ...product,
      longDescription: product.shortDescription,
    }))
  }

  const total = payload.total ?? products.length
  const totalPages = Math.max(1, Math.ceil(total / pageSize))
  const emptyCounts: ProductStatusCounts = {
    all: total,
    active: total,
    draft: 0,
    unavailable: 0,
    noStock: 0,
  }

  return { products, total, page, pageSize, totalPages, counts: emptyCounts }
}


function buildProduct(input: ProductInput, existing: Pick<Product, 'id' | 'slug'>[], id: string): Product {
  const slug = slugifyUnique(input.slug ?? input.name, existing as Product[])
  const longDescription = input.longDescription.trim()
  return {
    id,
    name: input.name.trim(),
    slug,
    shortDescription:
      input.shortDescription?.trim() || deriveShortDescription(longDescription),
    longDescription,
    price: input.price,
    promotionalPrice: input.promotionalPrice || undefined,
    category: input.category.trim(),
    categoryId: input.categoryId ?? null,
    club: input.club?.trim() || undefined,
    images: input.images.filter(Boolean).slice(0, 5),
    variations: assignVariationIds(input.variations),
    status: input.status,
    importBatchId: input.importBatchId,
    personalizationEnabled: input.personalizationEnabled ?? false,
    personalizationPrice: input.personalizationPrice ?? null,
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

/** Insert-only: falha se o id já existir (nunca sobrescreve produto alheio). */
async function insertNewProduct(product: Product): Promise<void> {
  const supabase = createAdminClient()
  const { error: productError } = await supabase
    .from('products')
    .insert(productToRow(product))

  if (productError) throw new Error(`product insert failed: ${productError.message}`)

  const variationRows = variationsToRows(product.id, product)
  if (variationRows.length) {
    const { error: variationError } = await supabase
      .from('product_variations')
      .insert(variationRows)

    if (variationError) {
      // Compensa o insert do produto para não deixar órfão sem variação.
      await supabase.from('products').delete().eq('id', product.id)
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

  async getByIds(ids: string[], fields: ProductQuery['fields'] = 'list'): Promise<Product[]> {
    const uniqueIds = [...new Set(ids.map((id) => id.trim()).filter(Boolean))]
    if (!uniqueIds.length) return []

    const supabase = createAdminClient()
    const selectClause = productSelect(fields)
    const products: Product[] = []

    await runInChunks(uniqueIds, CHUNK_SIZE, async (chunk) => {
      const { data, error } = await supabase
        .from('products')
        .select(selectClause)
        .in('id', chunk)
        .eq('status', 'active')

      if (error) throw new Error(`products by ids failed: ${error.message}`)

      products.push(
        ...(
          (data ?? []) as unknown as (ProductRow & {
            product_variations: ProductVariationRow[]
          })[]
        ).map((row) => rowsToProduct(row, row.product_variations ?? []))
      )
    })

    return products
  },

  async getByIdsAdmin(ids: string[]): Promise<Product[]> {
    const uniqueIds = [...new Set(ids.map((id) => id.trim()).filter(Boolean))]
    if (!uniqueIds.length) return []

    const supabase = createAdminClient()
    const selectClause = productSelect('full')
    const products: Product[] = []

    await runInChunks(uniqueIds, CHUNK_SIZE, async (chunk) => {
      const { data, error } = await supabase
        .from('products')
        .select(selectClause)
        .in('id', chunk)

      if (error) throw new Error(`getByIdsAdmin failed: ${error.message}`)

      products.push(
        ...(
          (data ?? []) as unknown as (ProductRow & {
            product_variations: ProductVariationRow[]
          })[]
        ).map((row) => rowsToProduct(row, row.product_variations ?? []))
      )
    })

    return products
  },

  async create(input: ProductInput): Promise<Product> {
    const existing = await fetchSlugIndex()
    const product = buildProduct(input, existing, newProductId())
    await insertNewProduct(product)
    return product
  },

  async update(id: string, input: ProductInput): Promise<Product> {
    const current = await fetchProductById(id)
    if (!current) throw new Error('Produto não encontrado')

    const slugIndex = await fetchSlugIndex()
    const slug = slugifyUnique(input.slug ?? input.name, slugIndex as Product[], id)
    const longDescription = input.longDescription.trim()
    const updated: Product = {
      ...current,
      name: input.name.trim(),
      slug,
      shortDescription:
        input.shortDescription?.trim() || deriveShortDescription(longDescription),
      longDescription,
      price: input.price,
      promotionalPrice: input.promotionalPrice || undefined,
      category: input.category.trim(),
      categoryId: input.categoryId ?? current.categoryId ?? null,
      club: input.club?.trim() || undefined,
      images: input.images.filter(Boolean).slice(0, 5),
      variations: assignVariationIds(input.variations, current.variations),
      status: input.status,
      importBatchId: input.importBatchId ?? current.importBatchId,
      personalizationEnabled: input.personalizationEnabled ?? false,
      personalizationPrice: input.personalizationPrice ?? null,
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
    const { data, error } = await supabase.from('products').select('id')
    if (error) throw new Error(`products id list failed: ${error.message}`)
    const currentIds = (data ?? []).map((row) => row.id as string)

    if (currentIds.length) {
      await runInChunks(currentIds, CHUNK_SIZE, async (chunk) => {
        await supabase.from('product_variations').delete().in('product_id', chunk)
        await supabase.from('products').delete().in('id', chunk)
      })
    }

    for (const product of products) {
      await persistProduct(product)
    }
  },

  async query(q: ProductQuery): Promise<ProductQueryResult> {
    const { filters = {}, sort = {}, pagination = {} } = q
    const useAdvancedFilter =
      filters.hasStock !== undefined ||
      (filters.mediaStatus !== undefined && filters.mediaStatus !== 'all')

    if (useAdvancedFilter) {
      return queryViaAdminRpc(q)
    }

    const supabase = createAdminClient()
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

    const useStockFilter = false

    const selectClause = productSelect(q.fields)

    let qb = supabase
      .from('products')
      .select(selectClause, { count: 'exact' })

    if (filters.status?.length) qb = qb.in('status', filters.status)
    if (filters.category) {
      const allCategories = await getCategoryRepository().getAll()
      const match = resolveCategoryParam(filters.category, allCategories)
      if (match) {
        const subtreeIds = [...getSubtreeIds(allCategories, match.id)]
        const subtreeSlugs = allCategories
          .filter((c) => subtreeIds.includes(c.id))
          .map((c) => c.slug)
        const idList = subtreeIds.join(',')
        const slugList = subtreeSlugs.map((s) => `"${s}"`).join(',')
        qb = qb.or(`category_id.in.(${idList}),category.in.(${slugList})`)
      } else {
        qb = qb.ilike('category', `%${filters.category}%`)
      }
    }
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

    let products = (
      (data ?? []) as unknown as (ProductRow & { product_variations: ProductVariationRow[] })[]
    ).map((row) => rowsToProduct(row, row.product_variations ?? []))

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
          .select(selectClause)
          .in('id', missing)
        const extraProducts = (
          (extra ?? []) as unknown as (ProductRow & { product_variations: ProductVariationRow[] })[]
        ).map((row) => rowsToProduct(row, row.product_variations ?? []))
        products = [...products, ...extraProducts]
      }
    }

    let total: number = count ?? products.length

    const counts = await fetchProductStatusCounts()

    const totalPages = Math.max(1, Math.ceil(total / pageSize))

    return { products, total, page, pageSize, totalPages, counts }
  },

  async bulkSetStatus(ids: string[], status: ProductStatus): Promise<void> {
    if (!ids.length) return
    const supabase = createAdminClient()
    await runInChunks(ids, CHUNK_SIZE, async (chunk) => {
      const { error } = await supabase.from('products').update({ status }).in('id', chunk)
      if (error) throw new Error(`bulkSetStatus failed: ${error.message}`)
    })
  },

  async bulkSetCategory(ids: string[], category: string): Promise<void> {
    if (!ids.length) return
    const supabase = createAdminClient()
    await runInChunks(ids, CHUNK_SIZE, async (chunk) => {
      const { error } = await supabase
        .from('products')
        .update({ category, category_id: null })
        .in('id', chunk)
      if (error) throw new Error(`bulkSetCategory failed: ${error.message}`)
    })
  },

  async bulkSetCategoryId(ids: string[], categoryId: string): Promise<void> {
    if (!ids.length) return
    const supabase = createAdminClient()
    const { data: category, error: categoryError } = await supabase
      .from('categories')
      .select('slug')
      .eq('id', categoryId)
      .maybeSingle()
    if (categoryError) throw new Error(`bulkSetCategoryId failed: ${categoryError.message}`)
    if (!category) throw new Error('Categoria não encontrada')

    await runInChunks(ids, CHUNK_SIZE, async (chunk) => {
      const { error } = await supabase
        .from('products')
        .update({ category_id: categoryId, category: category.slug })
        .in('id', chunk)
      if (error) throw new Error(`bulkSetCategoryId failed: ${error.message}`)
    })
  },

  async listIdsByFilters(filters: ProductFilters): Promise<string[]> {
    return listProductIdsByQuery((q) => supabaseProductRepository.query(q), filters)
  },

  async bulkSetCategoryIdByFilters(
    filters: ProductFilters,
    categoryId: string
  ): Promise<number> {
    const ids = await supabaseProductRepository.listIdsByFilters(filters)
    if (!ids.length) return 0
    await supabaseProductRepository.bulkSetCategoryId(ids, categoryId)
    return ids.length
  },

  async bulkSetPersonalization(ids: string[], enabled: boolean): Promise<void> {
    if (!ids.length) return
    const supabase = createAdminClient()
    await runInChunks(ids, CHUNK_SIZE, async (chunk) => {
      const { error } = await supabase
        .from('products')
        .update({ personalization_enabled: enabled })
        .in('id', chunk)
      if (error) throw new Error(`bulkSetPersonalization failed: ${error.message}`)
    })
  },

  async deleteMany(ids: string[]): Promise<void> {
    if (!ids.length) return
    const supabase = createAdminClient()
    await runInChunks(ids, CHUNK_SIZE, async (chunk) => {
      await supabase.from('product_variations').delete().in('product_id', chunk)
      const { error } = await supabase.from('products').delete().in('id', chunk)
      if (error) throw new Error(`deleteMany failed: ${error.message}`)
    })
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

  async findConflictingSkus(skus: string[], excludeProductId?: string): Promise<string[]> {
    const normalized = [...new Set(skus.map((sku) => sku.trim()).filter(Boolean))]
    if (!normalized.length) return []

    const supabase = createAdminClient()
    const { data, error } = await supabase
      .from('product_variations')
      .select('sku, product_id')
      .in('sku', normalized)

    if (error) throw new Error(`findConflictingSkus failed: ${error.message}`)

    return [
      ...new Set(
        (data ?? [])
          .filter((row) => row.product_id !== excludeProductId)
          .map((row) => row.sku as string)
      ),
    ]
  },

  async queryStorefront(q: StorefrontProductQuery): Promise<ProductQueryResult> {
    const { category, q: search, pagination = {}, fields = 'list' } = q
    const page = Math.max(1, pagination.page ?? 1)
    const pageSize = pagination.pageSize ?? 24

    // Use RPC only when filtering by category without text search.
    // The RPC doesn't accept a search param; bypassing avoids a migration this sprint.
    if (category && !search) {
      return queryStorefrontViaRpc(category, page, pageSize, fields)
    }

    const offset = (page - 1) * pageSize
    const selectClause = productSelect(fields)
    const supabase = createAdminClient()

    let qb = supabase
      .from('products')
      .select(selectClause, { count: 'exact' })
      .eq('status', 'active')

    if (category) {
      const allCategories = await getCategoryRepository().getAll()
      const match = resolveCategoryParam(category, allCategories)
      if (match) {
        const subtreeIds = [...getSubtreeIds(allCategories, match.id)]
        const subtreeSlugs = allCategories
          .filter((c) => subtreeIds.includes(c.id))
          .map((c) => c.slug)
        const idList = subtreeIds.join(',')
        const slugList = subtreeSlugs.map((s) => `"${s}"`).join(',')
        qb = qb.or(`category_id.in.(${idList}),category.in.(${slugList})`)
      }
    }

    if (search) {
      const term = search.replace(/[%_\\]/g, (c) => `\\${c}`)
      qb = qb.or(`name.ilike.%${term}%,club.ilike.%${term}%,category.ilike.%${term}%`)
    }

    const { data, error, count } = await qb
      .order('name', { ascending: true })
      .range(offset, offset + pageSize - 1)

    if (error) throw new Error(`storefront query failed: ${error.message}`)

    const products = mapRpcProducts(
      (data ?? []) as unknown as RpcProductRow[]
    ).filter((p) => p.variations.some((v) => v.stock >= 0))

    const total = count ?? products.length
    const totalPages = Math.max(1, Math.ceil(total / pageSize))
    const emptyCounts: ProductStatusCounts = {
      all: total,
      active: total,
      draft: 0,
      unavailable: 0,
      noStock: 0,
    }

    return { products, total, page, pageSize, totalPages, counts: emptyCounts }
  },

  async getStorefrontFeatured(limit: number): Promise<Product[]> {
    const supabase = createAdminClient()
    const { data, error } = await supabase
      .from('products')
      .select(PRODUCT_LIST_SELECT)
      .eq('status', 'active')
      .order('id', { ascending: false })
      .limit(Math.max(limit * 4, limit))

    if (error) throw new Error(`storefront featured failed: ${error.message}`)

    return mapRpcProducts((data ?? []) as unknown as RpcProductRow[])
      .filter((p) => p.variations.some((v) => v.stock > 0))
      .slice(0, limit)
  },
}
