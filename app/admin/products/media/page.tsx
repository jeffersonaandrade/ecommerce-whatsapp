import { Metadata } from 'next'
import { AdminPageHeader } from '@/components/admin/admin-page-header'
import { MediaCenter } from '@/components/admin/media/media-center'
import { fetchMediaStatusCounts } from '@/lib/catalog/product-aggregates'
import { queryProductsAdmin } from '@/lib/products'
import { getStoreSettings } from '@/lib/store/settings-repository'
import { getSupabaseUrl } from '@/lib/supabase/env'
import type { ProductQuery } from '@/lib/query'
import type { MediaFilter } from '@/lib/catalog/media/types'
import type { ProductStatus } from '@/types/product'

const VALID_STATUSES = new Set<ProductStatus>(['active', 'draft', 'unavailable'])
const VALID_MEDIA = new Set<MediaFilter>(['empty', 'external', 'broken', 'storage'])

export const metadata: Metadata = {
  title: 'Admin - Central de Mídia',
  description: 'Inventário e migração de imagens do catálogo',
}

export default async function AdminProductsMediaPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | undefined>>
}) {
  const params = await searchParams
  const isUploadTab = params.tab === 'upload'
  const pageSize = [25, 50, 100, 200].includes(Number(params.size))
    ? Number(params.size)
    : 25

  const rawStatus = params.status as ProductStatus | undefined
  const status = rawStatus && VALID_STATUSES.has(rawStatus) ? [rawStatus] : undefined

  const rawMedia = params.media as MediaFilter | undefined
  const mediaStatus =
    rawMedia && VALID_MEDIA.has(rawMedia) ? rawMedia : undefined

  const query: ProductQuery = {
    fields: 'list',
    filters: {
      search: params.q || undefined,
      status,
      mediaStatus,
    },
    sort: { by: 'name', dir: 'asc' },
    pagination: {
      page: Math.max(1, parseInt(params.page ?? '1', 10) || 1),
      pageSize,
    },
  }

  const [result, mediaStatusCounts, storeSettings] = await Promise.all([
    queryProductsAdmin(query),
    fetchMediaStatusCounts(),
    getStoreSettings(),
  ])

  const currentParams = new URLSearchParams(
    Object.entries(params).filter(([, v]) => v != null) as [string, string][]
  )

  let supabaseUrl = ''
  try {
    supabaseUrl = getSupabaseUrl()
  } catch {
    supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL ?? ''
  }

  const productStatusCounts: Record<string, number> = {
    all: result.counts.all,
    active: result.counts.active,
    draft: result.counts.draft,
    unavailable: result.counts.unavailable,
  }

  const mapProduct = (p: (typeof result.products)[number]) => ({
    id: p.id,
    name: p.name,
    slug: p.slug,
    sku: p.variations[0]?.sku ?? null,
    images: p.images,
    productStatus: p.status,
  })

  const mapProducts = result.products.map(mapProduct)

  return (
    <div className="w-full">
      <AdminPageHeader
        title="Central de Mídia"
        subtitle="Inventário, associação e upload em lote para migração de imagens"
        back={{ href: '/admin/products', label: 'Produtos' }}
      />

      <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        <MediaCenter
          initialTab={isUploadTab ? 'upload' : 'inventory'}
          pageProducts={mapProducts}
          supabaseUrl={supabaseUrl}
          page={result.page}
          pageSize={result.pageSize}
          total={result.total}
          totalPages={result.totalPages}
          currentParams={currentParams}
          productStatusCounts={productStatusCounts}
          mediaStatusCounts={mediaStatusCounts}
          searchDefault={params.q ?? ''}
          storePersonalizationEnabled={storeSettings.personalizationEnabled}
        />
      </div>
    </div>
  )
}
