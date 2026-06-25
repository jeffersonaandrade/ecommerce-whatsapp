'use client'

import { useEffect } from 'react'
import { StatusPage } from '@/components/layout/status-page'

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  useEffect(() => {
    console.error(error)
  }, [error])

  return (
    <div className="flex flex-1 flex-col">
      <StatusPage
        code="500"
        title="Algo deu errado"
        description="Encontramos um problema inesperado. Tente novamente ou volte ao catálogo."
      />
      <div className="pb-16 text-center">
        <button
          type="button"
          onClick={reset}
          className="text-sm font-medium text-mute underline-offset-4 hover:text-ink hover:underline"
        >
          Tentar novamente
        </button>
      </div>
    </div>
  )
}
