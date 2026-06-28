import type { ParsedProduct } from './types'
import type { Product, ProductStatus } from '@/types/product'

/**
 * Produtos novos via CSV sempre entram como rascunho.
 * Ativação na vitrine é manual, após revisar/migrar imagens na Central de Mídia.
 * Reimportação preserva o status atual; CSV só pode rebaixar (draft/unavailable).
 */
export function resolveImportStatus(
  parsed: Pick<ParsedProduct, 'statusFromCsv'>,
  existing: Product | undefined,
  _policy: 'active' | 'draft'
): ProductStatus {
  if (!existing) return 'draft'

  if (parsed.statusFromCsv === 'unavailable') return 'unavailable'
  if (parsed.statusFromCsv === 'draft') return 'draft'

  return existing.status
}

export function resolveImportStatusForPreview(
  parsed: Pick<ParsedProduct, 'statusFromCsv'>,
  existingStatus: ProductStatus | undefined,
  _policy: 'active' | 'draft'
): ProductStatus {
  if (!existingStatus) return 'draft'

  if (parsed.statusFromCsv === 'unavailable') return 'unavailable'
  if (parsed.statusFromCsv === 'draft') return 'draft'

  return existingStatus
}
