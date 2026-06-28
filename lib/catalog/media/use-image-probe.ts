'use client'

import { useCallback, useEffect, useRef, useState } from 'react'
import { isProductsStorageUrl } from '@/lib/catalog/media/classify-url'
import { ImageProbeMap } from './types'

const DEFAULT_CONCURRENCY = 5
const DEFAULT_TIMEOUT_MS = 8000
const CACHE_KEY_PREFIX = 'media-probe-v1:'

function readProbeCache(url: string): boolean | undefined {
  if (typeof sessionStorage === 'undefined') return undefined
  try {
    const raw = sessionStorage.getItem(`${CACHE_KEY_PREFIX}${url}`)
    if (raw === '1') return true
    if (raw === '0') return false
  } catch {
    return undefined
  }
  return undefined
}

function writeProbeCache(url: string, ok: boolean): void {
  if (typeof sessionStorage === 'undefined') return
  try {
    sessionStorage.setItem(`${CACHE_KEY_PREFIX}${url}`, ok ? '1' : '0')
  } catch {
    // ignore quota errors
  }
}

function probeImageUrl(url: string, timeoutMs: number, signal: AbortSignal): Promise<boolean> {
  return new Promise((resolve) => {
    if (signal.aborted) {
      resolve(false)
      return
    }

    const img = new Image()
    let settled = false

    const finish = (ok: boolean) => {
      if (settled) return
      settled = true
      clearTimeout(timer)
      img.onload = null
      img.onerror = null
      resolve(ok)
    }

    const timer = setTimeout(() => finish(false), timeoutMs)

    img.onload = () => finish(true)
    img.onerror = () => finish(false)
    img.src = url

    signal.addEventListener('abort', () => finish(false), { once: true })
  })
}

async function mapWithConcurrency<T, R>(
  items: T[],
  concurrency: number,
  worker: (item: T) => Promise<R>,
  signal: AbortSignal
): Promise<R[]> {
  const results: R[] = new Array(items.length)
  let index = 0

  async function runWorker() {
    while (index < items.length) {
      if (signal.aborted) return
      const currentIndex = index++
      results[currentIndex] = await worker(items[currentIndex])
    }
  }

  await Promise.all(
    Array.from({ length: Math.min(concurrency, items.length) }, () => runWorker())
  )
  return results
}

export function useImageProbe(options?: {
  concurrency?: number
  timeoutMs?: number
  supabaseUrl?: string
}) {
  const concurrency = options?.concurrency ?? DEFAULT_CONCURRENCY
  const timeoutMs = options?.timeoutMs ?? DEFAULT_TIMEOUT_MS
  const supabaseUrl = options?.supabaseUrl
  const [probe, setProbe] = useState<ImageProbeMap>(() => {
    if (typeof sessionStorage === 'undefined') return {}
    const cached: ImageProbeMap = {}
    return cached
  })
  const [probingIds, setProbingIds] = useState<Set<string>>(new Set())
  const abortRef = useRef<AbortController | null>(null)

  const probeUrl = useCallback(
    async (url: string, signal: AbortSignal): Promise<boolean> => {
      if (isProductsStorageUrl(url, supabaseUrl)) return true

      const cached = readProbeCache(url) ?? probe[url]
      if (cached !== undefined) return cached

      const ok = await probeImageUrl(url, timeoutMs, signal)
      if (!signal.aborted) {
        writeProbeCache(url, ok)
        setProbe((prev) => ({ ...prev, [url]: ok }))
      }
      return ok
    },
    [probe, supabaseUrl, timeoutMs]
  )

  const probeProduct = useCallback(
    async (productId: string, urls: string[]) => {
      const unique = [...new Set(urls.filter(Boolean))]
      if (!unique.length) return

      setProbingIds((prev) => new Set(prev).add(productId))

      const controller = new AbortController()

      await mapWithConcurrency(
        unique,
        concurrency,
        (url) => probeUrl(url, controller.signal),
        controller.signal
      )

      setProbingIds((prev) => {
        const next = new Set(prev)
        next.delete(productId)
        return next
      })
    },
    [concurrency, probeUrl]
  )

  const probeAll = useCallback(
    async (products: Array<{ id: string; images: string[] }>) => {
      abortRef.current?.abort()
      const controller = new AbortController()
      abortRef.current = controller

      await mapWithConcurrency(
        products.filter((p) => p.images.length > 0),
        concurrency,
        async (product) => {
          if (controller.signal.aborted) return
          await probeProduct(product.id, product.images)
        },
        controller.signal
      )
    },
    [concurrency, probeProduct]
  )

  useEffect(() => {
    return () => abortRef.current?.abort()
  }, [])

  return { probe, probingIds, probeProduct, probeAll, setProbe }
}
