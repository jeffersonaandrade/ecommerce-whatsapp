'use client'

import { useRouter, useSearchParams } from 'next/navigation'
import { useCallback, useEffect, useRef, useState } from 'react'

export function ProductsSearchInput({ initialValue = '' }: { initialValue?: string }) {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [value, setValue] = useState(initialValue)
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  const commit = useCallback(
    (term: string) => {
      const params = new URLSearchParams(searchParams.toString())
      params.delete('page')
      if (term.trim()) {
        params.set('q', term.trim())
      } else {
        params.delete('q')
      }
      const qs = params.toString()
      router.push(qs ? `/products?${qs}` : '/products')
    },
    [router, searchParams]
  )

  useEffect(() => {
    if (timerRef.current) clearTimeout(timerRef.current)
    timerRef.current = setTimeout(() => commit(value), 300)
    return () => {
      if (timerRef.current) clearTimeout(timerRef.current)
    }
  }, [value, commit])

  return (
    <input
      type="search"
      value={value}
      onChange={(e) => setValue(e.target.value)}
      placeholder="Buscar por time, produto…"
      className="w-full rounded-lg border border-hairline bg-canvas px-3 py-2 text-sm text-ink placeholder:text-mute focus:outline-none focus:ring-2 focus:ring-ink/20"
      aria-label="Buscar produtos"
    />
  )
}
