'use client'

import Image from 'next/image'
import { useRef, useState } from 'react'
import { Button } from '@/components/ui/button'
import { uploadProductImageAction } from '@/lib/catalog/actions'
import { validateImageFile } from '@/lib/media/validate-image-file'

const MAX_IMAGES = 5

export function moveImageToPosition(
  images: string[],
  fromIndex: number,
  toPosition: number
): string[] {
  const toIndex = toPosition - 1
  if (
    fromIndex < 0 ||
    fromIndex >= images.length ||
    toIndex < 0 ||
    toIndex >= images.length ||
    fromIndex === toIndex
  ) {
    return images
  }

  const next = [...images]
  const [item] = next.splice(fromIndex, 1)
  next.splice(toIndex, 0, item)
  return next
}

type ImageGalleryFieldProps = {
  images: string[]
  onChange: (images: string[]) => void
  error?: string
  productSlug?: string
  uploadEnabled?: boolean
}

type UploadProgress = {
  completed: number
  total: number
}

export function ImageGalleryField({
  images,
  onChange,
  error,
  productSlug = '',
  uploadEnabled = false,
}: ImageGalleryFieldProps) {
  const fileRef = useRef<HTMLInputElement>(null)
  const urlRef = useRef<HTMLInputElement>(null)
  const [uploading, setUploading] = useState(false)
  const [uploadProgress, setUploadProgress] = useState<UploadProgress | null>(null)
  const [uploadError, setUploadError] = useState<string | null>(null)

  function addUrl() {
    const value = urlRef.current?.value.trim()
    if (!value || images.length >= MAX_IMAGES) return

    if (value.startsWith('data:')) {
      setUploadError('URLs base64 não são permitidas. Use upload ou URL https.')
      return
    }

    setUploadError(null)
    onChange([...images, value])
    if (urlRef.current) urlRef.current.value = ''
  }

  async function handleFiles(fileList: FileList) {
    const availableSlots = MAX_IMAGES - images.length
    if (availableSlots <= 0) return

    const requestedFiles = Array.from(fileList)
    const selectedFiles = requestedFiles.slice(0, availableSlots)
    const errors: string[] = []
    const uploadedUrls: string[] = []

    if (requestedFiles.length > availableSlots) {
      const ignoredCount = requestedFiles.length - availableSlots
      errors.push(
        `${ignoredCount} ${ignoredCount === 1 ? 'arquivo foi ignorado' : 'arquivos foram ignorados'}: o limite é de ${MAX_IMAGES} imagens.`,
      )
    }

    setUploadError(errors.length > 0 ? errors.join(' ') : null)
    setUploading(true)
    setUploadProgress({ completed: 0, total: selectedFiles.length })

    for (const [index, file] of selectedFiles.entries()) {
      const validationError = validateImageFile(file, { allowExtensionFallback: false })
      if (validationError) {
        errors.push(`${file.name}: ${validationError}`)
        setUploadProgress({ completed: index + 1, total: selectedFiles.length })
        continue
      }

      try {
        const formData = new FormData()
        formData.set('image', file)
        formData.set('productSlug', productSlug)

        const result = await uploadProductImageAction(formData)
        if (result.ok) {
          uploadedUrls.push(result.url)
        } else {
          errors.push(`${file.name}: ${result.error}`)
        }
      } catch {
        errors.push(`${file.name}: falha ao enviar. Tente novamente.`)
      }

      setUploadProgress({ completed: index + 1, total: selectedFiles.length })
    }

    if (uploadedUrls.length > 0) {
      onChange([...images, ...uploadedUrls])
    }

    setUploadError(errors.length > 0 ? errors.join(' ') : null)
    setUploading(false)
    setUploadProgress(null)
  }

  function removeAt(index: number) {
    onChange(images.filter((_, i) => i !== index))
  }

  function handlePositionChange(fromIndex: number, toPosition: number) {
    onChange(moveImageToPosition(images, fromIndex, toPosition))
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
        {uploadEnabled ? (
          <>
            <input
              ref={fileRef}
              type="file"
              multiple
              accept="image/png,image/jpeg,image/webp"
              aria-label="Selecionar imagens do produto"
              className="hidden"
              onChange={(e) => {
                const files = e.target.files
                if (files?.length) void handleFiles(files)
                e.target.value = ''
              }}
            />
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => fileRef.current?.click()}
              disabled={images.length >= MAX_IMAGES || uploading}
            >
              {uploading && uploadProgress
                ? `Enviando ${uploadProgress.completed}/${uploadProgress.total}...`
                : 'Enviar imagens'}
            </Button>
          </>
        ) : null}
      </div>

      {!uploadEnabled ? (
        <p className="text-xs text-gray-500">
          Upload de arquivo requer Supabase. Use URL externa.
        </p>
      ) : null}

      <p className="text-xs text-gray-500">
        {images.length}/{MAX_IMAGES} imagens — a posição <strong>1</strong> é a foto em destaque na loja
      </p>

      {(uploadError || error) && (
        <p className="text-sm text-red-600">{uploadError ?? error}</p>
      )}

      {images.length > 0 && (
        <div className="space-y-3">
          {images.map((src, index) => (
            <div
              key={`${src.slice(0, 48)}-${index}`}
              className="flex flex-col gap-3 rounded-lg border border-gray-200 bg-gray-50 p-3 sm:flex-row sm:items-center"
            >
              <div className="relative aspect-square w-full shrink-0 overflow-hidden rounded-lg border border-gray-200 bg-white sm:h-24 sm:w-24">
                <Image
                  src={src}
                  alt={`Imagem ${index + 1}`}
                  fill
                  className="object-cover"
                  unoptimized
                  sizes="96px"
                />
                {index === 0 && (
                  <span className="absolute top-1 left-1 rounded bg-black/70 px-2 py-0.5 text-xs text-white">
                    Destaque
                  </span>
                )}
              </div>

              <div className="min-w-0 flex-1 space-y-2">
                <label className="block space-y-1">
                  <span className="text-xs font-medium text-gray-700">
                    Posição na loja
                  </span>
                  <select
                    value={index + 1}
                    onChange={(e) =>
                      handlePositionChange(index, Number.parseInt(e.target.value, 10))
                    }
                    aria-label={`Posição da imagem ${index + 1}`}
                    className="w-full max-w-[12rem] rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm"
                  >
                    {images.map((_, positionIndex) => (
                      <option key={positionIndex + 1} value={positionIndex + 1}>
                        {positionIndex + 1}
                        {positionIndex === 0 ? ' — destaque na vitrine' : ''}
                      </option>
                    ))}
                  </select>
                </label>
                <p className="truncate text-xs text-gray-500" title={src}>
                  {src}
                </p>
              </div>

              <button
                type="button"
                onClick={() => removeAt(index)}
                className="self-start rounded bg-red-600 px-3 py-1.5 text-xs text-white hover:bg-red-700 sm:self-center"
              >
                Remover
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
