'use server'

import { revalidatePath } from 'next/cache'
import { requireAdmin } from '@/lib/auth/require-admin'
import { getProductRepository } from '@/lib/catalog/get-product-repository'
import { fetchMediaUploadCatalog } from '@/lib/catalog/media/fetch-upload-catalog'
import { buildMediaMapCsvRows } from '@/lib/catalog/media/filename-association'
import { mergeImages, normalizeImageInputs } from '@/lib/catalog/media/validate-image-path'
import { BulkImageItem, ImageUpdateMode } from '@/lib/catalog/media/types'

const BATCH_SIZE = 25

function revalidateMediaPaths(slugs: string[]) {
  revalidatePath('/')
  revalidatePath('/products')
  revalidatePath('/admin/products')
  revalidatePath('/admin/products/media')
  for (const slug of slugs) {
    revalidatePath(`/products/${slug}`)
  }
}

export async function fetchMediaUploadCatalogAction(): Promise<
  { ok: true; products: Awaited<ReturnType<typeof fetchMediaUploadCatalog>> } | { ok: false; error: string }
> {
  const auth = await requireAdmin()
  if (!auth.ok) return { ok: false, error: auth.error }

  try {
    const products = await fetchMediaUploadCatalog()
    return { ok: true, products }
  } catch (err) {
    return {
      ok: false,
      error: err instanceof Error ? err.message : 'Falha ao carregar catálogo',
    }
  }
}

export async function exportMediaMapCsvAction(): Promise<
  { ok: true; csv: string } | { ok: false; error: string }
> {
  const auth = await requireAdmin()
  if (!auth.ok) return { ok: false, error: auth.error }

  const products = await fetchMediaUploadCatalog()
  const rows = products.map((p) => ({
    id: p.id,
    name: p.name,
    slug: p.slug,
    sku: p.sku,
    images: p.images,
  }))

  return { ok: true, csv: buildMediaMapCsvRows(rows) }
}

export async function setProductImagesAction(input: {
  productId: string
  paths: string[]
  mode?: ImageUpdateMode
}): Promise<{ ok: true; images: string[] } | { ok: false; error: string }> {
  try {
    const auth = await requireAdmin()
    if (!auth.ok) return { ok: false, error: auth.error }

    const repo = getProductRepository()
    const product = await repo.getById(input.productId)
    if (!product) return { ok: false, error: 'Produto não encontrado' }

    const { urls } = normalizeImageInputs(input.paths, input.productId)
    const mode = input.mode ?? 'replace'
    const merged = mergeImages(product.images, urls, mode)
    const updated = await repo.setProductImages(input.productId, merged)
    revalidateMediaPaths([updated.slug])

    return { ok: true, images: updated.images }
  } catch (err) {
    return {
      ok: false,
      error: err instanceof Error ? err.message : 'Falha ao salvar imagens',
    }
  }
}

export async function bulkSetProductImagesAction(
  items: BulkImageItem[]
): Promise<
  | { ok: true; updated: number; failures: Array<{ productId: string; error: string }> }
  | { ok: false; error: string }
> {
  const auth = await requireAdmin()
  if (!auth.ok) return { ok: false, error: auth.error }

  if (!items.length) return { ok: false, error: 'Nenhum item para atualizar' }

  const repo = getProductRepository()
  const failures: Array<{ productId: string; error: string }> = []
  const slugs: string[] = []
  let updated = 0

  for (let i = 0; i < items.length; i += BATCH_SIZE) {
    const batch = items.slice(i, i + BATCH_SIZE)
    for (const item of batch) {
      try {
        const product = await repo.getById(item.productId)
        if (!product) throw new Error('Produto não encontrado')

        const { urls } = normalizeImageInputs(item.paths, item.productId)
        const merged = mergeImages(product.images, urls, item.mode ?? 'replace')
        const saved = await repo.setProductImages(item.productId, merged)
        slugs.push(saved.slug)
        updated++
      } catch (err) {
        failures.push({
          productId: item.productId,
          error: err instanceof Error ? err.message : 'Falha ao salvar',
        })
      }
    }
  }

  revalidateMediaPaths(slugs)
  return { ok: true, updated, failures }
}
