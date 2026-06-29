'use client'

import { useState } from 'react'
import Link from 'next/link'
import { Badge } from '@/components/ui/badge'
import { DeleteProductButton } from '@/components/admin/delete-product-button'
import { BulkActionsBar } from '@/components/admin/bulk-actions-bar'
import {
  BulkMoveCategoryDialog,
  type BulkMoveMode,
} from '@/components/admin/bulk-move-category-dialog'
import { BulkFilterMoveBanner } from '@/components/admin/bulk-filter-move-banner'
import { formatPrice } from '@/lib/formatters'
import type { Product } from '@/types/product'
import type { Category } from '@/types/category'
import type { ProductFilters } from '@/lib/query'

type ProductsTableProps = {
  products: Product[]
  storePersonalizationEnabled?: boolean
  categories?: Category[]
  filters?: ProductFilters
  total?: number
  catalogTotal?: number
}

function statusLabel(status: string): string {
  if (status === 'active') return 'Ativo'
  if (status === 'draft') return 'Rascunho'
  return 'Indisponível'
}

function statusVariant(status: string): 'success' | 'warning' | 'default' {
  if (status === 'active') return 'success'
  if (status === 'draft') return 'warning'
  return 'default'
}

export function ProductsTable({
  products,
  storePersonalizationEnabled = false,
  categories = [],
  filters = {},
  total = products.length,
  catalogTotal = total,
}: ProductsTableProps) {
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set())
  const [moveDialog, setMoveDialog] = useState<BulkMoveMode | null>(null)

  const allSelected = products.length > 0 && products.every((p) => selectedIds.has(p.id))

  function toggleAll() {
    if (allSelected) {
      setSelectedIds(new Set())
    } else {
      setSelectedIds(new Set(products.map((p) => p.id)))
    }
  }

  function toggleOne(id: string) {
    setSelectedIds((prev) => {
      const next = new Set(prev)
      if (next.has(id)) next.delete(id)
      else next.add(id)
      return next
    })
  }

  function closeMoveDialog() {
    setMoveDialog(null)
    setSelectedIds(new Set())
  }

  if (products.length === 0) {
    return (
      <div className="rounded-lg border border-hairline bg-canvas p-12 text-center text-mute">
        Nenhum produto encontrado.
      </div>
    )
  }

  const selectedCount = selectedIds.size
  const moveAffectedCount = moveDialog === 'selection' ? selectedCount : total

  return (
    <>
      <BulkFilterMoveBanner
        selectedCount={selectedCount}
        total={total}
        catalogTotal={catalogTotal}
        filters={filters}
        onMoveAll={() => setMoveDialog('allMatching')}
        disabled={categories.length === 0}
      />

      {moveDialog && categories.length > 0 && (
        <BulkMoveCategoryDialog
          mode={moveDialog}
          selectedIds={[...selectedIds]}
          filters={filters}
          affectedCount={moveAffectedCount}
          catalogTotal={catalogTotal}
          categories={categories}
          onClose={closeMoveDialog}
          onSuccess={() => setSelectedIds(new Set())}
        />
      )}

      <div className="overflow-x-auto rounded-lg border border-hairline">
        <table className="w-full">
          <thead className="border-b border-hairline bg-soft-cloud">
            <tr>
              <th className="w-10 py-3 pl-4 pr-2">
                <input
                  type="checkbox"
                  checked={allSelected}
                  onChange={toggleAll}
                  aria-label="Selecionar todos"
                  className="h-4 w-4 rounded border-hairline accent-ink"
                />
              </th>
              <th className="py-3 px-4 text-left text-sm font-semibold text-ink">
                Produto
              </th>
              <th className="py-3 px-4 text-left text-sm font-semibold text-ink">
                Categoria
              </th>
              <th className="py-3 px-4 text-left text-sm font-semibold text-ink">
                Preço
              </th>
              <th className="py-3 px-4 text-left text-sm font-semibold text-ink">
                Estoque
              </th>
              <th className="py-3 px-4 text-left text-sm font-semibold text-ink">
                Status
              </th>
              <th className="py-3 px-4 text-left text-sm font-semibold text-ink">
                Ações
              </th>
            </tr>
          </thead>
          <tbody>
            {products.map((product) => {
              const totalStock = product.variations.reduce((sum, v) => sum + v.stock, 0)
              const hasPromotion =
                product.promotionalPrice != null &&
                product.promotionalPrice < product.price
              const isSelected = selectedIds.has(product.id)

              return (
                <tr
                  key={product.id}
                  className={`border-b border-hairline last:border-0 ${
                    isSelected ? 'bg-soft-cloud' : 'hover:bg-soft-cloud/50'
                  }`}
                >
                  <td className="py-3 pl-4 pr-2">
                    <input
                      type="checkbox"
                      checked={isSelected}
                      onChange={() => toggleOne(product.id)}
                      aria-label={`Selecionar ${product.name}`}
                      className="h-4 w-4 rounded border-hairline accent-ink"
                    />
                  </td>
                  <td className="py-4 px-4">
                    <p className="font-medium text-ink">{product.name}</p>
                    <p className="text-xs text-mute">{product.slug}</p>
                  </td>
                  <td className="py-4 px-4 text-sm text-mute">{product.category}</td>
                  <td className="py-4 px-4">
                    <div className="text-sm">
                      {hasPromotion ? (
                        <>
                          <p className="font-medium text-ink">
                            {formatPrice(product.promotionalPrice!)}
                          </p>
                          <p className="text-xs text-mute line-through">
                            {formatPrice(product.price)}
                          </p>
                        </>
                      ) : (
                        <p className="font-medium text-ink">{formatPrice(product.price)}</p>
                      )}
                    </div>
                  </td>
                  <td className="py-4 px-4 text-sm">
                    {totalStock > 0 ? (
                      <span className="text-success font-medium">{totalStock} un.</span>
                    ) : (
                      <span className="text-error font-medium">Sem estoque</span>
                    )}
                  </td>
                  <td className="py-4 px-4">
                    <Badge variant={statusVariant(product.status)}>
                      {statusLabel(product.status)}
                    </Badge>
                  </td>
                  <td className="py-4 px-4">
                    <div className="flex gap-3">
                      <Link
                        href={`/admin/products/${product.id}/edit`}
                        className="text-sm font-medium text-blue-600 hover:text-blue-800"
                      >
                        Editar
                      </Link>
                      <DeleteProductButton
                        productId={product.id}
                        productName={product.name}
                      />
                    </div>
                  </td>
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>

      <BulkActionsBar
        selectedIds={[...selectedIds]}
        onClear={() => setSelectedIds(new Set())}
        onMoveCategory={() => setMoveDialog('selection')}
        storePersonalizationEnabled={storePersonalizationEnabled}
        categories={categories}
      />
    </>
  )
}
