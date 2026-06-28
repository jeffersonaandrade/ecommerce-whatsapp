'use client'

import { useMemo } from 'react'
import { BannerCarousel } from '@/components/commerce/banner-carousel'
import { SportsHero, SportsHeroContent } from '@/components/commerce/sports-hero'
import { filterSlidesForViewport } from '@/lib/banners/banner-viewport'
import { useDeviceBreakpoint } from '@/hooks/use-device-breakpoint'
import { BannerSlide } from '@/types/banner-slide'

type HomeHeroProps = {
  slides: BannerSlide[]
  fallback: SportsHeroContent
}

export function HomeHero({ slides, fallback }: HomeHeroProps) {
  const { isMobile, isReady } = useDeviceBreakpoint()

  const visibleSlides = useMemo(() => {
    if (!slides.length) return []
    return filterSlidesForViewport(slides, isReady ? isMobile : false)
  }, [slides, isMobile, isReady])

  if (!visibleSlides.length) {
    if (isReady) {
      return <SportsHero content={fallback} />
    }
    return (
      <div
        className="relative aspect-[4/5] max-h-[88vh] w-full bg-ink sm:aspect-[16/9] lg:aspect-[21/9]"
        aria-busy="true"
        aria-label="Carregando banner"
      />
    )
  }

  return <BannerCarousel slides={visibleSlides} />
}
