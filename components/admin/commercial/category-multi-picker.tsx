'use client'

import { useMemo, useState } from 'react'
import type { Category } from '@/types/category'
import {
  buildCategoryTree,
  flattenCategoryTree,
  formatCategoryOptionLabel,
} from '@/lib/catalog/category-tree'

type CategoryMultiPickerProps = {
  categories: Category[]
  value: string[]
  onChange: (ids: string[]) => void
}

export function CategoryMultiPicker({
  categories,
  value,
  onChange,
}: CategoryMultiPickerProps) {
  const [search, setSearch] = useState('')

  const options = useMemo(() => {
    const tree = buildCategoryTree(categories)
    return flattenCategoryTree(tree)
  }, [categories])

  const selectedCategories = useMemo(
    () =>
      value
        .map((id) => categories.find((category) => category.id === id))
        .filter((category): category is Category => Boolean(category)),
    [categories, value]
  )

  const filteredOptions = useMemo(() => {
    const term = search.trim().toLowerCase()
    if (!term) return options
    return options.filter((category) => {
      const label = formatCategoryOptionLabel(category).toLowerCase()
      return label.includes(term) || category.name.toLowerCase().includes(term)
    })
  }, [options, search])

  function toggleCategory(id: string) {
    onChange(value.includes(id) ? value.filter((item) => item !== id) : [...value, id])
  }

  function removeCategory(id: string) {
    onChange(value.filter((item) => item !== id))
  }

  return (
    <fieldset className="space-y-3 rounded-lg border border-hairline p-4">
      <legend className="px-1 text-sm font-medium text-ink">Categorias elegíveis</legend>
      <p className="text-xs text-mute">Vazio = todas as categorias.</p>

      {selectedCategories.length > 0 && (
        <ul className="flex flex-wrap gap-2">
          {selectedCategories.map((category) => (
            <li key={category.id}>
              <span className="inline-flex items-center gap-1 rounded-full border border-hairline bg-soft-cloud px-3 py-1 text-xs text-ink">
                {formatCategoryOptionLabel(category)}
                <button
                  type="button"
                  onClick={() => removeCategory(category.id)}
                  className="rounded-full px-1 text-mute hover:text-ink"
                  aria-label={`Remover ${category.name}`}
                >
                  ×
                </button>
              </span>
            </li>
          ))}
        </ul>
      )}

      <input
        type="search"
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        placeholder="Buscar categoria..."
        className="w-full rounded-lg border border-hairline px-3 py-2 text-sm"
      />

      <div className="max-h-48 space-y-1 overflow-y-auto">
        {filteredOptions.length === 0 ? (
          <p className="text-xs text-mute">Nenhuma categoria encontrada.</p>
        ) : (
          filteredOptions.map((category) => (
            <label
              key={category.id}
              className="flex cursor-pointer items-center gap-2 rounded-md px-1 py-1 text-sm text-ink hover:bg-soft-cloud"
            >
              <input
                type="checkbox"
                checked={value.includes(category.id)}
                onChange={() => toggleCategory(category.id)}
              />
              <span>{formatCategoryOptionLabel(category)}</span>
            </label>
          ))
        )}
      </div>
    </fieldset>
  )
}
