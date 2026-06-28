'use client'

import { useCallback, useRef, useState } from 'react'
import { isProductsStorageUrl } from '@/lib/catalog/media/classify-url'
import { ImageProbeMap } from './types'

export function useImageProbe(options?: { supabaseUrl?: string }) {
  const supabaseUrl = options?.supabaseUrl
  const [probe, setProbeState] = useState<ImageProbeMap>({})
  const probeRef = useRef(probe)
  probeRef.current = probe

  const setProbe = useCallback((url: string, ok: boolean) => {
    setProbeState((prev) => {
      if (prev[url] === ok) return prev
      return { ...prev, [url]: ok }
    })
  }, [])

  const reportImageResult = useCallback(
    (url: string, ok: boolean) => {
      if (!url) return
      if (isProductsStorageUrl(url, supabaseUrl)) return
      setProbe(url, ok)
    },
    [setProbe, supabaseUrl]
  )

  return { probe, probingIds: new Set<string>(), reportImageResult, setProbe }
}
