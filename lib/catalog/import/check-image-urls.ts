import { ImportIssue } from './types'
import { isAllowedImportImageUrl } from './validate-image-url'
import { IMPORT_MAX_IMAGES_PER_PRODUCT } from './parse-limits'

const IMAGE_EXTENSIONS = /\.(jpe?g|png|webp)(\?.*)?$/i

/** Validação local de URLs — sem requisições de rede (import serverless-safe). */
export function validateProductImageUrlsLocal(
  urls: string[],
  slug: string
): ImportIssue[] {
  const unique = [...new Set(urls.map((u) => u.trim()).filter(Boolean))]
  const issues: ImportIssue[] = []

  if (unique.length > IMPORT_MAX_IMAGES_PER_PRODUCT) {
    issues.push({
      code: 'CSV_E003',
      severity: 'error',
      slug,
      message: `Máximo de ${IMPORT_MAX_IMAGES_PER_PRODUCT} URLs em image_urls (${unique.length} encontradas)`,
    })
    return issues
  }

  for (const url of unique) {
    if (!isAllowedImportImageUrl(url)) {
      issues.push({
        code: 'CSV_E003',
        severity: 'error',
        slug,
        message: `URL inválida (apenas HTTPS público): ${url}`,
      })
      continue
    }
    if (!IMAGE_EXTENSIONS.test(url)) {
      issues.push({
        code: 'CSV_E003',
        severity: 'error',
        slug,
        message: `Extensão de imagem inválida: ${url}`,
      })
    }
  }

  return issues
}
