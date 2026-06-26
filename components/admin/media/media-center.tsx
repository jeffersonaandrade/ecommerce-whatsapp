'use client'

import { useEffect, useMemo, useState } from 'react'
import { AdminPagination } from '@/components/admin/admin-pagination'
import { filterMediaProducts, toMediaProductSummary } from '@/lib/catalog/media/media-query'
import { useImageProbe } from '@/lib/catalog/media/use-image-probe'
import { MediaFilter, MediaMapProduct, MediaProductSummary } from '@/lib/catalog/media/types'
import { MediaFilters } from './media-filters'
import { MediaProductRow } from './media-product-row'
import { MediaUploadWizard } from './media-upload-wizard'

type MediaCenterProps = {
  pageProducts: MediaMapProduct[]
  allProducts: MediaMapProduct[]
  supabaseUrl: string
  page: number
  pageSize: number
  total: number
  totalPages: number
  currentParams: URLSearchParams
}

type Tab = 'inventory' | 'upload'

export function MediaCenter({
  pageProducts,
  allProducts,
  supabaseUrl,
  page,
  pageSize,
  total,
  totalPages,
  currentParams,
}: MediaCenterProps) {
  const [tab, setTab] = useState<Tab>('inventory')
  const [filter, setFilter] = useState<MediaFilter>('all')
  const [search, setSearch] = useState('')
  const { probe, probingIds, probeAll } = useImageProbe({ concurrency: 5 })

  const summaries: MediaProductSummary[] = useMemo(
    () => pageProducts.map((p) => toMediaProductSummary(p, supabaseUrl)),
    [pageProducts, supabaseUrl]
  )

  const filtered = useMemo(
    () => filterMediaProducts(summaries, filter, probe, probingIds, search),
    [summaries, filter, probe, probingIds, search]
  )

  useEffect(() => {
    if (tab === 'inventory') {
      void probeAll(pageProducts)
    }
  }, [tab, pageProducts, probeAll])

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap gap-2">
        {(
          [
            ['inventory', 'Inventário'],
            ['upload', 'Upload em lote'],
          ] as const
        ).map(([value, label]) => (
          <button
            key={value}
            type="button"
            onClick={() => setTab(value)}
            className={`rounded-full px-4 py-1.5 text-sm font-medium ${
              tab === value ? 'bg-ink text-canvas' : 'bg-soft-cloud text-mute hover:text-ink'
            }`}
          >
            {label}
          </button>
        ))}
      </div>

      {tab === 'inventory' ? (
        <>
          <MediaFilters
            value={filter}
            onChange={setFilter}
            search={search}
            onSearchChange={setSearch}
          />

          <div className="overflow-x-auto rounded-lg border border-hairline bg-canvas">
            <table className="min-w-full text-sm">
              <thead className="bg-soft-cloud text-left text-xs uppercase tracking-wide text-mute">
                <tr>
                  <th className="px-4 py-3">Imagem</th>
                  <th className="px-4 py-3">Produto</th>
                  <th className="px-4 py-3">SKU</th>
                  <th className="px-4 py-3">Qtd</th>
                  <th className="px-4 py-3">Status</th>
                  <th className="px-4 py-3 text-right">Ações</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-hairline">
                {filtered.map((item) => (
                  <MediaProductRow
                    key={item.id}
                    item={item}
                    probe={probe}
                    probing={probingIds.has(item.id)}
                  />
                ))}
              </tbody>
            </table>
            {!filtered.length && (
              <p className="px-4 py-8 text-center text-sm text-mute">
                Nenhum produto corresponde ao filtro nesta página.
              </p>
            )}
          </div>

          <AdminPagination
            page={page}
            pageSize={pageSize}
            total={total}
            totalPages={totalPages}
            basePath="/admin/products/media"
            currentParams={currentParams}
          />
        </>
      ) : (
        <MediaUploadWizard products={allProducts} supabaseUrl={supabaseUrl} />
      )}
    </div>
  )
}
