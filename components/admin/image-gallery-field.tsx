'use client'

import Image from 'next/image'
import { useRef } from 'react'
import { Button } from '@/components/ui/button'

const MAX_IMAGES = 5

type ImageGalleryFieldProps = {
  images: string[]
  onChange: (images: string[]) => void
  error?: string
}

export function ImageGalleryField({
  images,
  onChange,
  error,
}: ImageGalleryFieldProps) {
  const fileRef = useRef<HTMLInputElement>(null)
  const urlRef = useRef<HTMLInputElement>(null)

  function addUrl() {
    const value = urlRef.current?.value.trim()
    if (!value || images.length >= MAX_IMAGES) return
    onChange([...images, value])
    if (urlRef.current) urlRef.current.value = ''
  }

  function handleFile(file: File) {
    if (images.length >= MAX_IMAGES) return
    const reader = new FileReader()
    reader.onload = () => {
      const result = reader.result
      if (typeof result === 'string') {
        onChange([...images, result])
      }
    }
    reader.readAsDataURL(file)
  }

  function removeAt(index: number) {
    onChange(images.filter((_, i) => i !== index))
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-col sm:flex-row gap-2">
        <input
          ref={urlRef}
          type="url"
          placeholder="https://exemplo.com/imagem.jpg"
          className="flex-1 rounded-lg border border-gray-300 px-3 py-2 text-sm"
        />
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={addUrl}
          disabled={images.length >= MAX_IMAGES}
        >
          Adicionar URL
        </Button>
        <input
          ref={fileRef}
          type="file"
          accept="image/*"
          className="hidden"
          onChange={(e) => {
            const file = e.target.files?.[0]
            if (file) handleFile(file)
            e.target.value = ''
          }}
        />
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={() => fileRef.current?.click()}
          disabled={images.length >= MAX_IMAGES}
        >
          Upload preview
        </Button>
      </div>

      <p className="text-xs text-gray-500">
        {images.length}/{MAX_IMAGES} imagens — a primeira é a principal
      </p>

      {images.length > 0 && (
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
          {images.map((src, index) => (
            <div
              key={`${src.slice(0, 32)}-${index}`}
              className="relative aspect-square rounded-lg overflow-hidden border border-gray-200 bg-gray-50"
            >
              <Image
                src={src}
                alt={`Imagem ${index + 1}`}
                fill
                className="object-cover"
                unoptimized
                sizes="150px"
              />
              {index === 0 && (
                <span className="absolute top-1 left-1 bg-black/70 text-white text-xs px-2 py-0.5 rounded">
                  Principal
                </span>
              )}
              <button
                type="button"
                onClick={() => removeAt(index)}
                className="absolute top-1 right-1 bg-red-600 text-white text-xs px-2 py-0.5 rounded hover:bg-red-700"
              >
                Remover
              </button>
            </div>
          ))}
        </div>
      )}

      {error && <p className="text-sm text-red-600">{error}</p>}
    </div>
  )
}
