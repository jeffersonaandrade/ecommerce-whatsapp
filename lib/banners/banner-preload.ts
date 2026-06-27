/** Preload neighbors when slide count is small; otherwise only the next slide. */
export const BANNER_PRELOAD_NEIGHBOR_MAX = 5

export function getBannerPreloadIndices(current: number, total: number): number[] {
  if (total <= 1) return []

  const next = (current + 1) % total

  if (total <= BANNER_PRELOAD_NEIGHBOR_MAX) {
    const prev = (current - 1 + total) % total
    return prev === next ? [next] : [prev, next]
  }

  return [next]
}

export function preloadBannerImageUrl(url: string): void {
  if (typeof window === 'undefined' || !url) return
  const img = new window.Image()
  img.src = url
}
