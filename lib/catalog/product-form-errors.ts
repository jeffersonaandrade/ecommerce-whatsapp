import { ProductValidationError } from './product-utils'

export const PRODUCT_FIELD_LABELS: Record<string, string> = {
  name: 'Nome',
  slug: 'Slug',
  category: 'Categoria',
  club: 'Clube / Marca',
  price: 'Preço',
  promotionalPrice: 'Preço promocional',
  longDescription: 'Descrição',
  shortDescription: 'Descrição curta',
  images: 'Galeria de imagens',
  variations: 'Variações',
  status: 'Status',
  form: 'Formulário',
}

const MESSAGE_FIELD_HINTS: Array<{ pattern: RegExp; field: string }> = [
  { pattern: /^nome/i, field: 'name' },
  { pattern: /categoria/i, field: 'category' },
  { pattern: /^preço promocional/i, field: 'promotionalPrice' },
  { pattern: /^preço/i, field: 'price' },
  { pattern: /descrição/i, field: 'longDescription' },
  { pattern: /imagem/i, field: 'images' },
  { pattern: /sku/i, field: 'variations' },
  { pattern: /variação/i, field: 'variations' },
  { pattern: /status/i, field: 'status' },
]

export function productFieldLabel(field: string): string {
  return PRODUCT_FIELD_LABELS[field] ?? field
}

export function formatProductValidationError(error: ProductValidationError): string {
  const label = productFieldLabel(error.field)
  if (error.field === 'form' || label === error.field) return error.message
  return `${label}: ${error.message}`
}

export function inferFieldFromMessage(message: string): string {
  const hint = MESSAGE_FIELD_HINTS.find((h) => h.pattern.test(message.trim()))
  return hint?.field ?? 'form'
}

export function normalizeProductErrors(
  errors: ProductValidationError[] | string[]
): ProductValidationError[] {
  if (errors.length === 0) return []
  if (typeof errors[0] === 'string') {
    return (errors as string[]).map((message) => ({
      field: inferFieldFromMessage(message),
      message,
    }))
  }
  return errors as ProductValidationError[]
}

export function errorsToFieldMap(errors: ProductValidationError[]): Record<string, string> {
  const map: Record<string, string> = {}
  for (const error of errors) {
    if (!map[error.field]) map[error.field] = error.message
  }
  return map
}
