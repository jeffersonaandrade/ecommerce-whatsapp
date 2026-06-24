'use server'

import { revalidatePath } from 'next/cache'
import { getProductRepository } from '@/lib/catalog/json-product-repository'
import { applyImport } from './apply-import'
import {
  buildImportPreview,
  validateCatalogSkus,
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
  const file = formData.get('file')
  if (!(file instanceof File) || file.size === 0) {
    return { ok: false, error: 'Selecione um arquivo CSV válido.' }
  }

  if (!file.name.toLowerCase().endsWith('.csv')) {
    return { ok: false, error: 'O arquivo deve ter extensão .csv' }
  }

  const text = await file.text()
  const repo = getProductRepository()
  const preview = buildImportPreview(text, file.name, repo.getAll())

  return { ok: true, preview }
}

export async function confirmImportAction(
  products: ParsedProduct[]
): Promise<{ ok: true; result: ImportApplyResult } | { ok: false; error: string }> {
  if (!products.length) {
    return { ok: false, error: 'Nenhum produto válido para importar.' }
  }

  const repo = getProductRepository()
  const catalogIssues = validateCatalogSkus(products, repo.getAll())
  const blocking = catalogIssues.filter((i) => i.severity === 'error')
  if (blocking.length > 0) {
    return { ok: false, error: blocking[0].message }
  }

  try {
    const result = applyImport(products, repo)
    revalidateCatalog()
    return { ok: true, result }
  } catch {
    return { ok: false, error: 'Falha ao salvar catálogo. Nenhuma alteração foi aplicada.' }
  }
}
