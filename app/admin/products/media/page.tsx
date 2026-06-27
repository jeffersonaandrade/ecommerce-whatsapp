import { Metadata } from 'next'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import { MediaCenter } from '@/components/admin/media/media-center'
import { isMigrationToolsEnabled } from '@/lib/env/migration-tools'
import { getAllProductsAdmin, queryProductsAdmin } from '@/lib/products'
import { getSupabaseUrl } from '@/lib/supabase/env'
import type { ProductQuery } from '@/lib/query'

export const metadata: Metadata = {
  title: 'Admin - Central de Mídia',
  description: 'Inventário e migração de imagens do catálogo',
}

export default async function AdminProductsMediaPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | undefined>>
}) {
  if (!isMigrationToolsEnabled()) notFound()

  const params = await searchParams
  const pageSize = [25, 50, 100, 200].includes(Number(params.size))
    ? Number(params.size)
    : 25

  const query: ProductQuery = {
    filters: { search: params.q || undefined },
    sort: { by: 'name', dir: 'asc' },
    pagination: {
      page: Math.max(1, parseInt(params.page ?? '1', 10) || 1),
      pageSize,
    },
  }

  const [result, allProductsRaw] = await Promise.all([
    queryProductsAdmin(query),
    getAllProductsAdmin(),
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

  const mapProduct = (p: (typeof result.products)[number]) => ({
    id: p.id,
    name: p.name,
    slug: p.slug,
    sku: p.variations[0]?.sku ?? null,
    images: p.images,
  })

  const mapProducts = result.products.map(mapProduct)
  const allProducts = allProductsRaw.map(mapProduct)

  return (
    <div className="w-full">
      <div className="bg-ink py-8 text-canvas">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <p className="text-sm text-mute">
                <Link href="/admin/products" className="hover:text-canvas">
                  ← Produtos
                </Link>
              </p>
              <h1 className="text-3xl font-bold">Central de Mídia</h1>
              <p className="mt-1 text-mute">
                Inventário, associação e upload em lote para migração de imagens
              </p>
            </div>
          </div>
        </div>
      </div>

      <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        <MediaCenter
          pageProducts={mapProducts}
          allProducts={allProducts}
          supabaseUrl={supabaseUrl}
          page={result.page}
          pageSize={result.pageSize}
          total={result.total}
          totalPages={result.totalPages}
          currentParams={currentParams}
        />
      </div>
    </div>
  )
}
