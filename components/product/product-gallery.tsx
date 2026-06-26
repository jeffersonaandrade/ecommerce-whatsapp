'use client'

import { useCallback, useState } from 'react'
import { ChevronLeft, ChevronRight } from 'lucide-react'
import { ProductImage } from './product-image'

type ProductGalleryProps = {
  images: string[]
  alt: string
}

export function ProductGallery({ images, alt }: ProductGalleryProps) {
  const safeImages = images.filter(Boolean)
  const [activeIndex, setActiveIndex] = useState(0)
  const count = safeImages.length
  const hasMultiple = count > 1

  const goTo = useCallback(
    (index: number) => {
      if (count === 0) return
      const next = ((index % count) + count) % count
      setActiveIndex(next)
    },
    [count]
  )

  const goPrev = useCallback(() => goTo(activeIndex - 1), [activeIndex, goTo])
  const goNext = useCallback(() => goTo(activeIndex + 1), [activeIndex, goTo])

  if (count === 0) {
    return (
      <div className="relative aspect-square overflow-hidden bg-soft-cloud">
        <ProductImage src="" alt={alt} fill priority />
      </div>
    )
  }

  return (
    <div className="space-y-3">
      <div className="group relative aspect-square overflow-hidden bg-soft-cloud">
        <ProductImage
          key={safeImages[activeIndex]}
          src={safeImages[activeIndex]}
          alt={`${alt} — imagem ${activeIndex + 1}`}
          fill
          priority={activeIndex === 0}
        />

        {hasMultiple && (
          <>
            <button
              type="button"
              onClick={goPrev}
              aria-label="Imagem anterior"
              className="absolute left-2 top-1/2 flex h-10 w-10 -translate-y-1/2 items-center justify-center rounded-full border border-hairline bg-canvas/90 text-ink opacity-0 shadow-sm transition-opacity hover:bg-canvas focus:opacity-100 focus:outline-none focus:ring-2 focus:ring-ink group-hover:opacity-100"
            >
              <ChevronLeft className="h-5 w-5" aria-hidden />
            </button>
            <button
              type="button"
              onClick={goNext}
              aria-label="Próxima imagem"
              className="absolute right-2 top-1/2 flex h-10 w-10 -translate-y-1/2 items-center justify-center rounded-full border border-hairline bg-canvas/90 text-ink opacity-0 shadow-sm transition-opacity hover:bg-canvas focus:opacity-100 focus:outline-none focus:ring-2 focus:ring-ink group-hover:opacity-100"
            >
              <ChevronRight className="h-5 w-5" aria-hidden />
            </button>
            <p className="pointer-events-none absolute bottom-3 left-1/2 -translate-x-1/2 rounded-full bg-ink/70 px-3 py-1 text-xs font-medium text-canvas">
              {activeIndex + 1} / {count}
            </p>
          </>
        )}
      </div>

      {hasMultiple && (
        <div className="grid grid-cols-4 gap-2 sm:grid-cols-5">
          {safeImages.map((image, idx) => {
            const selected = idx === activeIndex
            return (
              <button
                key={`${image}-${idx}`}
                type="button"
                aria-label={`Ver imagem ${idx + 1}`}
                aria-current={selected ? 'true' : undefined}
                onClick={() => setActiveIndex(idx)}
                className={`relative aspect-square overflow-hidden bg-soft-cloud ring-2 ring-offset-2 transition-all ${
                  selected ? 'ring-ink opacity-100' : 'ring-transparent opacity-70 hover:opacity-100'
                }`}
              >
                <ProductImage src={image} alt={`${alt} ${idx + 1}`} fill />
              </button>
            )
          })}
        </div>
      )}
    </div>
  )
}
