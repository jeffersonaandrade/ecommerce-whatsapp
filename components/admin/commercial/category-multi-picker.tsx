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

const PICKER_FIELDSET_CLASS =
  'w-full max-w-full min-w-0 space-y-3 overflow-hidden rounded-lg border border-hairline p-4'

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
    <fieldset
      data-testid="category-multi-picker"
      className={PICKER_FIELDSET_CLASS}
    >
      <legend className="px-1 text-sm font-medium text-ink">Categorias elegíveis</legend>
      <p className="text-xs text-mute">Vazio = todas as categorias.</p>

      {selectedCategories.length > 0 && (
        <ul className="flex w-full max-w-full flex-wrap gap-2">
          {selectedCategories.map((category) => (
            <li key={category.id} className="max-w-full min-w-0">
              <span className="flex max-w-full min-w-0 items-center gap-1 rounded-full border border-hairline bg-soft-cloud px-3 py-1 text-xs text-ink">
                <span className="min-w-0 truncate">
                  {formatCategoryOptionLabel(category)}
                </span>
                <button
                  type="button"
                  onClick={() => removeCategory(category.id)}
                  className="shrink-0 rounded-full px-1 text-mute hover:text-ink"
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
        className="w-full max-w-full min-w-0 rounded-lg border border-hairline px-3 py-2 text-sm"
      />

      <div className="max-h-48 w-full max-w-full space-y-1 overflow-x-hidden overflow-y-auto">
        {filteredOptions.length === 0 ? (
          <p className="text-xs text-mute">Nenhuma categoria encontrada.</p>
        ) : (
          filteredOptions.map((category) => (
            <label
              key={category.id}
              className="flex min-w-0 cursor-pointer items-start gap-2 rounded-md px-1 py-1 text-sm text-ink hover:bg-soft-cloud"
            >
              <input
                type="checkbox"
                className="mt-0.5 shrink-0"
                checked={value.includes(category.id)}
                onChange={() => toggleCategory(category.id)}
              />
              <span className="min-w-0 truncate">{formatCategoryOptionLabel(category)}</span>
            </label>
          ))
        )}
      </div>
    </fieldset>
  )
}
