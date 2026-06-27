export const DEFAULT_IMAGE_MAX_BYTES = 5 * 1024 * 1024
export const LOGO_IMAGE_MAX_BYTES = 2 * 1024 * 1024

export const ALLOWED_IMAGE_MIME_TYPES = [
  'image/png',
  'image/jpeg',
  'image/webp',
] as const

export type AllowedImageMime = (typeof ALLOWED_IMAGE_MIME_TYPES)[number]

export type ValidateImageFileOptions = {
  maxBytes?: number
  emptyMessage?: string
  sizeMessage?: string
  formatMessage?: string
  /** Accept valid extension when MIME is missing (browser quirk). Default true. */
  allowExtensionFallback?: boolean
}

const DEFAULT_SIZE_MESSAGE = 'Imagem deve ter no máximo 5 MB.'
const DEFAULT_FORMAT_MESSAGE = 'Formato aceito: PNG, JPG ou WebP.'
const DEFAULT_EMPTY_MESSAGE = 'Selecione uma imagem válida.'

export function isAllowedImageMime(mime: string): mime is AllowedImageMime {
  return (ALLOWED_IMAGE_MIME_TYPES as readonly string[]).includes(mime)
}

export function isAllowedImageExtension(filename: string): boolean {
  const ext = filename.split('.').pop()?.toLowerCase()
  return ext === 'png' || ext === 'jpg' || ext === 'jpeg' || ext === 'webp'
}

export function mimeToImageExt(mime: string): string {
  if (mime === 'image/png') return 'png'
  if (mime === 'image/jpeg') return 'jpg'
  if (mime === 'image/webp') return 'webp'
  return 'jpg'
}

export function validateImageFile(
  file: File,
  options: ValidateImageFileOptions = {}
): string | null {
  const {
    maxBytes = DEFAULT_IMAGE_MAX_BYTES,
    emptyMessage = DEFAULT_EMPTY_MESSAGE,
    sizeMessage = DEFAULT_SIZE_MESSAGE,
    formatMessage = DEFAULT_FORMAT_MESSAGE,
    allowExtensionFallback = true,
  } = options

  if (!(file instanceof File) || file.size === 0) {
    return emptyMessage
  }

  if (file.size > maxBytes) {
    return sizeMessage
  }

  const mimeOk = isAllowedImageMime(file.type)
  const extOk = allowExtensionFallback && isAllowedImageExtension(file.name)

  if (!mimeOk && !extOk) {
    return formatMessage
  }

  return null
}
