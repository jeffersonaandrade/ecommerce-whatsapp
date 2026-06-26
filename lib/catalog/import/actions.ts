'use server'

import { revalidatePath } from 'next/cache'
import { requireAdmin } from '@/lib/auth/require-admin'
import { getCategoryRepository } from '@/lib/catalog/get-category-repository'
import { getProductRepository } from '@/lib/catalog/get-product-repository'
import { getStoreSettings } from '@/lib/store/settings-repository'
import { applyImport } from './apply-import'
import {
  countUniqueImageUrls,
  formatImportSizeLimit,
  IMPORT_CSV_MAX_BYTES,
  IMPORT_MAX_PRODUCTS,
} from './parse-limits'
import {
  buildImportPreview,
  validateCatalogSkus,
  validateImportProductCategories,
} from './validate-import'
import { ImportApplyResult, ImportPreview, ParsedProduct } from './types'

function revalidateCatalog() {
  revalidatePath('/')
  revalidatePath('/products')
  revalidatePath('/admin')
  revalidatePath('/admin/products')
  revalidatePath('/admin/categories')
  revalidatePath('/admin/import')
}

function logImportParse(metrics: {
  durationMs: number
  productCount: number
  imageUrlCount: number
  fileSizeBytes: number
}) {
  console.info('[import:parse]', {
    durationMs: metrics.durationMs,
    productCount: metrics.productCount,
    imageUrlCount: metrics.imageUrlCount,
    fileSizeKb: Math.round(metrics.fileSizeBytes / 1024),
  })
}

export async function parseImportCsvAction(
  formData: FormData
): Promise<{ ok: true; preview: ImportPreview } | { ok: false; error: string }> {
  const started = performance.now()

  try {
    const auth = await requireAdmin()
    if (!auth.ok) {
      return { ok: false, error: auth.error }
    }

    const file = formData.get('file')
    if (!(file instanceof File) || file.size === 0) {
      return { ok: false, error: 'Selecione um arquivo CSV válido.' }
    }

    if (!file.name.toLowerCase().endsWith('.csv')) {
      return { ok: false, error: 'O arquivo deve ter extensão .csv' }
    }

    if (file.size > IMPORT_CSV_MAX_BYTES) {
      return {
        ok: false,
        error: `O CSV excede o limite de ${formatImportSizeLimit(IMPORT_CSV_MAX_BYTES)}. Divida o arquivo ou remova linhas desnecessárias.`,
      }
    }

    const text = await file.text()
    const repo = getProductRepository()
    const categoryRepo = getCategoryRepository()
    const [catalog, categories] = await Promise.all([
      repo.getAll(),
      categoryRepo.getAll(),
    ])
    const preview = buildImportPreview(text, file.name, catalog, categories)

    if (preview.products.length > IMPORT_MAX_PRODUCTS) {
      return {
        ok: false,
        error: `O CSV contém ${preview.products.length} produtos. O máximo permitido é ${IMPORT_MAX_PRODUCTS}.`,
      }
    }

    const imageUrlCount = countUniqueImageUrls(preview.products)
    logImportParse({
      durationMs: Math.round(performance.now() - started),
      productCount: preview.products.length,
      imageUrlCount,
      fileSizeBytes: file.size,
    })

    return { ok: true, preview }
  } catch {
    console.error('[import:parse] unexpected failure')
    return {
      ok: false,
      error: 'Não foi possível analisar o CSV. Verifique o formato e tente novamente.',
    }
  }
}

export async function confirmImportAction(
  products: ParsedProduct[]
): Promise<{ ok: true; result: ImportApplyResult; batchId: string } | { ok: false; error: string }> {
  try {
    const auth = await requireAdmin()
    if (!auth.ok) {
      return { ok: false, error: auth.error }
    }

    if (!products.length) {
      return { ok: false, error: 'Nenhum produto válido para importar.' }
    }

    if (products.length > IMPORT_MAX_PRODUCTS) {
      return {
        ok: false,
        error: `A importação excede o limite de ${IMPORT_MAX_PRODUCTS} produtos por lote.`,
      }
    }

    const repo = getProductRepository()
    const categoryRepo = getCategoryRepository()
    const [catalog, categories, settings] = await Promise.all([
      repo.getAll(),
      categoryRepo.getAll(),
      getStoreSettings(),
    ])

    const normalizedProducts = structuredClone(products)
    const categoryIssues = validateImportProductCategories(normalizedProducts, categories)
    const catalogIssues = validateCatalogSkus(normalizedProducts, catalog)
    const blocking = [...categoryIssues, ...catalogIssues].filter((i) => i.severity === 'error')
    if (blocking.length > 0) {
      return { ok: false, error: blocking[0].message }
    }

    const batchId = crypto.randomUUID()
    const policy = settings.importStatusPolicy ?? 'draft'
    const existingBySlug = new Map(catalog.map((p) => [p.slug, p]))

    const started = performance.now()
    const result = await applyImport(normalizedProducts, repo, { policy, batchId, existingBySlug })
    revalidateCatalog()

    console.info('[import:confirm]', {
      durationMs: Math.round(performance.now() - started),
      productCount: products.length,
      created: result.created,
      updated: result.updated,
      skipped: result.skipped,
    })

    return {
      ok: true,
      batchId,
      result: {
        ...result,
        durationMs: result.durationMs || Math.round(performance.now() - started),
      },
    }
  } catch {
    console.error('[import:confirm] unexpected failure')
    return { ok: false, error: 'Falha ao salvar catálogo. Nenhuma alteração foi aplicada.' }
  }
}
