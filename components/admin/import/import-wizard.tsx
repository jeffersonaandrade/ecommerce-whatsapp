'use client'

import { useState, useTransition } from 'react'
import Link from 'next/link'
import { getButtonClassName } from '@/components/ui/button'
import {
  confirmImportAction,
  parseImportCsvAction,
} from '@/lib/catalog/import/actions'
import { getValidProducts, hasBlockingErrors } from '@/lib/catalog/import/validate-import'
import {
  ImportApplyResult,
  ImportPreview,
  ParsedProduct,
} from '@/lib/catalog/import/types'
import { ImportPreviewTable } from './import-preview-table'

const TEMPLATE_PATH = '/templates/importacao-produtos-exemplo.csv'

type WizardStep = 'upload' | 'preview' | 'result'

export function ImportWizard() {
  const [step, setStep] = useState<WizardStep>('upload')
  const [file, setFile] = useState<File | null>(null)
  const [preview, setPreview] = useState<ImportPreview | null>(null)
  const [result, setResult] = useState<ImportApplyResult | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [isPending, startTransition] = useTransition()

  function handleFileChange(event: React.ChangeEvent<HTMLInputElement>) {
    const selected = event.target.files?.[0] ?? null
    setFile(selected)
    setError(null)
  }

  function handleParse() {
    if (!file) {
      setError('Selecione um arquivo CSV.')
      return
    }

    startTransition(async () => {
      setError(null)
      const formData = new FormData()
      formData.set('file', file)
      const response = await parseImportCsvAction(formData)

      if (!response.ok) {
        setError(response.error)
        return
      }

      setPreview(response.preview)
      setStep('preview')
    })
  }

  function handleConfirm(validProducts: ParsedProduct[]) {
    startTransition(async () => {
      setError(null)
      const response = await confirmImportAction(validProducts)

      if (!response.ok) {
        setError(response.error)
        return
      }

      setResult(response.result)
      setStep('result')
    })
  }

  function handleReset() {
    setStep('upload')
    setFile(null)
    setPreview(null)
    setResult(null)
    setError(null)
  }

  const validProducts = preview ? getValidProducts(preview) : []
  const canImport = preview && !hasBlockingErrors(preview) && validProducts.length > 0

  return (
    <div className="space-y-8">
      <nav className="flex flex-wrap gap-2 text-sm">
        {(['upload', 'preview', 'result'] as WizardStep[]).map((item, index) => {
          const labels = ['1. Arquivo', '2. Preview', '3. Resultado']
          const active = step === item
          const done =
            (item === 'upload' && step !== 'upload') ||
            (item === 'preview' && step === 'result')

          return (
            <span
              key={item}
              className={`rounded-full px-3 py-1 ${
                active
                  ? 'bg-ink text-canvas'
                  : done
                    ? 'bg-soft-cloud text-ink'
                    : 'bg-soft-cloud text-mute'
              }`}
            >
              {index + 1}. {labels[index]}
            </span>
          )
        })}
      </nav>

      {error && (
        <div className="rounded-lg border border-error/30 bg-error/5 px-4 py-3 text-sm text-error">
          {error}
        </div>
      )}

      {step === 'upload' && (
        <section className="space-y-6 rounded-lg border border-hairline bg-canvas p-6">
          <div>
            <h2 className="text-lg font-semibold text-ink">Importar produtos</h2>
            <p className="mt-2 text-sm text-mute">
              Baixe o template, preencha com seus produtos e selecione o arquivo
              CSV para continuar.
            </p>
          </div>

          <div className="flex flex-col gap-3 sm:flex-row">
            <a
              href={TEMPLATE_PATH}
              download
              className={getButtonClassName('outline', 'md', 'w-full sm:w-auto')}
            >
              Baixar template CSV
            </a>
          </div>

          <div className="space-y-2">
            <label htmlFor="csv-file" className="text-sm font-medium text-ink">
              Selecionar arquivo CSV
            </label>
            <input
              id="csv-file"
              type="file"
              accept=".csv,text/csv"
              onChange={handleFileChange}
              className="block w-full text-sm text-mute file:mr-4 file:rounded-full file:border-0 file:bg-soft-cloud file:px-4 file:py-2 file:text-sm file:font-medium file:text-ink hover:file:bg-hairline"
            />
            {file && (
              <p className="text-xs text-mute">
                Arquivo: {file.name} ({Math.round(file.size / 1024)} KB)
              </p>
            )}
          </div>

          <button
            type="button"
            onClick={handleParse}
            disabled={!file || isPending}
            className={getButtonClassName('default', 'md', 'w-full sm:w-auto')}
          >
            {isPending ? 'Analisando...' : 'Próximo'}
          </button>
        </section>
      )}

      {step === 'preview' && preview && (
        <section className="space-y-6">
          <div className="rounded-lg border border-hairline bg-canvas p-6">
            <h2 className="text-lg font-semibold text-ink">Preview da importação</h2>
            <p className="mt-2 text-sm text-mute">
              Arquivo: <strong>{preview.fileName}</strong>
            </p>

            <dl className="mt-4 grid grid-cols-2 gap-4 sm:grid-cols-4">
              <div>
                <dt className="text-xs uppercase tracking-wide text-mute">Produtos</dt>
                <dd className="text-2xl font-bold text-ink">{preview.stats.totalProducts}</dd>
              </div>
              <div>
                <dt className="text-xs uppercase tracking-wide text-mute">Válidos</dt>
                <dd className="text-2xl font-bold text-success">{preview.stats.validProducts}</dd>
              </div>
              <div>
                <dt className="text-xs uppercase tracking-wide text-mute">Erros</dt>
                <dd className="text-2xl font-bold text-error">{preview.stats.errorCount}</dd>
              </div>
              <div>
                <dt className="text-xs uppercase tracking-wide text-mute">Avisos</dt>
                <dd className="text-2xl font-bold text-amber-600">{preview.stats.warningCount}</dd>
              </div>
            </dl>
          </div>

          <ImportPreviewTable preview={preview} />

          <div className="flex flex-col gap-3 sm:flex-row">
            <button
              type="button"
              onClick={() => setStep('upload')}
              className={getButtonClassName('outline', 'md', 'w-full sm:w-auto')}
            >
              Voltar
            </button>
            <button
              type="button"
              onClick={() => handleConfirm(validProducts)}
              disabled={!canImport || isPending}
              title={
                !canImport
                  ? 'Corrija erros bloqueantes antes de importar'
                  : undefined
              }
              className={getButtonClassName('default', 'md', 'w-full sm:w-auto')}
            >
              {isPending ? 'Importando...' : 'Confirmar importação'}
            </button>
          </div>
        </section>
      )}

      {step === 'result' && result && (
        <section className="space-y-6 rounded-lg border border-hairline bg-canvas p-6">
          <h2 className="text-lg font-semibold text-ink">Importação concluída</h2>
          <dl className="grid grid-cols-1 gap-4 sm:grid-cols-3">
            <div className="rounded-lg bg-soft-cloud p-4">
              <dt className="text-xs uppercase tracking-wide text-mute">Novos</dt>
              <dd className="text-3xl font-bold text-ink">{result.created}</dd>
            </div>
            <div className="rounded-lg bg-soft-cloud p-4">
              <dt className="text-xs uppercase tracking-wide text-mute">Atualizados</dt>
              <dd className="text-3xl font-bold text-ink">{result.updated}</dd>
            </div>
            <div className="rounded-lg bg-soft-cloud p-4">
              <dt className="text-xs uppercase tracking-wide text-mute">Ignorados</dt>
              <dd className="text-3xl font-bold text-ink">{result.skipped}</dd>
            </div>
          </dl>

          <div className="flex flex-col gap-3 sm:flex-row">
            <Link
              href="/admin/products"
              className={getButtonClassName('default', 'md', 'w-full sm:w-auto')}
            >
              Ver produtos
            </Link>
            <button
              type="button"
              onClick={handleReset}
              className={getButtonClassName('outline', 'md', 'w-full sm:w-auto')}
            >
              Nova importação
            </button>
          </div>
        </section>
      )}
    </div>
  )
}
