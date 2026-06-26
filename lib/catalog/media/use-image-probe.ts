'use client'

import { useCallback, useEffect, useRef, useState } from 'react'
import { ImageProbeMap } from './types'

const DEFAULT_CONCURRENCY = 5
const DEFAULT_TIMEOUT_MS = 8000

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
}) {
  const concurrency = options?.concurrency ?? DEFAULT_CONCURRENCY
  const timeoutMs = options?.timeoutMs ?? DEFAULT_TIMEOUT_MS
  const [probe, setProbe] = useState<ImageProbeMap>({})
  const [probingIds, setProbingIds] = useState<Set<string>>(new Set())
  const abortRef = useRef<AbortController | null>(null)

  const probeProduct = useCallback(
    async (productId: string, urls: string[]) => {
      const unique = [...new Set(urls.filter(Boolean))]
      if (!unique.length) return

      abortRef.current?.abort()
      const controller = new AbortController()
      abortRef.current = controller

      setProbingIds((prev) => new Set(prev).add(productId))

      await mapWithConcurrency(
        unique,
        concurrency,
        async (url) => {
          const ok = await probeImageUrl(url, timeoutMs, controller.signal)
          if (!controller.signal.aborted) {
            setProbe((prev) => ({ ...prev, [url]: ok }))
          }
          return ok
        },
        controller.signal
      )

      if (!controller.signal.aborted) {
        setProbingIds((prev) => {
          const next = new Set(prev)
          next.delete(productId)
          return next
        })
      }
    },
    [concurrency, timeoutMs]
  )

  const probeAll = useCallback(
    async (products: Array<{ id: string; images: string[] }>) => {
      for (const product of products) {
        if (product.images.length) {
          await probeProduct(product.id, product.images)
        }
      }
    },
    [probeProduct]
  )

  useEffect(() => {
    return () => abortRef.current?.abort()
  }, [])

  return { probe, probingIds, probeProduct, probeAll, setProbe }
}
