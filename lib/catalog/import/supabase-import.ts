import 'server-only'

import { createAdminClient } from '@/lib/supabase/admin'
import type { Product } from '@/types/product'
import type { ImportApplyResult, ParsedProduct } from './types'
import { prepareImportBatch } from './prepare-import-batch'

type ApplySupabaseImportOptions = {
  batchId: string
  filename: string
  policy: 'active' | 'draft'
  warningCount: number
  catalog: Product[]
}

type ImportRpcResult = {
  batchId: string
  created: number
  updated: number
  skipped: number
}

function buildRpcPayload(
  prepared: ReturnType<typeof prepareImportBatch>,
  options: ApplySupabaseImportOptions
) {
  return {
    batchId: options.batchId,
    filename: options.filename.slice(0, 255),
    skipped: prepared.skipped,
    warnings: Math.max(0, Math.floor(options.warningCount)),
    products: prepared.items.map(({ product, isUpdate }) => ({
      id: product.id,
      slug: product.slug,
      name: product.name,
      short_description: product.shortDescription,
      long_description: product.longDescription,
      price: product.price,
      promotional_price: product.promotionalPrice ?? null,
      category: product.category,
      club: product.club ?? null,
      images: product.images,
      status: product.status,
      import_batch_id: options.batchId,
      is_update: isUpdate,
    })),
    variations: prepared.items.flatMap(({ product }) =>
      product.variations.map((variation) => ({
        product_slug: product.slug,
        sku: variation.sku,
        size: variation.size ?? null,
        color: variation.color ?? null,
        stock: variation.stock,
      }))
    ),
  }
}

export async function applySupabaseImport(
  parsedProducts: ParsedProduct[],
  options: ApplySupabaseImportOptions
): Promise<ImportApplyResult> {
  const started = performance.now()
  const prepared = prepareImportBatch(parsedProducts, options.catalog, {
    batchId: options.batchId,
    policy: options.policy,
  })
  const payload = buildRpcPayload(prepared, options)
  const supabase = createAdminClient()
  const { data, error } = await supabase.rpc('apply_product_import_batch', {
    payload,
  })

  if (error) {
    throw new Error(`transactional import failed: ${error.message}`)
  }

  const result = data as ImportRpcResult | null
  if (!result) {
    throw new Error('transactional import returned no result')
  }

  return {
    created: result.created,
    updated: result.updated,
    skipped: result.skipped,
    durationMs: Math.round(performance.now() - started),
    batchId: result.batchId ?? options.batchId,
  }
}
