'use client'

import Link from 'next/link'
import { useSearchParams, usePathname } from 'next/navigation'
import { MediaFilter } from '@/lib/catalog/media/types'

const FILTERS: { value: MediaFilter; label: string }[] = [
  { value: 'all', label: 'Todos' },
  { value: 'empty', label: 'Sem imagem' },
  { value: 'external', label: 'URLs externas' },
  { value: 'broken', label: 'Quebradas' },
  { value: 'storage', label: 'No Supabase' },
]

type MediaFiltersProps = {
  counts: Record<string, number>
  searchDefault?: string
}

export function MediaFilters({ counts, searchDefault = '' }: MediaFiltersProps) {
  const searchParams = useSearchParams()
  const pathname = usePathname()
  const current = (searchParams.get('media') as MediaFilter | null) ?? 'all'

  function tabUrl(value: MediaFilter) {
    const params = new URLSearchParams(searchParams.toString())
    if (value === 'all') {
      params.delete('media')
    } else {
      params.set('media', value)
    }
    params.delete('page')
    return `${pathname}?${params.toString()}`
  }

  return (
    <div className="space-y-3">
      <p className="text-xs font-medium uppercase tracking-wide text-mute">Mídia</p>
      <div className="flex flex-wrap gap-2">
        {FILTERS.map((filter) => {
          const count =
            filter.value === 'all'
              ? (counts.all ?? 0)
              : (counts[filter.value] ?? 0)
          const isActive = current === filter.value
          return (
            <Link
              key={filter.value}
              href={tabUrl(filter.value)}
              className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-sm ${
                isActive ? 'bg-ink text-canvas' : 'bg-soft-cloud text-mute hover:text-ink'
              }`}
            >
              {filter.label}
              <span
                className={`rounded-full px-1.5 py-0.5 text-xs font-semibold ${
                  isActive ? 'bg-canvas/20 text-canvas' : 'bg-ink/10 text-ink'
                }`}
              >
                {count}
              </span>
            </Link>
          )
        })}
      </div>
    </div>
  )
}
