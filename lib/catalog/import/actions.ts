'use server'

import { revalidatePath } from 'next/cache'
import { requireAdmin } from '@/lib/auth/require-admin'
import { getCategoryRepository } from '@/lib/catalog/get-category-repository'
import { getProductRepository } from '@/lib/catalog/get-product-repository'
import { applyImport } from './apply-import'
import { checkProductImageUrls } from './check-image-urls'
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

export async function parseImportCsvAction(
  formData: FormData
): Promise<{ ok: true; preview: ImportPreview } | { ok: false; error: string }> {
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

  const text = await file.text()
  const repo = getProductRepository()
  const categoryRepo = getCategoryRepository()
  const [catalog, categories] = await Promise.all([
    repo.getAll(),
    categoryRepo.getAll(),
  ])
  const preview = buildImportPreview(text, file.name, catalog, categories)

  for (const product of preview.products) {
    const imageIssues = await checkProductImageUrls(product.images, product.slug)
    preview.issues.push(...imageIssues)
  }

  preview.stats.warningCount = preview.issues.filter((i) => i.severity === 'warning').length

  return { ok: true, preview }
}

export async function confirmImportAction(
  products: ParsedProduct[]
): Promise<{ ok: true; result: ImportApplyResult } | { ok: false; error: string }> {
  const auth = await requireAdmin()
  if (!auth.ok) {
    return { ok: false, error: auth.error }
  }

  if (!products.length) {
    return { ok: false, error: 'Nenhum produto válido para importar.' }
  }

  const repo = getProductRepository()
  const categoryRepo = getCategoryRepository()
  const [catalog, categories] = await Promise.all([
    repo.getAll(),
    categoryRepo.getAll(),
  ])

  const normalizedProducts = structuredClone(products)
  const categoryIssues = validateImportProductCategories(normalizedProducts, categories)
  const catalogIssues = validateCatalogSkus(normalizedProducts, catalog)
  const blocking = [...categoryIssues, ...catalogIssues].filter((i) => i.severity === 'error')
  if (blocking.length > 0) {
    return { ok: false, error: blocking[0].message }
  }

  try {
    const started = performance.now()
    const result = await applyImport(normalizedProducts, repo)
    revalidateCatalog()
    return {
      ok: true,
      result: {
        ...result,
        durationMs: result.durationMs || Math.round(performance.now() - started),
      },
    }
  } catch {
    return { ok: false, error: 'Falha ao salvar catálogo. Nenhuma alteração foi aplicada.' }
  }
}
