import { describe, expect, it } from 'vitest'
import {
  BANNER_PRELOAD_NEIGHBOR_MAX,
  getBannerPreloadIndices,
} from './banner-preload'

describe('getBannerPreloadIndices', () => {
  it('returns empty for single slide', () => {
    expect(getBannerPreloadIndices(0, 1)).toEqual([])
  })

  it('returns both neighbors when total <= BANNER_PRELOAD_NEIGHBOR_MAX', () => {
    expect(getBannerPreloadIndices(1, 3)).toEqual([0, 2])
    expect(getBannerPreloadIndices(0, 5)).toEqual([4, 1])
  })

  it('returns only next when total > BANNER_PRELOAD_NEIGHBOR_MAX', () => {
    expect(getBannerPreloadIndices(2, 12)).toEqual([3])
    expect(getBannerPreloadIndices(11, 12)).toEqual([0])
  })

  it('handles two slides with neighbor policy', () => {
    expect(getBannerPreloadIndices(0, 2)).toEqual([1])
    expect(getBannerPreloadIndices(1, 2)).toEqual([0])
  })

  it('exports neighbor max constant', () => {
    expect(BANNER_PRELOAD_NEIGHBOR_MAX).toBe(5)
  })
})
