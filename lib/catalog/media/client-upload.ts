'use client'

import type { SupabaseClient } from '@supabase/supabase-js'
import { validateImageFile } from '@/lib/media/validate-image-file'
import { buildUniqueStoragePath } from './validate-image-path'

export type ClientUploadResult = {
  path: string
  publicUrl: string
}

export function validateClientUploadFile(file: File): string | null {
  return validateImageFile(file, {
    sizeMessage: 'Arquivo excede 5 MB',
    formatMessage: 'Formato inválido',
    allowExtensionFallback: false,
  })
}

function extFromFile(file: File): string {
  const fromName = file.name.split('.').pop()?.toLowerCase()
  if (fromName === 'jpeg' || fromName === 'jpg') return 'jpg'
  if (fromName === 'png') return 'png'
  if (fromName === 'webp') return 'webp'
  if (file.type === 'image/png') return 'png'
  if (file.type === 'image/webp') return 'webp'
  return 'jpg'
}

export async function uploadProductImageClient(options: {
  supabase: SupabaseClient
  productId: string
  file: File
  supabaseUrl: string
}): Promise<ClientUploadResult> {
  const validation = validateClientUploadFile(options.file)
  if (validation) throw new Error(validation)

  const path = buildUniqueStoragePath(options.productId, extFromFile(options.file))
  const { error } = await options.supabase.storage
    .from('products')
    .upload(path, options.file, {
      upsert: false,
      contentType: options.file.type || 'image/jpeg',
    })

  if (error) throw new Error(error.message)

  const base = options.supabaseUrl.replace(/\/$/, '')
  return {
    path,
    publicUrl: `${base}/storage/v1/object/public/products/${path}`,
  }
}

export type UploadQueueRunnerOptions = {
  supabase: SupabaseClient
  supabaseUrl: string
  items: Array<{ productId: string; file: File; id: string }>
  concurrency?: number
  maxRetries?: number
  signal?: AbortSignal
  onItemStart?: (id: string, productId: string) => void
  onItemComplete?: (id: string, productId: string, result: ClientUploadResult) => void
  onItemError?: (id: string, productId: string, error: string) => void
}

export async function runUploadQueue(options: UploadQueueRunnerOptions): Promise<void> {
  const concurrency = options.concurrency ?? 3
  const maxRetries = options.maxRetries ?? 2
  let index = 0

  async function worker() {
    while (index < options.items.length) {
      if (options.signal?.aborted) return
      const current = options.items[index++]
      options.onItemStart?.(current.id, current.productId)

      let lastError = 'Falha no upload'
      for (let attempt = 0; attempt <= maxRetries; attempt++) {
        if (options.signal?.aborted) return
        try {
          const result = await uploadProductImageClient({
            supabase: options.supabase,
            productId: current.productId,
            file: current.file,
            supabaseUrl: options.supabaseUrl,
          })
          options.onItemComplete?.(current.id, current.productId, result)
          lastError = ''
          break
        } catch (err) {
          lastError = err instanceof Error ? err.message : 'Falha no upload'
          if (attempt < maxRetries) {
            await new Promise((r) => setTimeout(r, 400 * (attempt + 1)))
          }
        }
      }

      if (lastError) options.onItemError?.(current.id, current.productId, lastError)
    }
  }

  await Promise.all(Array.from({ length: concurrency }, () => worker()))
}
