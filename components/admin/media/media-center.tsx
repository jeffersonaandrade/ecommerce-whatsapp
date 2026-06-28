'use client'

import Link from 'next/link'
import { useMemo, useState } from 'react'
import { useSearchParams } from 'next/navigation'
import { AdminPagination } from '@/components/admin/admin-pagination'
import { BulkActivateDialog } from '@/components/admin/bulk-activate-dialog'
import { SearchBar } from '@/components/admin/search-bar'
import { StatusTabs } from '@/components/admin/status-tabs'
import { getButtonClassName } from '@/components/ui/button'
import { getResolvedStatus, toMediaProductSummary } from '@/lib/catalog/media/media-query'
import { useImageProbe } from '@/lib/catalog/media/use-image-probe'
import { MediaFilter, MediaMapProduct, MediaProductSummary } from '@/lib/catalog/media/types'
import { MediaFilters } from './media-filters'
import { MediaProductRow } from './media-product-row'
import { MediaUploadWizard } from './media-upload-wizard'

const PRODUCT_STATUS_LABELS: Record<string, string> = {
  active: 'Ativos',
  draft: 'Rascunho',
  unavailable: 'Indisponível',
}

type Tab = 'inventory' | 'upload'

type MediaCenterProps = {
  initialTab: Tab
  pageProducts: MediaMapProduct[]
  supabaseUrl: string
  page: number
  pageSize: number
  total: number
  totalPages: number
  currentParams: URLSearchParams
  productStatusCounts: Record<string, number>
  mediaStatusCounts: Record<string, number>
  searchDefault?: string
  storePersonalizationEnabled?: boolean
}

function tabHref(tab: Tab, currentParams: URLSearchParams): string {
  const params = new URLSearchParams(currentParams)
  if (tab === 'upload') {
    params.set('tab', 'upload')
  } else {
    params.delete('tab')
  }
  const qs = params.toString()
  return qs ? `/admin/products/media?${qs}` : '/admin/products/media'
}

export function MediaCenter({
  initialTab,
  pageProducts,
  supabaseUrl,
  page,
  pageSize,
  total,
  totalPages,
  currentParams,
  productStatusCounts,
  mediaStatusCounts,
  searchDefault = '',
  storePersonalizationEnabled = false,
}: MediaCenterProps) {
  const searchParams = useSearchParams()
  const mediaFilter = (searchParams.get('media') as MediaFilter | null) ?? 'all'
  const tab = initialTab
  const { probe, probingIds, reportImageResult } = useImageProbe({ supabaseUrl })
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set())
  const [showActivateDialog, setShowActivateDialog] = useState(false)

  const summaries: MediaProductSummary[] = useMemo(
    () => pageProducts.map((p) => toMediaProductSummary(p, supabaseUrl)),
    [pageProducts, supabaseUrl]
  )

  const resolvedSummaries = useMemo(
    () =>
      summaries.map((item) => ({
        item,
        status: getResolvedStatus(item, probe, probingIds.has(item.id)),
      })),
    [summaries, probe, probingIds]
  )

  const pageBrokenCount = useMemo(
    () => resolvedSummaries.filter(({ status }) => status === 'broken').length,
    [resolvedSummaries]
  )

  const displaySummaries = useMemo(() => {
    if (mediaFilter !== 'broken') {
      return resolvedSummaries.map(({ item }) => item)
    }
    return resolvedSummaries
      .filter(({ status }) => status === 'broken')
      .map(({ item }) => item)
  }, [mediaFilter, resolvedSummaries])

  const filterCounts = useMemo(
    () => ({
      ...mediaStatusCounts,
      broken: pageBrokenCount,
    }),
    [mediaStatusCounts, pageBrokenCount]
  )

  const visibleIds = useMemo(() => displaySummaries.map((s) => s.id), [displaySummaries])
  const allSelected = visibleIds.length > 0 && visibleIds.every((id) => selectedIds.has(id))

  function toggleAll() {
    if (allSelected) {
      setSelectedIds(new Set())
    } else {
      setSelectedIds(new Set(visibleIds))
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

  const selectedCount = selectedIds.size

  return (
    <div className="space-y-6" data-onboarding="media-center">
      <div className="flex flex-wrap gap-2">
        {(
          [
            ['inventory', 'Inventário'],
            ['upload', 'Upload em lote'],
          ] as const
        ).map(([value, label]) => (
          <Link
            key={value}
            href={tabHref(value, currentParams)}
            className={`rounded-full px-4 py-1.5 text-sm font-medium ${
              tab === value ? 'bg-ink text-canvas' : 'bg-soft-cloud text-mute hover:text-ink'
            }`}
          >
            {label}
          </Link>
        ))}
      </div>

      {tab === 'inventory' ? (
        <>
          <SearchBar
            placeholder="Buscar por nome, slug ou SKU..."
            defaultValue={searchDefault}
          />

          <MediaFilters counts={filterCounts} searchDefault={searchDefault} />

          {mediaFilter === 'broken' && (
            <p className="text-xs text-mute">
              Filtro &quot;Quebradas&quot; aplica-se à página atual após o carregamento das
              miniaturas. Contagem global indisponível sem verificação persistente.
            </p>
          )}

          <div className="space-y-2">
            <p className="text-xs font-medium uppercase tracking-wide text-mute">Catálogo</p>
            <StatusTabs counts={productStatusCounts} labels={PRODUCT_STATUS_LABELS} />
          </div>

          <div className="overflow-x-auto rounded-lg border border-hairline bg-canvas">
            <table className="min-w-full text-sm">
              <thead className="bg-soft-cloud text-left text-xs uppercase tracking-wide text-mute">
                <tr>
                  <th className="px-4 py-3">
                    <input
                      type="checkbox"
                      checked={allSelected}
                      onChange={toggleAll}
                      aria-label="Selecionar todos"
                      className="h-4 w-4 rounded border-hairline accent-ink"
                    />
                  </th>
                  <th className="px-4 py-3">Imagem</th>
                  <th className="px-4 py-3">Produto</th>
                  <th className="px-4 py-3">SKU</th>
                  <th className="px-4 py-3">Qtd</th>
                  <th className="px-4 py-3">Catálogo</th>
                  <th className="px-4 py-3">Mídia</th>
                  <th className="px-4 py-3 text-right">Ações</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-hairline">
                {displaySummaries.map((item) => (
                  <MediaProductRow
                    key={item.id}
                    item={item}
                    probe={probe}
                    probing={probingIds.has(item.id)}
                    onImageResult={reportImageResult}
                    selected={selectedIds.has(item.id)}
                    onToggle={() => toggleOne(item.id)}
                  />
                ))}
              </tbody>
            </table>
            {!displaySummaries.length && (
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
        <MediaUploadWizard supabaseUrl={supabaseUrl} />
      )}

      {/* Barra de seleção */}
      {selectedCount > 0 && (
        <div className="fixed bottom-0 left-0 right-0 z-40 border-t border-hairline bg-canvas shadow-lg">
          <div className="mx-auto flex max-w-7xl items-center justify-between gap-4 px-4 py-3 sm:px-6 lg:px-8">
            <span className="text-sm font-medium text-ink">
              {selectedCount} produto{selectedCount !== 1 ? 's' : ''} selecionado{selectedCount !== 1 ? 's' : ''}
            </span>
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => setShowActivateDialog(true)}
                className={getButtonClassName('default', 'sm')}
              >
                Publicar selecionados
              </button>
              <button
                type="button"
                onClick={() => setSelectedIds(new Set())}
                className="text-sm text-mute hover:text-ink"
              >
                Limpar seleção
              </button>
            </div>
          </div>
        </div>
      )}

      {showActivateDialog && (
        <BulkActivateDialog
          selectedIds={[...selectedIds]}
          onClose={() => {
            setShowActivateDialog(false)
            setSelectedIds(new Set())
          }}
          storePersonalizationEnabled={storePersonalizationEnabled}
        />
      )}
    </div>
  )
}
