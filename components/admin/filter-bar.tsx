'use client'

import { useRouter, useSearchParams, usePathname } from 'next/navigation'
import type { Category } from '@/types/category'

type FilterBarProps = {
  categories?: Category[]
  showSort?: boolean
}

export function FilterBar({ categories, showSort = true }: FilterBarProps) {
  const router = useRouter()
  const pathname = usePathname()
  const searchParams = useSearchParams()

  function updateParam(key: string, value: string) {
    const params = new URLSearchParams(searchParams.toString())
    if (value) {
      params.set(key, value)
    } else {
      params.delete(key)
    }
    params.delete('page')
    router.push(`${pathname}?${params.toString()}`)
  }

  return (
    <div className="flex flex-wrap items-center gap-2">
      {categories && categories.length > 0 && (
        <select
          defaultValue={searchParams.get('category') ?? ''}
          onChange={(e) => updateParam('category', e.target.value)}
          className="rounded-lg border border-hairline px-3 py-2 text-sm text-ink"
          aria-label="Filtrar por categoria"
        >
          <option value="">Todas as categorias</option>
          {categories.map((c) => (
            <option key={c.id} value={c.slug}>
              {c.name}
            </option>
          ))}
        </select>
      )}

      {showSort && (
        <>
          <select
            defaultValue={searchParams.get('sort') ?? 'createdAt'}
            onChange={(e) => updateParam('sort', e.target.value)}
            className="rounded-lg border border-hairline px-3 py-2 text-sm text-ink"
            aria-label="Ordenar por"
          >
            <option value="createdAt">Mais recentes</option>
            <option value="name">Nome</option>
            <option value="price">Preço</option>
          </select>

          <select
            defaultValue={searchParams.get('dir') ?? 'desc'}
            onChange={(e) => updateParam('dir', e.target.value)}
            className="rounded-lg border border-hairline px-3 py-2 text-sm text-ink"
            aria-label="Direção"
          >
            <option value="desc">↓ Decrescente</option>
            <option value="asc">↑ Crescente</option>
          </select>
        </>
      )}
    </div>
  )
}
