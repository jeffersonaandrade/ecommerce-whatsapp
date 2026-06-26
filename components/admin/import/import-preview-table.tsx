'use client'

import { useMemo, useState } from 'react'
import { ImportPreview } from '@/lib/catalog/import/types'
import { getValidProducts } from '@/lib/catalog/import/validate-import'

type Filter = 'all' | 'valid' | 'errors'

type ImportPreviewTableProps = {
  preview: ImportPreview
  policy?: 'active' | 'draft'
}

const STATUS_LABEL: Record<string, string> = {
  active: 'Ativo',
  draft: 'Rascunho',
  unavailable: 'Indisponível',
}

function productHasError(preview: ImportPreview, slug: string): boolean {
  return preview.issues.some(
    (issue) => issue.severity === 'error' && issue.slug === slug
  )
}

export function ImportPreviewTable({ preview, policy = 'draft' }: ImportPreviewTableProps) {
  const [filter, setFilter] = useState<Filter>('all')
  const validSlugs = useMemo(
    () => new Set(getValidProducts(preview).map((p) => p.slug)),
    [preview]
  )

  const rows = preview.products.filter((product) => {
    if (filter === 'valid') return validSlugs.has(product.slug)
    if (filter === 'errors') return productHasError(preview, product.slug)
    return true
  })

  const productIssues = (slug: string) =>
    preview.issues.filter((issue) => issue.slug === slug || issue.row == null)

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap gap-2">
        {(
          [
            ['all', 'Todos'],
            ['valid', 'Válidos'],
            ['errors', 'Com erro'],
          ] as const
        ).map(([value, label]) => (
          <button
            key={value}
            type="button"
            onClick={() => setFilter(value)}
            className={`rounded-full px-3 py-1 text-sm ${
              filter === value
                ? 'bg-ink text-canvas'
                : 'bg-soft-cloud text-mute hover:text-ink'
            }`}
          >
            {label}
          </button>
        ))}
      </div>

      {preview.issues.length > 0 && (
        <div className="max-h-48 overflow-y-auto rounded-lg border border-hairline bg-soft-cloud p-4 text-sm">
          <p className="mb-2 font-medium text-ink">Detalhes</p>
          <ul className="space-y-1">
            {preview.issues.map((issue, index) => (
              <li
                key={`${issue.code}-${issue.row ?? 'x'}-${index}`}
                className={
                  issue.severity === 'error' ? 'text-error' : 'text-amber-700'
                }
              >
                [{issue.code}]
                {issue.row != null ? ` Linha ${issue.row}:` : ''} {issue.message}
              </li>
            ))}
          </ul>
        </div>
      )}

      <div className="overflow-x-auto rounded-lg border border-hairline">
        <table className="min-w-full text-sm">
          <thead className="bg-soft-cloud text-left text-xs uppercase tracking-wide text-mute">
            <tr>
              <th className="px-4 py-3">Slug</th>
              <th className="px-4 py-3">Nome</th>
              <th className="px-4 py-3">Categoria</th>
              <th className="px-4 py-3">Variações</th>
              <th className="px-4 py-3">Status</th>
              <th className="px-4 py-3">Validação</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-hairline bg-canvas">
            {rows.map((product) => {
              const isValid = validSlugs.has(product.slug)
              const issues = productIssues(product.slug)
              return (
                <tr key={product.slug}>
                  <td className="px-4 py-3 font-mono text-xs">{product.slug}</td>
                  <td className="px-4 py-3">{product.name}</td>
                  <td className="px-4 py-3">{product.category}</td>
                  <td className="px-4 py-3">{product.variations.length}</td>
                  <td className="px-4 py-3">
                    {product.statusFromCsv ? (
                      <span className="rounded-full bg-blue-50 px-2 py-0.5 text-xs font-medium text-blue-700">
                        {STATUS_LABEL[product.statusFromCsv] ?? product.statusFromCsv} (CSV)
                      </span>
                    ) : (
                      <span className="rounded-full bg-soft-cloud px-2 py-0.5 text-xs font-medium text-mute">
                        {STATUS_LABEL[policy] ?? policy} (política)
                      </span>
                    )}
                  </td>
                  <td className="px-4 py-3">
                    <span
                      className={`rounded-full px-2 py-0.5 text-xs font-medium ${
                        isValid
                          ? 'bg-success/10 text-success'
                          : 'bg-error/10 text-error'
                      }`}
                    >
                      {isValid ? 'Válido' : `${issues.length} problema(s)`}
                    </span>
                  </td>
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>
    </div>
  )
}
