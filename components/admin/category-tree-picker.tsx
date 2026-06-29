'use client'

import { Category } from '@/types/category'
import { buildCategoryTree, flattenCategoryTree, isLeafCategory } from '@/lib/catalog/category-tree'
import { formatCategoryBreadcrumb, getCategoryBreadcrumb } from '@/lib/catalog/category-tree'

type CategoryTreePickerProps = {
  categories: Category[]
  value: string
  onChange: (categoryId: string, slug: string) => void
  id?: string
  required?: boolean
  allowAnyNode?: boolean
  className?: string
}

export function CategoryTreePicker({
  categories,
  value,
  onChange,
  id = 'category-tree-picker',
  required = false,
  allowAnyNode = true,
  className = '',
}: CategoryTreePickerProps) {
  const tree = buildCategoryTree(categories)
  const options = flattenCategoryTree(tree).filter((category) =>
    allowAnyNode ? true : isLeafCategory(categories, category.id)
  )

  const selected = categories.find((c) => c.id === value)
  const breadcrumb = selected ? getCategoryBreadcrumb(categories, selected.id) : []

  return (
    <div className={`space-y-2 ${className}`}>
      <select
        id={id}
        required={required}
        value={value}
        onChange={(e) => {
          const next = categories.find((c) => c.id === e.target.value)
          if (next) onChange(next.id, next.slug)
        }}
        className="w-full rounded-md border border-hairline bg-white px-3 py-2 text-sm text-ink"
      >
        <option value="">Selecione uma categoria</option>
        {options.map((category) => (
          <option key={category.id} value={category.id}>
            {'—'.repeat(category.depth)} {category.depth > 0 ? ' ' : ''}
            {category.name}
            {!category.visible ? ' (oculta)' : ''}
          </option>
        ))}
      </select>
      {breadcrumb.length > 0 && (
        <p className="text-xs text-mute">{formatCategoryBreadcrumb(breadcrumb)}</p>
      )}
      {!allowAnyNode && selected && !isLeafCategory(categories, selected.id) && (
        <p className="text-xs text-amber-700">
          Recomendado: mover para uma subcategoria folha quando possível.
        </p>
      )}
    </div>
  )
}
