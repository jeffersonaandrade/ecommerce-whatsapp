'use client'

import { useSyncExternalStore } from 'react'

/** Aligned with banner <picture> breakpoint (Tailwind md = 768px). */
export const DEVICE_BREAKPOINT_QUERY = '(max-width: 768px)'

function subscribe(onStoreChange: () => void): () => void {
  const media = window.matchMedia(DEVICE_BREAKPOINT_QUERY)
  media.addEventListener('change', onStoreChange)
  return () => media.removeEventListener('change', onStoreChange)
}

function getSnapshot(): boolean {
  return window.matchMedia(DEVICE_BREAKPOINT_QUERY).matches
}

function getServerSnapshot(): boolean {
  return false
}

export function useDeviceBreakpoint(): { isMobile: boolean; isReady: boolean } {
  const isMobile = useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot)
  const isReady = useSyncExternalStore(
    () => () => {},
    () => true,
    () => false
  )

  return { isMobile, isReady }
}
