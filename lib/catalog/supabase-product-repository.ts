import 'server-only'

import { Product } from '@/types/product'
import { createAdminClient } from '@/lib/supabase/admin'
import { ProductInput, ProductRepository } from './product-repository'
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
}
