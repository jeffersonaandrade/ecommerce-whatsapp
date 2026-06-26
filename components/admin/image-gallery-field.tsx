'use client'

import Image from 'next/image'
import { useRef, useState } from 'react'
import { Button } from '@/components/ui/button'
import { uploadProductImageAction } from '@/lib/catalog/actions'

const MAX_IMAGES = 5
const MAX_BYTES = 5 * 1024 * 1024
const ALLOWED_TYPES = ['image/png', 'image/jpeg', 'image/webp']

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

    setUploadError(null)
    setUploading(true)
    setUploadProgress({ completed: 0, total: selectedFiles.length })

    for (const [index, file] of selectedFiles.entries()) {
      if (!ALLOWED_TYPES.includes(file.type)) {
        errors.push(`${file.name}: formato aceito é PNG, JPG ou WebP.`)
        setUploadProgress({ completed: index + 1, total: selectedFiles.length })
        continue
      }

      if (file.size > MAX_BYTES) {
        errors.push(`${file.name}: a imagem deve ter no máximo 5 MB.`)
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
        {images.length}/{MAX_IMAGES} imagens — a primeira é a principal
      </p>

      {(uploadError || error) && (
        <p className="text-sm text-red-600">{uploadError ?? error}</p>
      )}

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
    </div>
  )
}
