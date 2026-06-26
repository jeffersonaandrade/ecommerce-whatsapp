export type MediaStatus = 'empty' | 'external' | 'storage' | 'broken' | 'checking'

export type MediaFilter = 'all' | 'empty' | 'external' | 'broken' | 'storage'

export type MediaProductSummary = {
  id: string
  name: string
  slug: string
  sku: string | null
  images: string[]
  initialStatus: MediaStatus
}

export type ImageProbeMap = Record<string, boolean>

export type MediaMapProduct = {
  id: string
  name: string
  slug: string
  sku: string | null
  images: string[]
}

export type ImageUpdateMode = 'replace' | 'append'

export type BulkImageItem = {
  productId: string
  paths: string[]
  mode?: ImageUpdateMode
}

export type UploadQueueItem = {
  file: File
  productId: string
  productSlug: string
  order: number
  status: 'pending' | 'uploading' | 'uploaded' | 'failed'
  path?: string
  publicUrl?: string
  error?: string
}

export type UploadReportRow = {
  productId: string
  slug: string
  status: 'success' | 'partial' | 'failed' | 'skipped'
  filesUploaded: number
  errors: string
}
