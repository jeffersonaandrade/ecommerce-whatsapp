import { classifyProductImagesInitial, matchesMediaFilter, resolveMediaStatus } from './classify-url'
import { ImageProbeMap, MediaFilter, MediaMapProduct, MediaProductSummary, MediaStatus } from './types'

export function toMediaProductSummary(
  product: MediaMapProduct,
  supabaseUrl?: string
): MediaProductSummary {
  return {
    id: product.id,
    name: product.name,
    slug: product.slug,
    sku: product.sku,
    images: product.images.filter(Boolean),
    initialStatus: classifyProductImagesInitial(product.images, supabaseUrl),
  }
}

export function filterMediaProducts(
  items: MediaProductSummary[],
  filter: MediaFilter,
  probe: ImageProbeMap,
  probingIds: Set<string>,
  search: string
): MediaProductSummary[] {
  const q = search.trim().toLowerCase()

  return items.filter((item) => {
    const status = resolveMediaStatus(
      item.initialStatus,
      item.images,
      probe,
      probingIds.has(item.id)
    )
    if (!matchesMediaFilter(status, filter)) return false
    if (!q) return true

    return (
      item.name.toLowerCase().includes(q) ||
      item.slug.toLowerCase().includes(q) ||
      (item.sku?.toLowerCase().includes(q) ?? false)
    )
  })
}

export function getResolvedStatus(
  item: MediaProductSummary,
  probe: ImageProbeMap,
  probing: boolean
): MediaStatus {
  return resolveMediaStatus(item.initialStatus, item.images, probe, probing)
}
