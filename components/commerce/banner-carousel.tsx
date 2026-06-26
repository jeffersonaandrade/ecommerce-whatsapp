'use client'

import { useEffect, useRef, useState, useCallback } from 'react'
import Link from 'next/link'
import { getButtonClassName } from '@/components/ui/button'
import { BannerSlide } from '@/types/banner-slide'
import { bannerImageUrl } from '@/lib/banners/banner-image-url'

type BannerCarouselProps = {
  slides: BannerSlide[]
}

export function BannerCarousel({ slides }: BannerCarouselProps) {
  const [current, setCurrent] = useState(0)
  const [paused, setPaused] = useState(false)
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const single = slides.length === 1

  const goTo = useCallback((index: number) => {
    setCurrent(index)
    setPaused(true)
  }, [])

  const prev = useCallback(() => {
    setCurrent((c) => (c - 1 + slides.length) % slides.length)
    setPaused(true)
  }, [slides.length])

  const next = useCallback(() => {
    setCurrent((c) => (c + 1) % slides.length)
    setPaused(true)
  }, [slides.length])

  useEffect(() => {
    if (single || paused) return
    timerRef.current = setTimeout(() => {
      setCurrent((c) => (c + 1) % slides.length)
    }, 5000)
    return () => {
      if (timerRef.current) clearTimeout(timerRef.current)
    }
  }, [current, paused, single, slides.length])

  // resume auto-play 8s after user interaction
  useEffect(() => {
    if (!paused) return
    const t = setTimeout(() => setPaused(false), 8000)
    return () => clearTimeout(t)
  }, [paused])

  const slide = slides[current]

  return (
    <section
      className="relative w-full"
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
    >
      <div className="relative flex min-h-[75vh] flex-col justify-end overflow-hidden lg:min-h-[88vh]">
        {slides.map((s, i) => {
          const desktopSrc = bannerImageUrl(s.id, 'desktop', s.updatedAt)
          const mobileSrc = s.mobileImagePath
            ? bannerImageUrl(s.id, 'mobile', s.updatedAt)
            : desktopSrc

          return (
            <div
              key={s.id}
              aria-hidden={i !== current}
              className={`absolute inset-0 transition-opacity duration-700 ${
                i === current ? 'opacity-100' : 'opacity-0 pointer-events-none'
              }`}
            >
              <picture>
                <source media="(max-width: 768px)" srcSet={mobileSrc} />
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={desktopSrc}
                  alt={s.title ?? ''}
                  className="absolute inset-0 h-full w-full object-cover object-center"
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
              aria-label="Slide anterior"
              className="absolute left-4 top-1/2 z-10 -translate-y-1/2 rounded-full bg-ink/40 p-2 text-canvas hover:bg-ink/60 transition-colors"
            >
              <svg width="20" height="20" viewBox="0 0 20 20" fill="none" aria-hidden>
                <path d="M13 4l-6 6 6 6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </button>
            <button
              type="button"
              onClick={next}
              aria-label="Próximo slide"
              className="absolute right-4 top-1/2 z-10 -translate-y-1/2 rounded-full bg-ink/40 p-2 text-canvas hover:bg-ink/60 transition-colors"
            >
              <svg width="20" height="20" viewBox="0 0 20 20" fill="none" aria-hidden>
                <path d="M7 4l6 6-6 6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
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
              aria-label={`Ir para slide ${i + 1}`}
              className={`h-2 rounded-full transition-all ${
                i === current ? 'w-6 bg-canvas' : 'w-2 bg-canvas/50'
              }`}
            />
          ))}
        </div>
      )}
    </section>
  )
}
