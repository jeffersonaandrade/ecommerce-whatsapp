'use client'

import { ProductImage } from '@/components/product/product-image'
import { Badge } from '@/components/ui/badge'
import { getResolvedStatus } from '@/lib/catalog/media/media-query'
import { ImageProbeMap, MediaProductSummary, MediaStatus } from '@/lib/catalog/media/types'
import type { ProductStatus } from '@/types/product'
import Link from 'next/link'

const PRODUCT_STATUS_LABEL: Record<ProductStatus, string> = {
  active: 'Ativo',
  draft: 'Rascunho',
  unavailable: 'Indisponível',
}

function productStatusVariant(status: ProductStatus): 'success' | 'warning' | 'default' {
  if (status === 'active') return 'success'
  if (status === 'draft') return 'warning'
  return 'default'
}

const STATUS_LABEL: Record<MediaStatus, string> = {
  empty: 'Sem imagem',
  external: 'URL externa',
  storage: 'Supabase',
  broken: 'Quebrada',
  checking: 'Verificando…',
}

const STATUS_CLASS: Record<MediaStatus, string> = {
  empty: 'bg-soft-cloud text-mute',
  external: 'bg-amber-50 text-amber-800',
  storage: 'bg-success/10 text-success',
  broken: 'bg-error/10 text-error',
  checking: 'bg-blue-50 text-blue-700',
}

type MediaProductRowProps = {
  item: MediaProductSummary
  probe: ImageProbeMap
  probing: boolean
  onImageResult?: (url: string, ok: boolean) => void
  selected?: boolean
  onToggle?: () => void
}

export function MediaProductRow({
  item,
  probe,
  probing,
  onImageResult,
  selected = false,
  onToggle,
}: MediaProductRowProps) {
  const status = getResolvedStatus(item, probe, probing)
  const thumb = item.images[0]

  return (
    <tr className={selected ? 'bg-soft-cloud' : undefined}>
      <td className="px-4 py-3">
        <input
          type="checkbox"
          checked={selected}
          onChange={onToggle}
          aria-label={`Selecionar ${item.name}`}
          className="h-4 w-4 rounded border-hairline accent-ink"
        />
      </td>
      <td className="px-4 py-3">
        <div className="relative h-14 w-14 overflow-hidden rounded-md bg-soft-cloud">
          {thumb ? (
            <ProductImage
              src={thumb}
              alt={item.name}
              fill
              className="rounded-md"
              onLoadSuccess={() => onImageResult?.(thumb, true)}
              onLoadError={() => onImageResult?.(thumb, false)}
            />
          ) : (
            <div className="flex h-full w-full items-center justify-center text-[10px] text-mute">
              —
            </div>
          )}
        </div>
      </td>
      <td className="px-4 py-3">
        <div className="font-medium text-ink">{item.name}</div>
        <div className="font-mono text-xs text-mute">{item.slug}</div>
      </td>
      <td className="px-4 py-3 text-sm text-mute">{item.sku ?? '—'}</td>
      <td className="px-4 py-3 text-sm text-ink">{item.images.length}</td>
      <td className="px-4 py-3">
        <Badge variant={productStatusVariant(item.productStatus)}>
          {PRODUCT_STATUS_LABEL[item.productStatus]}
        </Badge>
      </td>
      <td className="px-4 py-3">
        <span
          className={`rounded-full px-2 py-0.5 text-xs font-medium ${STATUS_CLASS[status]}`}
        >
          {STATUS_LABEL[status]}
        </span>
      </td>
      <td className="px-4 py-3 text-right">
        <Link
          href={`/admin/products/${item.id}/edit`}
          className="text-sm font-medium text-ink underline"
        >
          Editar
        </Link>
      </td>
    </tr>
  )
}
