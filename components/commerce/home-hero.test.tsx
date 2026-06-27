/**
 * @vitest-environment jsdom
 */
import { describe, expect, it, vi, afterEach } from 'vitest'
import { render, screen, cleanup } from '@testing-library/react'
import { HomeHero } from './home-hero'
import { BannerSlide } from '@/types/banner-slide'
import { SportsHeroContent } from './sports-hero'

vi.mock('@/hooks/use-device-breakpoint', () => ({
  useDeviceBreakpoint: vi.fn(),
}))

vi.mock('./banner-carousel', () => ({
  BannerCarousel: ({ slides }: { slides: BannerSlide[] }) => (
    <div data-testid="banner-carousel">{slides.length} slides</div>
  ),
}))

vi.mock('./sports-hero', () => ({
  SportsHero: ({ content }: { content: SportsHeroContent }) => (
    <div data-testid="sports-hero">{content.heroHeadline}</div>
  ),
}))

import { useDeviceBreakpoint } from '@/hooks/use-device-breakpoint'

afterEach(() => cleanup())

const fallback: SportsHeroContent = {
  storeName: 'Loja',
  heroImagePath: null,
  heroHeadline: 'Hero fallback',
  heroHeadlineLine2: '',
  heroSubheadline: '',
  heroCtaLabel: 'Ver',
  heroCtaHref: '/products',
  updatedAt: '2026-01-01',
}

function slide(visibility: BannerSlide['visibility']): BannerSlide {
  return {
    id: '1',
    desktopImagePath: 'banners/1-desktop.webp',
    sortOrder: 0,
    active: true,
    visibility,
    createdAt: '2026-01-01T00:00:00Z',
    updatedAt: '2026-01-01T00:00:00Z',
  }
}

describe('HomeHero', () => {
  it('shows carousel when desktop-only slides on desktop', () => {
    vi.mocked(useDeviceBreakpoint).mockReturnValue({ isMobile: false, isReady: true })
    render(<HomeHero slides={[slide('desktop')]} fallback={fallback} />)
    expect(screen.getAllByTestId('banner-carousel')).toHaveLength(1)
  })

  it('shows SportsHero when desktop-only slides on mobile', () => {
    vi.mocked(useDeviceBreakpoint).mockReturnValue({ isMobile: true, isReady: true })
    render(<HomeHero slides={[slide('desktop')]} fallback={fallback} />)
    expect(screen.getByTestId('sports-hero')).toBeTruthy()
    expect(screen.getByText('Hero fallback')).toBeTruthy()
  })

  it('shows carousel for all visibility on mobile', () => {
    vi.mocked(useDeviceBreakpoint).mockReturnValue({ isMobile: true, isReady: true })
    render(<HomeHero slides={[slide('all')]} fallback={fallback} />)
    expect(screen.getAllByTestId('banner-carousel')).toHaveLength(1)
  })
})
