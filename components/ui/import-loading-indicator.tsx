'use client'

import { cn } from '@/lib/utils'

type ImportLoadingIndicatorProps = {
  label?: string
  className?: string
}

export function ImportLoadingIndicator({
  label = 'Analisando',
  className,
}: ImportLoadingIndicatorProps) {
  const letters = label.split('')

  return (
    <div
      className={cn('import-loading-indicator', className)}
      role="status"
      aria-live="polite"
      aria-busy="true"
    >
      <div className="import-loading-indicator-text">
        {letters.map((letter, index) => (
          <span
            key={`${letter}-${index}`}
            className="import-loading-indicator-letter"
            style={{ animationDelay: `${index * 0.12}s` }}
          >
            {letter === ' ' ? '\u00A0' : letter}
          </span>
        ))}
      </div>
      <div className="import-loading-indicator-track">
        <div className="import-loading-indicator-bar" />
      </div>
    </div>
  )
}
