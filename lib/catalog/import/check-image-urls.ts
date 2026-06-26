import { ImportIssue } from './types'
import { isAllowedImportImageUrl } from './validate-image-url'

const HEAD_TIMEOUT_MS = 5000
const MAX_BYTES = 5 * 1024 * 1024

export async function checkImageUrlHead(url: string): Promise<ImportIssue | null> {
  if (!isAllowedImportImageUrl(url)) {
    return {
      code: 'CSV_W008',
      severity: 'warning',
      message: `URL de imagem bloqueada (use HTTPS público): ${url}`,
    }
  }

  try {
    const response = await fetch(url, {
      method: 'HEAD',
      signal: AbortSignal.timeout(HEAD_TIMEOUT_MS),
      redirect: 'follow',
    })

    if (response.status === 200) {
      const length = response.headers.get('content-length')
      if (length && Number(length) > MAX_BYTES) {
        return {
          code: 'CSV_W008',
          severity: 'warning',
          message: `Imagem grande (>5MB): ${url}`,
        }
      }
      const type = response.headers.get('content-type') ?? ''
      if (type && !type.startsWith('image/')) {
        return {
          code: 'CSV_W008',
          severity: 'warning',
          message: `Content-Type não é imagem: ${url}`,
        }
      }
      return null
    }

    if (response.status === 403 || response.status === 405) {
      return {
        code: 'CSV_W008',
        severity: 'warning',
        message: `HEAD ${response.status} — CDN pode bloquear verificação: ${url}`,
      }
    }

    return {
      code: 'CSV_W008',
      severity: 'warning',
      message: `Imagem inacessível (HTTP ${response.status}): ${url}`,
    }
  } catch {
    return {
      code: 'CSV_W008',
      severity: 'warning',
      message: `Timeout ou erro ao verificar imagem: ${url}`,
    }
  }
}

export async function checkProductImageUrls(
  urls: string[],
  slug: string
): Promise<ImportIssue[]> {
  const unique = [...new Set(urls.filter(Boolean))]
  const issues: ImportIssue[] = []

  for (const url of unique) {
    const issue = await checkImageUrlHead(url)
    if (issue) {
      issues.push({ ...issue, slug })
    }
  }

  return issues
}
