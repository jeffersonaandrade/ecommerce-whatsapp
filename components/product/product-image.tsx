'use client'

import { useState } from 'react'
import Image from 'next/image'

type ProductImageProps = {
  src: string
  alt: string
  className?: string
  fill?: boolean
  sizes?: string
  priority?: boolean
  onLoadSuccess?: () => void
  onLoadError?: () => void
}

function isOptimizableSrc(src: string): boolean {
  if (!src || src.startsWith('data:')) return false
  try {
    const url = new URL(src, typeof window !== 'undefined' ? window.location.origin : 'http://localhost')
    return url.protocol === 'https:' || url.protocol === 'http:'
  } catch {
    return false
  }
}

export function ProductImage({
  src,
  alt,
  className = '',
  fill = false,
  sizes = '(max-width: 768px) 50vw, 25vw',
  priority = false,
  onLoadSuccess,
  onLoadError,
}: ProductImageProps) {
  const [failed, setFailed] = useState(false)

  const handleError = () => {
    setFailed(true)
    onLoadError?.()
  }

  const handleLoad = () => {
    onLoadSuccess?.()
  }

  if (!src || failed || !isOptimizableSrc(src)) {
    if (src && !failed && !isOptimizableSrc(src)) {
      return (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={src}
          alt={alt}
          loading={priority ? 'eager' : 'lazy'}
          onLoad={handleLoad}
          onError={handleError}
          className={`object-cover ${fill ? 'absolute inset-0 h-full w-full' : 'h-full w-full'} ${className}`}
        />
      )
    }

    return (
      <div
        className={`flex items-center justify-center bg-soft-cloud text-xs font-medium text-mute ${fill ? 'absolute inset-0' : 'aspect-square w-full'} ${className}`}
        aria-label={alt}
      >
        Sem imagem
      </div>
    )
  }

  if (fill) {
    return (
      <Image
        src={src}
        alt={alt}
        fill
        sizes={sizes}
        priority={priority}
        onError={handleError}
        onLoad={handleLoad}
        className={`object-cover ${className}`}
      />
    )
  }

  return (
    <div className={`relative aspect-square w-full overflow-hidden ${className}`}>
      <Image
        src={src}
        alt={alt}
        fill
        sizes={sizes}
        priority={priority}
        onError={handleError}
        onLoad={handleLoad}
        className="object-cover"
      />
    </div>
  )
}
