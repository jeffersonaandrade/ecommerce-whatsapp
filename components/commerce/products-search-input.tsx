'use client'

import { useRouter, useSearchParams } from 'next/navigation'
import { useEffect, useRef, useState } from 'react'

export function ProductsSearchInput({
  initialValue = '',
  placeholder = 'Buscar por time, produto…',
}: {
  initialValue?: string
  placeholder?: string
}) {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [value, setValue] = useState(initialValue)
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const skipNextCommitRef = useRef(true)

  useEffect(() => {
    setValue(initialValue)
    skipNextCommitRef.current = true
  }, [initialValue])

  useEffect(() => {
    if (skipNextCommitRef.current) {
      skipNextCommitRef.current = false
      return
    }

    if (timerRef.current) clearTimeout(timerRef.current)
    timerRef.current = setTimeout(() => {
      const params = new URLSearchParams(searchParams.toString())
      params.delete('page')
      if (value.trim()) {
        params.set('q', value.trim())
      } else {
        params.delete('q')
      }
      const qs = params.toString()
      router.push(qs ? `/products?${qs}` : '/products')
    }, 300)

    return () => {
      if (timerRef.current) clearTimeout(timerRef.current)
    }
    // Só reagir à digitação — mudanças em ?page= ou ?category= não devem resetar paginação.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [value])

  return (
    <input
      type="search"
      value={value}
      onChange={(e) => setValue(e.target.value)}
      placeholder={placeholder}
      className="w-full rounded-lg border border-hairline bg-canvas px-3 py-2 text-sm text-ink placeholder:text-mute focus:outline-none focus:ring-2 focus:ring-ink/20"
      aria-label="Buscar produtos"
    />
  )
}
