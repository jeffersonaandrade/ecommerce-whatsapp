'use client'

import { useCallback, useEffect, useRef, useState } from 'react'
import Link from 'next/link'
import { useReducedMotion } from 'framer-motion'
import { getButtonClassName } from '@/components/ui/button'
import { BannerSlide } from '@/types/banner-slide'
import {
  getBannerPreloadIndices,
  preloadBannerImageUrl,
} from '@/lib/banners/banner-preload'
import { resolveBannerSlidePreloadSrc } from '@/lib/banners/banner-slide-image'
import { resolveSlidePictureSources } from '@/lib/banners/banner-viewport'
import { useDeviceBreakpoint } from '@/hooks/use-device-breakpoint'

const AUTOPLAY_MS = 5000
const RESUME_AFTER_INTERACTION_MS = 8000
const LOAD_TIMEOUT_MS = 8000

type BannerCarouselProps = {
  slides: BannerSlide[]
}

export function BannerCarousel({ slides }: BannerCarouselProps) {
  const [current, setCurrent] = useState(0)
  const [displayed, setDisplayed] = useState(0)
  const [loadedIds, setLoadedIds] = useState<Set<string>>(() => new Set())
  const [paused, setPaused] = useState(false)
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const prefersReducedMotion = useReducedMotion() ?? false
  const { isMobile, isReady } = useDeviceBreakpoint()

  const single = slides.length === 1
  const transitionClass = prefersReducedMotion
    ? 'transition-none'
    : 'transition-opacity duration-700'

  const pauseInteraction = useCallback(() => setPaused(true), [])

  const markLoaded = useCallback((slideId: string) => {
    setLoadedIds((prev) => {
      if (prev.has(slideId)) return prev
      const next = new Set(prev)
      next.add(slideId)
      return next
    })
  }, [])

  const goTo = useCallback(
    (index: number) => {
      setCurrent(index)
      pauseInteraction()
    },
    [pauseInteraction]
  )

  const prev = useCallback(() => {
    setCurrent((c) => (c - 1 + slides.length) % slides.length)
    pauseInteraction()
  }, [slides.length, pauseInteraction])

  const next = useCallback(() => {
    setCurrent((c) => (c + 1) % slides.length)
    pauseInteraction()
  }, [slides.length, pauseInteraction])

  // Sync displayed slide when target is loaded (or immediately if already loaded)
  useEffect(() => {
    const target = slides[current]
    if (!target) return
    if (loadedIds.has(target.id)) {
      setDisplayed(current)
    }
  }, [current, loadedIds, slides])

  // Fallback: show target after timeout even if image failed to load
  useEffect(() => {
    if (current === displayed) return
    const t = setTimeout(() => setDisplayed(current), LOAD_TIMEOUT_MS)
    return () => clearTimeout(t)
  }, [current, displayed])

  // Autoplay
  useEffect(() => {
    if (single || paused || prefersReducedMotion) return
    timerRef.current = setTimeout(() => {
      setCurrent((c) => (c + 1) % slides.length)
    }, AUTOPLAY_MS)
    return () => {
      if (timerRef.current) clearTimeout(timerRef.current)
    }
  }, [current, paused, single, slides.length, prefersReducedMotion])

  // Resume autoplay after interaction
  useEffect(() => {
    if (!paused || prefersReducedMotion) return
    const t = setTimeout(() => setPaused(false), RESUME_AFTER_INTERACTION_MS)
    return () => clearTimeout(t)
  }, [paused, prefersReducedMotion])

  // Preload adjacent slides (policy: neighbors if <=5, else next only)
  useEffect(() => {
    if (!isReady || slides.length <= 1) return
    const indices = getBannerPreloadIndices(current, slides.length)
    for (const index of indices) {
      const slide = slides[index]
      if (!slide) continue
      const src = resolveBannerSlidePreloadSrc(slide, isMobile)
      if (src) preloadBannerImageUrl(src)
    }
  }, [current, slides, isMobile, isReady])

  const slide = slides[displayed] ?? slides[0]

  if (!slide) return null

  return (
    <section
      className="relative w-full"
      data-testid="banner-carousel"
      onMouseEnter={pauseInteraction}
      onMouseLeave={() => !prefersReducedMotion && setPaused(false)}
      onPointerDown={pauseInteraction}
      onTouchStart={pauseInteraction}
    >
      <div className="relative flex aspect-[4/5] max-h-[88vh] w-full flex-col justify-end overflow-hidden bg-ink sm:aspect-[16/9] lg:aspect-[21/9]">
        {slides.map((s, i) => {
          const { desktopSrc, mobileSrc } = resolveSlidePictureSources(s)
          if (!desktopSrc) return null
          const isVisible = i === displayed

          return (
            <div
              key={s.id}
              aria-hidden={!isVisible}
              className={`absolute inset-0 ${transitionClass} ${
                isVisible ? 'opacity-100' : 'opacity-0 pointer-events-none'
              }`}
            >
              <picture>
                {mobileSrc && mobileSrc !== desktopSrc && (
                  <source media="(max-width: 768px)" srcSet={mobileSrc} />
                )}
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  ref={(el) => {
                    if (el?.complete) markLoaded(s.id)
                  }}
                  src={desktopSrc}
                  alt={s.title ?? ''}
                  className="absolute inset-0 h-full w-full object-cover object-center"
                  loading={i === 0 ? 'eager' : 'lazy'}
                  fetchPriority={i === 0 ? 'high' : 'auto'}
                  decoding="async"
                  onLoad={() => markLoaded(s.id)}
                />
              </picture>
            </div>
          )
        })}

        <div
          className="absolute inset-0 bg-gradient-to-t from-ink/80 via-ink/45 to-ink/25"
          aria-hidden
        />

        {(slide.title || slide.subtitle || slide.ctaLabel) && (
          <div className="relative z-10 mx-auto w-full max-w-7xl px-4 pb-10 pt-24 sm:px-6 sm:pb-14 lg:px-8 lg:pb-16">
            {slide.title && (
              <h1 className="max-w-3xl font-display text-4xl font-bold uppercase leading-[0.95] tracking-tight text-canvas sm:text-5xl lg:text-6xl xl:text-7xl">
                {slide.title}
                {slide.subtitle && (
                  <span className="block text-canvas/90">{slide.subtitle}</span>
                )}
              </h1>
            )}
            {slide.ctaLabel && slide.ctaHref && (
              <div className="mt-8">
                <Link
                  href={slide.ctaHref}
                  className={getButtonClassName('default', 'lg', 'w-full sm:w-auto')}
                >
                  {slide.ctaLabel}
                </Link>
              </div>
            )}
          </div>
        )}

        {!single && (
          <>
            <button
              type="button"
              onClick={prev}
              onFocus={pauseInteraction}
              aria-label="Slide anterior"
              className="absolute left-4 top-1/2 z-10 -translate-y-1/2 rounded-full bg-ink/40 p-2 text-canvas hover:bg-ink/60 transition-colors"
            >
              <svg width="20" height="20" viewBox="0 0 20 20" fill="none" aria-hidden>
                <path
                  d="M13 4l-6 6 6 6"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            </button>
            <button
              type="button"
              onClick={next}
              onFocus={pauseInteraction}
              aria-label="Próximo slide"
              className="absolute right-4 top-1/2 z-10 -translate-y-1/2 rounded-full bg-ink/40 p-2 text-canvas hover:bg-ink/60 transition-colors"
            >
              <svg width="20" height="20" viewBox="0 0 20 20" fill="none" aria-hidden>
                <path
                  d="M7 4l6 6-6 6"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            </button>
          </>
        )}
      </div>

      {!single && (
        <div className="absolute bottom-4 left-1/2 z-10 flex -translate-x-1/2 gap-2">
          {slides.map((_, i) => (
            <button
              key={i}
              type="button"
              onClick={() => goTo(i)}
              onFocus={pauseInteraction}
              aria-label={`Ir para slide ${i + 1}`}
              aria-current={i === displayed ? 'true' : undefined}
              className={`h-2 rounded-full transition-all ${
                i === displayed ? 'w-6 bg-canvas' : 'w-2 bg-canvas/50'
              }`}
            />
          ))}
        </div>
      )}
    </section>
  )
}
