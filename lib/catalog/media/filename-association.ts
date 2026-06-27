import { MediaMapProduct } from './types'
import {
  DEFAULT_IMAGE_MAX_BYTES,
  isAllowedImageMime,
} from '@/lib/media/validate-image-file'

const ASSOCIATION_PATTERN = /^(.+)--(\d{2})\.(jpe?g|png|webp)$/i
const MAX_IMAGE_BYTES = DEFAULT_IMAGE_MAX_BYTES
const MAX_IMAGES_PER_PRODUCT = 5

export type ParsedAssociationFilename = {
  key: string
  order: number
  ext: string
}

export type AssociationMatch = {
  fileName: string
  productId: string
  productSlug: string
  productName: string
  order: number
  file: File
}

export type AssociationError = {
  fileName: string
  code: string
  message: string
}

export type AssociationResult = {
  matches: AssociationMatch[]
  orphans: string[]
  unmatchedProducts: MediaMapProduct[]
  ambiguities: AssociationError[]
  errors: AssociationError[]
}

export function sanitizeFileName(name: string): string {
  return name.replace(/\\/g, '/').split('/').pop()?.trim() ?? ''
}

export function parseAssociationFilename(name: string): ParsedAssociationFilename | null {
  const base = sanitizeFileName(name)
  const match = base.match(ASSOCIATION_PATTERN)
  if (!match) return null

  const order = Number.parseInt(match[2], 10)
  if (order < 1 || order > MAX_IMAGES_PER_PRODUCT) return null

  return {
    key: match[1].trim().toLowerCase(),
    order,
    ext: match[3].toLowerCase(),
  }
}

export function buildExpectedFilename(slug: string, order: number, ext = 'jpg'): string {
  const padded = String(order).padStart(2, '0')
  return `${slug}--${padded}.${ext}`
}

export function validateAssociationFile(file: File): AssociationError | null {
  const parsed = parseAssociationFilename(file.name)
  if (!parsed) {
    return {
      fileName: file.name,
      code: 'INVALID_NAME',
      message: 'Nome deve seguir slug--01.jpg ou sku--01.webp',
    }
  }
  if (file.size > DEFAULT_IMAGE_MAX_BYTES) {
    return {
      fileName: file.name,
      code: 'FILE_TOO_LARGE',
      message: 'Arquivo excede 5 MB',
    }
  }
  if (file.type && !isAllowedImageMime(file.type)) {
    return {
      fileName: file.name,
      code: 'INVALID_MIME',
      message: 'Formato inválido (use JPG, PNG ou WebP)',
    }
  }
  return null
}

function findProductByKey(
  key: string,
  products: MediaMapProduct[]
): { product: MediaMapProduct | null; ambiguous: boolean } {
  const bySku = products.filter((p) => p.sku?.toLowerCase() === key)
  if (bySku.length === 1) return { product: bySku[0], ambiguous: false }
  if (bySku.length > 1) return { product: null, ambiguous: true }

  const bySlug = products.filter((p) => p.slug.toLowerCase() === key)
  if (bySlug.length === 1) return { product: bySlug[0], ambiguous: false }
  if (bySlug.length > 1) return { product: null, ambiguous: true }

  return { product: null, ambiguous: false }
}

export function matchFilesToProducts(
  files: File[],
  products: MediaMapProduct[]
): AssociationResult {
  const matches: AssociationMatch[] = []
  const orphans: string[] = []
  const ambiguities: AssociationError[] = []
  const errors: AssociationError[] = []
  const matchedProductIds = new Set<string>()
  const orderByProduct = new Map<string, Set<number>>()

  for (const file of files) {
    const validationError = validateAssociationFile(file)
    if (validationError) {
      errors.push(validationError)
      continue
    }

    const parsed = parseAssociationFilename(file.name)!
    const { product, ambiguous } = findProductByKey(parsed.key, products)

    if (ambiguous) {
      ambiguities.push({
        fileName: file.name,
        code: 'AMBIGUOUS',
        message: `Mais de um produto corresponde a "${parsed.key}"`,
      })
      continue
    }

    if (!product) {
      orphans.push(file.name)
      continue
    }

    const orders = orderByProduct.get(product.id) ?? new Set<number>()
    if (orders.has(parsed.order)) {
      errors.push({
        fileName: file.name,
        code: 'DUPLICATE_ORDER',
        message: `Ordem ${parsed.order} duplicada para ${product.slug}`,
      })
      continue
    }
    orders.add(parsed.order)
    orderByProduct.set(product.id, orders)

    if (orders.size > MAX_IMAGES_PER_PRODUCT) {
      errors.push({
        fileName: file.name,
        code: 'TOO_MANY',
        message: `Máximo de ${MAX_IMAGES_PER_PRODUCT} imagens por produto`,
      })
      continue
    }

    matchedProductIds.add(product.id)
    matches.push({
      fileName: file.name,
      productId: product.id,
      productSlug: product.slug,
      productName: product.name,
      order: parsed.order,
      file,
    })
  }

  const unmatchedProducts = products.filter(
    (p) => p.images.length === 0 && !matchedProductIds.has(p.id)
  )

  matches.sort((a, b) => {
    if (a.productId !== b.productId) return a.productSlug.localeCompare(b.productSlug)
    return a.order - b.order
  })

  return { matches, orphans, unmatchedProducts, ambiguities, errors }
}

export function buildMediaMapCsvRows(products: MediaMapProduct[]): string {
  const header = 'product_id,name,slug,sku,current_image_count,expected_filename'
  const rows = products.map((p) => {
    const count = p.images.length
    const expected = buildExpectedFilename(p.slug, 1)
    return [p.id, csvEscape(p.name), p.slug, p.sku ?? '', String(count), expected].join(',')
  })
  return [header, ...rows].join('\n')
}

function csvEscape(value: string): string {
  if (/[",\n]/.test(value)) return `"${value.replace(/"/g, '""')}"`
  return value
}

export { MAX_IMAGES_PER_PRODUCT, MAX_IMAGE_BYTES }
