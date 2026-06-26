'use client'

import Link from 'next/link'
import { useSearchParams, usePathname } from 'next/navigation'

type StatusTabsProps = {
  counts: Record<string, number>
  labels: Record<string, string>
  paramName?: string
}

export function StatusTabs({ counts, labels, paramName = 'status' }: StatusTabsProps) {
  const searchParams = useSearchParams()
  const pathname = usePathname()
  const current = searchParams.get(paramName) ?? ''

  function tabUrl(value: string) {
    const params = new URLSearchParams(searchParams.toString())
    if (value) {
      params.set(paramName, value)
    } else {
      params.delete(paramName)
    }
    params.delete('page')
    return `${pathname}?${params.toString()}`
  }

  const entries = [['', 'Todos'], ...Object.entries(labels)]

  return (
    <div className="flex flex-wrap gap-1">
      {entries.map(([value, label]) => {
        const count = value === '' ? Object.values(counts).reduce((a, b) => a + b, 0) : (counts[value] ?? 0)
        const isActive = current === value
        return (
          <Link
            key={value}
            href={tabUrl(value)}
            className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-sm font-medium transition-colors ${
              isActive
                ? 'bg-ink text-canvas'
                : 'bg-soft-cloud text-charcoal hover:bg-hairline'
            }`}
          >
            {label}
            <span
              className={`rounded-full px-1.5 py-0.5 text-xs font-semibold ${
                isActive ? 'bg-canvas/20 text-canvas' : 'bg-ink/10 text-ink'
              }`}
            >
              {count}
            </span>
          </Link>
        )
      })}
    </div>
  )
}
