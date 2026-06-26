export const IMPORT_CSV_MAX_BYTES = 2 * 1024 * 1024
export const IMPORT_MAX_PRODUCTS = 500
export const IMPORT_MAX_IMAGES_PER_PRODUCT = 5

export function formatImportSizeLimit(bytes: number): string {
  return `${Math.round(bytes / (1024 * 1024))} MB`
}

export function countUniqueImageUrls(products: Array<{ images: string[] }>): number {
  const seen = new Set<string>()
  for (const product of products) {
    for (const url of product.images) {
      const trimmed = url.trim()
      if (trimmed) seen.add(trimmed)
    }
  }
  return seen.size
}
