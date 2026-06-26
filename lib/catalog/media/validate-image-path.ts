import { getProductsPublicUrl } from '@/lib/supabase/env'
import { extractProductsStoragePath, isProductsStorageUrl } from './classify-url'

const MAX_IMAGES = 5
const FORBIDDEN_PROTOCOLS = /^(data:|javascript:)/i

export function isForbiddenImageUrl(url: string): boolean {
  return FORBIDDEN_PROTOCOLS.test(url.trim())
}

export function isValidProductStoragePath(path: string, productId: string): boolean {
  const normalized = path.replace(/^\/+/, '').trim()
  if (!normalized || normalized.includes('..')) return false
  if (!normalized.startsWith(`${productId}/`)) return false
  const fileName = normalized.slice(productId.length + 1)
  if (!fileName || fileName.includes('/')) return false
  return /\.(jpe?g|png|webp)$/i.test(fileName)
}

export function normalizeImageInputs(
  inputs: string[],
  productId: string
): { paths: string[]; urls: string[] } {
  const paths: string[] = []
  const urls: string[] = []

  for (const raw of inputs) {
    const value = raw.trim()
    if (!value || isForbiddenImageUrl(value)) {
      throw new Error('URL ou path de imagem inválido')
    }

    if (isProductsStorageUrl(value)) {
      const path = extractProductsStoragePath(value)
      if (!path || !isValidProductStoragePath(path, productId)) {
        throw new Error('Path de storage inválido para o produto')
      }
      paths.push(path)
      urls.push(getProductsPublicUrl(path))
      continue
    }

    if (isValidProductStoragePath(value, productId)) {
      paths.push(value)
      urls.push(getProductsPublicUrl(value))
      continue
    }

    throw new Error('Somente paths do bucket products são permitidos')
  }

  const uniqueUrls = [...new Set(urls)].slice(0, MAX_IMAGES)
  const uniquePaths = [...new Set(paths)].slice(0, MAX_IMAGES)
  return { paths: uniquePaths, urls: uniqueUrls }
}

export function mergeImages(
  current: string[],
  next: string[],
  mode: 'replace' | 'append'
): string[] {
  const merged = mode === 'replace' ? next : [...current.filter(Boolean), ...next]
  return [...new Set(merged.map((u) => u.trim()).filter(Boolean))].slice(0, MAX_IMAGES)
}

export function buildUniqueStoragePath(productId: string, ext: string): string {
  const safeExt = ext.replace(/^\./, '').toLowerCase().replace('jpeg', 'jpg')
  const stamp = Date.now().toString(36)
  const random = Math.random().toString(36).slice(2, 8)
  return `${productId}/${stamp}-${random}.${safeExt}`
}
