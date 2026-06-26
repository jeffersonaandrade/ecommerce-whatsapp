'use client'

import { MediaFilter } from '@/lib/catalog/media/types'

const FILTERS: { value: MediaFilter; label: string }[] = [
  { value: 'all', label: 'Todos' },
  { value: 'empty', label: 'Sem imagem' },
  { value: 'external', label: 'URLs externas' },
  { value: 'broken', label: 'Quebradas' },
  { value: 'storage', label: 'No Supabase' },
]

type MediaFiltersProps = {
  value: MediaFilter
  onChange: (value: MediaFilter) => void
  search: string
  onSearchChange: (value: string) => void
}

export function MediaFilters({ value, onChange, search, onSearchChange }: MediaFiltersProps) {
  return (
    <div className="space-y-3">
      <input
        type="search"
        value={search}
        onChange={(e) => onSearchChange(e.target.value)}
        placeholder="Buscar por nome, slug ou SKU..."
        className="w-full rounded-lg border border-hairline bg-canvas px-4 py-2 text-sm text-ink placeholder:text-mute focus:border-ink focus:outline-none"
      />
      <div className="flex flex-wrap gap-2">
        {FILTERS.map((filter) => (
          <button
            key={filter.value}
            type="button"
            onClick={() => onChange(filter.value)}
            className={`rounded-full px-3 py-1 text-sm ${
              value === filter.value
                ? 'bg-ink text-canvas'
                : 'bg-soft-cloud text-mute hover:text-ink'
            }`}
          >
            {filter.label}
          </button>
        ))}
      </div>
    </div>
  )
}
