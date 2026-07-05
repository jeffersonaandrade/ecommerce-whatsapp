'use client'

import Link from 'next/link'
import { getButtonClassName } from '@/components/ui/button'

type AdminPaginationProps = {
  page: number
  pageSize: number
  total: number
  totalPages: number
  basePath: string
  currentParams: URLSearchParams
  showPageSizeSelector?: boolean
}

export function AdminPagination({
  page,
  pageSize,
  total,
  totalPages,
  basePath,
  currentParams,
  showPageSizeSelector = true,
}: AdminPaginationProps) {
  if (totalPages <= 1 && total <= 25) return null

  function pageUrl(p: number, size?: number) {
    const params = new URLSearchParams(currentParams)
    params.set('page', String(p))
    if (size) params.set('size', String(size))
    return `${basePath}?${params.toString()}`
  }

  const from = (page - 1) * pageSize + 1
  const to = Math.min(page * pageSize, total)

  return (
    <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
      <p className="text-center text-sm text-mute sm:text-left">
        {from}–{to} de {total} resultado{total !== 1 ? 's' : ''}
      </p>

      <div className="flex flex-wrap items-center justify-center gap-2 sm:justify-end">
        {page > 1 ? (
          <Link
            href={pageUrl(page - 1)}
            className={getButtonClassName('outline', 'sm')}
          >
            ← Anterior
          </Link>
        ) : (
          <span className={`${getButtonClassName('outline', 'sm')} opacity-40 cursor-not-allowed`}>
            ← Anterior
          </span>
        )}

        <span className="text-sm text-mute whitespace-nowrap">
          Página {page} de {totalPages}
        </span>

        {page < totalPages ? (
          <Link
            href={pageUrl(page + 1)}
            className={getButtonClassName('outline', 'sm')}
          >
            Próxima →
          </Link>
        ) : (
          <span className={`${getButtonClassName('outline', 'sm')} opacity-40 cursor-not-allowed`}>
            Próxima →
          </span>
        )}

        {showPageSizeSelector && (
          <select
            defaultValue={pageSize}
            onChange={(e) => {
              window.location.href = pageUrl(1, Number(e.target.value))
            }}
            className="ml-2 rounded-lg border border-hairline px-2 py-1.5 text-sm text-ink"
            aria-label="Itens por página"
          >
            {[25, 50, 100, 200].map((s) => (
              <option key={s} value={s}>
                {s} por página
              </option>
            ))}
          </select>
        )}
      </div>
    </div>
  )
}
