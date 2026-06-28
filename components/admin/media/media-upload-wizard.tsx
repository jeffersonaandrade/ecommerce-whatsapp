'use client'

import { useMemo, useRef, useState } from 'react'
import { Alert } from '@/components/ui/alert'
import { getButtonClassName } from '@/components/ui/button'
import { bulkSetProductImagesAction, exportMediaMapCsvAction } from '@/lib/catalog/media/actions'
import { runUploadQueue } from '@/lib/catalog/media/client-upload'
import {
  AssociationMatch,
  matchFilesToProducts,
} from '@/lib/catalog/media/filename-association'
import { MediaMapProduct, UploadReportRow } from '@/lib/catalog/media/types'
import { createBrowserSupabaseClient } from '@/lib/supabase/browser'
import { isSupabaseAuthMode } from '@/lib/auth/mode'

type ProductUploadState = {
  productId: string
  slug: string
  paths: string[]
  uploadedPaths: string[]
  status: 'pending' | 'uploading' | 'committing' | 'done' | 'failed'
  error?: string
}

type MediaUploadWizardProps = {
  products: MediaMapProduct[]
  supabaseUrl: string
}

function buildReportCsv(rows: UploadReportRow[]): string {
  const header = 'product_id,slug,status,files_uploaded,errors'
  const body = rows.map((r) =>
    [r.productId, r.slug, r.status, String(r.filesUploaded), `"${r.errors.replace(/"/g, '""')}"`].join(',')
  )
  return [header, ...body].join('\n')
}

export function MediaUploadWizard({ products, supabaseUrl }: MediaUploadWizardProps) {
  const [files, setFiles] = useState<File[]>([])
  const [association, setAssociation] = useState<ReturnType<typeof matchFilesToProducts> | null>(
    null
  )
  const [productStates, setProductStates] = useState<Map<string, ProductUploadState>>(new Map())
  const [running, setRunning] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [report, setReport] = useState<UploadReportRow[] | null>(null)
  const abortRef = useRef<AbortController | null>(null)
  const supabaseEnabled = isSupabaseAuthMode() && Boolean(supabaseUrl)

  const groupedMatches = useMemo(() => {
    if (!association) return new Map<string, AssociationMatch[]>()
    const map = new Map<string, AssociationMatch[]>()
    for (const match of association.matches) {
      const list = map.get(match.productId) ?? []
      list.push(match)
      map.set(match.productId, list)
    }
    return map
  }, [association])

  function handleFilesSelected(list: FileList | null) {
    if (!list) return
    const next = Array.from(list)
    setFiles(next)
    setAssociation(matchFilesToProducts(next, products))
    setReport(null)
    setError(null)
  }

  async function handleExportMap() {
    const response = await exportMediaMapCsvAction()
    if (!response.ok) {
      setError(response.error)
      return
    }
    const blob = new Blob([response.csv], { type: 'text/csv;charset=utf-8' })
    const url = URL.createObjectURL(blob)
    const anchor = document.createElement('a')
    anchor.href = url
    anchor.download = 'media-map.csv'
    anchor.click()
    URL.revokeObjectURL(url)
  }

  async function startUpload(mode: 'replace' | 'append' = 'replace') {
    if (!association || !association.matches.length || !supabaseEnabled) return

    setRunning(true)
    setError(null)
    setReport(null)
    abortRef.current = new AbortController()

    const supabase = createBrowserSupabaseClient()
    const states = new Map<string, ProductUploadState>()

    for (const [productId, matches] of groupedMatches) {
      states.set(productId, {
        productId,
        slug: matches[0].productSlug,
        paths: [],
        uploadedPaths: [],
        status: 'pending',
      })
    }
    setProductStates(new Map(states))

    const queueItems = association.matches.map((match, index) => ({
      id: `${match.productId}-${match.order}-${index}`,
      productId: match.productId,
      file: match.file,
      order: match.order,
    }))
    const orderByQueueId = new Map(queueItems.map((item) => [item.id, item.order]))

    const uploadsByProduct = new Map<string, Array<{ order: number; path: string }>>()

    await runUploadQueue({
      supabase,
      supabaseUrl,
      items: queueItems,
      concurrency: 3,
      signal: abortRef.current.signal,
      onItemStart: (_id, productId) => {
        setProductStates((prev) => {
          const next = new Map(prev)
          const current = next.get(productId)
          if (current) next.set(productId, { ...current, status: 'uploading' })
          return next
        })
      },
      onItemComplete: (id, productId, result) => {
        const list = uploadsByProduct.get(productId) ?? []
        list.push({ order: orderByQueueId.get(id) ?? Number.MAX_SAFE_INTEGER, path: result.path })
        uploadsByProduct.set(productId, list)
        setProductStates((prev) => {
          const next = new Map(prev)
          const current = next.get(productId)
          if (current) {
            next.set(productId, {
              ...current,
              uploadedPaths: [...current.uploadedPaths, result.path],
            })
          }
          return next
        })
      },
      onItemError: (_id, productId, message) => {
        setProductStates((prev) => {
          const next = new Map(prev)
          const current = next.get(productId)
          if (current) next.set(productId, { ...current, status: 'failed', error: message })
          return next
        })
      },
    })

    const reportRows: UploadReportRow[] = []

    for (const [productId, uploads] of uploadsByProduct) {
      const paths = uploads
        .sort((a, b) => a.order - b.order)
        .map((upload) => upload.path)
      const state = states.get(productId)
      if (!paths.length) {
        reportRows.push({
          productId,
          slug: state?.slug ?? productId,
          status: 'failed',
          filesUploaded: 0,
          errors: state?.error ?? 'Nenhum arquivo enviado',
        })
        continue
      }

      setProductStates((prev) => {
        const next = new Map(prev)
        const current = next.get(productId)
        if (current) next.set(productId, { ...current, status: 'committing' })
        return next
      })

      const commit = await bulkSetProductImagesAction([
        { productId, paths, mode },
      ])

      if (!commit.ok) {
        reportRows.push({
          productId,
          slug: state?.slug ?? productId,
          status: 'partial',
          filesUploaded: paths.length,
          errors: commit.error,
        })
        setProductStates((prev) => {
          const next = new Map(prev)
          const current = next.get(productId)
          if (current) {
            next.set(productId, {
              ...current,
              status: 'failed',
              paths,
              error: commit.error,
            })
          }
          return next
        })
        continue
      }

      if (commit.failures.length) {
        reportRows.push({
          productId,
          slug: state?.slug ?? productId,
          status: 'partial',
          filesUploaded: paths.length,
          errors: commit.failures[0].error,
        })
      } else {
        reportRows.push({
          productId,
          slug: state?.slug ?? productId,
          status: 'success',
          filesUploaded: paths.length,
          errors: '',
        })
      }

      setProductStates((prev) => {
        const next = new Map(prev)
        const current = next.get(productId)
        if (current) next.set(productId, { ...current, status: 'done', paths })
        return next
      })
    }

    if (association.orphans.length) {
      for (const orphan of association.orphans) {
        reportRows.push({
          productId: '',
          slug: '',
          status: 'skipped',
          filesUploaded: 0,
          errors: `Arquivo sem produto: ${orphan}`,
        })
      }
    }

    setReport(reportRows)
    setRunning(false)
  }

  async function retryFailedCommits() {
    const retries = [...productStates.values()].filter(
      (s) => s.status === 'failed' && s.uploadedPaths.length > 0
    )
    if (!retries.length) return

    setRunning(true)
    const reportRows: UploadReportRow[] = report ? [...report] : []

    for (const item of retries) {
      const commit = await bulkSetProductImagesAction([
        { productId: item.productId, paths: item.uploadedPaths, mode: 'replace' },
      ])
      if (commit.ok && !commit.failures.length) {
        setProductStates((prev) => {
          const next = new Map(prev)
          next.set(item.productId, { ...item, status: 'done', error: undefined })
          return next
        })
        reportRows.push({
          productId: item.productId,
          slug: item.slug,
          status: 'success',
          filesUploaded: item.uploadedPaths.length,
          errors: '',
        })
      }
    }

    setReport(reportRows)
    setRunning(false)
  }

  function downloadReport() {
    if (!report) return
    const blob = new Blob([buildReportCsv(report)], { type: 'text/csv;charset=utf-8' })
    const url = URL.createObjectURL(blob)
    const anchor = document.createElement('a')
    anchor.href = url
    anchor.download = 'media-upload-report.csv'
    anchor.click()
    URL.revokeObjectURL(url)
  }

  return (
    <section className="space-y-6 rounded-lg border border-hairline bg-canvas p-6">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="text-lg font-semibold text-ink">Upload em lote</h2>
          <p className="mt-1 text-sm text-mute">
            Use arquivos no formato <code className="text-xs">slug--01.jpg</code> ou{' '}
            <code className="text-xs">sku--01.webp</code>
          </p>
        </div>
        <button
          type="button"
          onClick={handleExportMap}
          className={getButtonClassName('outline', 'md', 'w-full sm:w-auto')}
        >
          Baixar mapa CSV
        </button>
      </div>

      {!supabaseEnabled && (
        <Alert
          type="info"
          message="Upload direto requer Supabase (NEXT_PUBLIC_DATA_PROVIDER=supabase)."
        />
      )}

      {error && <Alert type="error" message={error} />}

      <div className="space-y-2">
        <label className="text-sm font-medium text-ink">Selecionar imagens</label>
        <input
          type="file"
          accept="image/jpeg,image/png,image/webp,.jpg,.jpeg,.png,.webp"
          multiple
          onChange={(e) => handleFilesSelected(e.target.files)}
          className="block w-full text-sm text-mute file:mr-4 file:rounded-full file:border-0 file:bg-soft-cloud file:px-4 file:py-2 file:text-sm file:font-medium file:text-ink"
        />
        <p className="text-xs text-mute">Selecione uma ou mais imagens.</p>
      </div>

      {association && (
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
            <div className="rounded-lg bg-soft-cloud p-3">
              <div className="text-xs uppercase text-mute">Associados</div>
              <div className="text-2xl font-bold text-ink">{association.matches.length}</div>
            </div>
            <div className="rounded-lg bg-soft-cloud p-3">
              <div className="text-xs uppercase text-mute">Órfãos</div>
              <div className="text-2xl font-bold text-amber-700">{association.orphans.length}</div>
            </div>
            <div className="rounded-lg bg-soft-cloud p-3">
              <div className="text-xs uppercase text-mute">Erros</div>
              <div className="text-2xl font-bold text-error">
                {association.errors.length + association.ambiguities.length}
              </div>
            </div>
            <div className="rounded-lg bg-soft-cloud p-3">
              <div className="text-xs uppercase text-mute">Sem arquivo</div>
              <div className="text-2xl font-bold text-mute">
                {association.unmatchedProducts.length}
              </div>
            </div>
          </div>

          {(association.errors.length > 0 || association.ambiguities.length > 0) && (
            <div className="max-h-40 overflow-y-auto rounded-lg border border-hairline bg-soft-cloud p-3 text-sm">
              {[...association.errors, ...association.ambiguities].map((item, index) => (
                <p key={`${item.fileName}-${index}`} className="text-error">
                  {item.fileName}: {item.message}
                </p>
              ))}
            </div>
          )}

          {association.matches.length > 0 && (
            <div className="overflow-x-auto rounded-lg border border-hairline">
              <table className="min-w-full text-sm">
                <thead className="bg-soft-cloud text-left text-xs uppercase text-mute">
                  <tr>
                    <th className="px-4 py-2">Arquivo</th>
                    <th className="px-4 py-2">Produto</th>
                    <th className="px-4 py-2">Ordem</th>
                    <th className="px-4 py-2">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-hairline">
                  {association.matches.slice(0, 50).map((match) => {
                    const state = productStates.get(match.productId)
                    return (
                      <tr key={`${match.fileName}-${match.order}`}>
                        <td className="px-4 py-2 font-mono text-xs">{match.fileName}</td>
                        <td className="px-4 py-2">{match.productName}</td>
                        <td className="px-4 py-2">{match.order}</td>
                        <td className="px-4 py-2 text-mute">{state?.status ?? 'preview'}</td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
              {association.matches.length > 50 && (
                <p className="px-4 py-2 text-xs text-mute">
                  Mostrando 50 de {association.matches.length} arquivos.
                </p>
              )}
            </div>
          )}

          <div className="flex flex-wrap gap-3">
            <button
              type="button"
              disabled={!supabaseEnabled || running || !association.matches.length}
              onClick={() => startUpload('replace')}
              className={getButtonClassName('default', 'md')}
            >
              {running ? 'Enviando…' : 'Substituir imagens (recomendado)'}
            </button>
            <button
              type="button"
              disabled={!supabaseEnabled || running || !association.matches.length}
              onClick={() => startUpload('append')}
              className={getButtonClassName('outline', 'md')}
            >
              Anexar imagens
            </button>
            <button
              type="button"
              disabled={running}
              onClick={retryFailedCommits}
              className={getButtonClassName('outline', 'md')}
            >
              Tentar novamente
            </button>
            {report && (
              <button
                type="button"
                onClick={downloadReport}
                className={getButtonClassName('outline', 'md')}
              >
                Baixar relatório CSV
              </button>
            )}
          </div>
        </div>
      )}
    </section>
  )
}
