'use client'

import { useEffect, useState, useTransition } from 'react'
import type { ProductPickerItem } from '@/lib/admin/product-picker-actions'
import {
  getProductsForPickerByIdsAction,
  searchProductsForPickerAction,
} from '@/lib/admin/product-picker-actions'
import { getButtonClassName } from '@/components/ui/button'

type ProductMultiPickerProps = {
  value: string[]
  onChange: (ids: string[]) => void
}

const STATUS_LABEL: Record<ProductPickerItem['status'], string> = {
  active: 'Ativo',
  draft: 'Rascunho',
  unavailable: 'Indisponível',
}

function formatProductLabel(item: ProductPickerItem): string {
  return item.sku ? `${item.name} · ${item.sku}` : item.name
}

export function ProductMultiPicker({ value, onChange }: ProductMultiPickerProps) {
  const [search, setSearch] = useState('')
  const [results, setResults] = useState<ProductPickerItem[]>([])
  const [selectedItems, setSelectedItems] = useState<ProductPickerItem[]>([])
  const [searchError, setSearchError] = useState<string | null>(null)
  const [isSearching, startSearch] = useTransition()
  const [isLoadingSelected, startLoadSelected] = useTransition()

  useEffect(() => {
    if (value.length === 0) {
      setSelectedItems([])
      return
    }

    startLoadSelected(async () => {
      const result = await getProductsForPickerByIdsAction(value)
      if (result.ok) {
        setSelectedItems(result.items)
      }
    })
  }, [value])

  useEffect(() => {
    const term = search.trim()
    if (term.length < 2) {
      setResults([])
      setSearchError(null)
      return
    }

    const timer = window.setTimeout(() => {
      startSearch(async () => {
        const result = await searchProductsForPickerAction(term)
        if (!result.ok) {
          setSearchError(result.error)
          setResults([])
          return
        }
        setSearchError(null)
        setResults(result.items)
      })
    }, 300)

    return () => window.clearTimeout(timer)
  }, [search])

  function addProduct(item: ProductPickerItem) {
    if (value.includes(item.id)) return
    onChange([...value, item.id])
  }

  function removeProduct(id: string) {
    onChange(value.filter((item) => item !== id))
  }

  return (
    <fieldset className="space-y-3 rounded-lg border border-hairline p-4">
      <legend className="px-1 text-sm font-medium text-ink">Produtos elegíveis</legend>
      <p className="text-xs text-mute">Vazio = todos os produtos.</p>

      {selectedItems.length > 0 && (
        <ul className="flex flex-wrap gap-2">
          {selectedItems.map((item) => (
            <li key={item.id}>
              <span className="inline-flex max-w-full items-center gap-1 rounded-full border border-hairline bg-soft-cloud px-3 py-1 text-xs text-ink">
                <span className="truncate">{formatProductLabel(item)}</span>
                <button
                  type="button"
                  onClick={() => removeProduct(item.id)}
                  className="shrink-0 rounded-full px-1 text-mute hover:text-ink"
                  aria-label={`Remover ${item.name}`}
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
        placeholder="Buscar por nome ou SKU..."
        className="w-full rounded-lg border border-hairline px-3 py-2 text-sm"
      />

      {search.trim().length > 0 && search.trim().length < 2 && (
        <p className="text-xs text-mute">Digite ao menos 2 caracteres para buscar.</p>
      )}

      {isLoadingSelected && value.length > 0 && selectedItems.length === 0 && (
        <p className="text-xs text-mute">Carregando produtos selecionados...</p>
      )}

      {isSearching && <p className="text-xs text-mute">Buscando...</p>}
      {searchError && <p className="text-xs text-red-600">{searchError}</p>}

      {results.length > 0 && (
        <ul className="max-h-48 space-y-1 overflow-y-auto rounded-lg border border-hairline">
          {results.map((item) => {
            const isSelected = value.includes(item.id)
            return (
              <li
                key={item.id}
                className="flex items-center justify-between gap-3 border-b border-hairline px-3 py-2 text-sm last:border-b-0"
              >
                <div className="min-w-0">
                  <p className="truncate font-medium text-ink">{item.name}</p>
                  <p className="truncate text-xs text-mute">
                    {item.sku ? `SKU ${item.sku}` : 'Sem SKU'}
                    {' · '}
                    {STATUS_LABEL[item.status]}
                  </p>
                </div>
                <button
                  type="button"
                  disabled={isSelected}
                  onClick={() => addProduct(item)}
                  className={getButtonClassName(
                    'outline',
                    'sm',
                    isSelected ? 'opacity-50' : ''
                  )}
                >
                  {isSelected ? 'Adicionado' : 'Adicionar'}
                </button>
              </li>
            )
          })}
        </ul>
      )}

      {search.trim().length >= 2 && !isSearching && results.length === 0 && !searchError && (
        <p className="text-xs text-mute">Nenhum produto encontrado.</p>
      )}
    </fieldset>
  )
}
