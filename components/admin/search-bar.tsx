'use client'

import { useRouter, useSearchParams, usePathname } from 'next/navigation'
import { useRef, useTransition } from 'react'

type SearchBarProps = {
  placeholder?: string
  paramName?: string
  defaultValue?: string
}

export function SearchBar({
  placeholder = 'Buscar...',
  paramName = 'q',
  defaultValue = '',
}: SearchBarProps) {
  const router = useRouter()
  const pathname = usePathname()
  const searchParams = useSearchParams()
  const [, startTransition] = useTransition()
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  function handleChange(value: string) {
    if (timerRef.current) clearTimeout(timerRef.current)
    timerRef.current = setTimeout(() => {
      const params = new URLSearchParams(searchParams.toString())
      if (value) {
        params.set(paramName, value)
      } else {
        params.delete(paramName)
      }
      params.delete('page')
      startTransition(() => {
        router.push(`${pathname}?${params.toString()}`)
      })
    }, 300)
  }

  return (
    <input
      type="search"
      defaultValue={defaultValue}
      placeholder={placeholder}
      onChange={(e) => handleChange(e.target.value)}
      className="w-full max-w-sm rounded-lg border border-hairline px-3 py-2 text-sm text-ink placeholder:text-mute focus:outline-none focus:ring-2 focus:ring-ink/20"
    />
  )
}
