'use client'

import { useState } from 'react'

type ProductImageProps = {
  src: string
  alt: string
  className?: string
  fill?: boolean
  sizes?: string
  priority?: boolean
}

export function ProductImage({
  src,
  alt,
  className = '',
  fill = false,
}: ProductImageProps) {
  const [failed, setFailed] = useState(false)

  if (!src || failed) {
    return (
      <div
        className={`flex items-center justify-center bg-soft-cloud text-xs font-medium text-mute ${fill ? 'absolute inset-0' : 'aspect-square w-full'} ${className}`}
        aria-label={alt}
      >
        Sem imagem
      </div>
    )
  }

  return (
    // eslint-disable-next-line @next/next/no-img-element
    <img
      src={src}
      alt={alt}
      loading="lazy"
      onError={() => setFailed(true)}
      className={`object-cover ${fill ? 'absolute inset-0 h-full w-full' : 'h-full w-full'} ${className}`}
    />
  )
}
