import { Metadata } from 'next'
import Link from 'next/link'
import { getButtonClassName } from '@/components/ui/button'
import { AdminListPage } from '@/components/admin/admin-list-page'
import { AdminPageHeader } from '@/components/admin/admin-page-header'
import { AdminPagination } from '@/components/admin/admin-pagination'
import { SearchBar } from '@/components/admin/search-bar'
import { StatusTabs } from '@/components/admin/status-tabs'
import { FilterBar } from '@/components/admin/filter-bar'
import { ProductsTable } from '@/components/admin/products-table'
import { queryProductsAdmin } from '@/lib/products'
import { getAllCategoriesAdmin } from '@/lib/categories'
import { getStoreSettings } from '@/lib/store/settings-repository'
import type { ProductQuery, ProductFilters, ProductSort } from '@/lib/query'
import type { ProductStatus } from '@/types/product'

export const metadata: Metadata = {
  title: 'Admin - Produtos',
  description: 'Gerencie os produtos da loja',
}

const STATUS_LABELS: Record<string, string> = {
  active: 'Ativos',
  draft: 'Rascunho',
  unavailable: 'Indisponível',
  noStock: 'Sem estoque',
}

const VALID_STATUSES = new Set<ProductStatus>(['active', 'draft', 'unavailable'])
const VALID_SORT = new Set<ProductSort['by']>(['name', 'price', 'createdAt'])

export default async function AdminProductsPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | undefined>>
}) {
  const params = await searchParams

  const rawStatus = params.status as string | undefined
  const isNoStockFilter = rawStatus === 'noStock'
  const status =
    rawStatus && VALID_STATUSES.has(rawStatus as ProductStatus)
      ? [rawStatus as ProductStatus]
      : undefined

  const rawSort = params.sort as ProductSort['by'] | undefined
  const sortBy = rawSort && VALID_SORT.has(rawSort) ? rawSort : 'createdAt'

  const filters: ProductFilters = {
    status,
    hasStock: isNoStockFilter ? false : undefined,
    category: params.category || undefined,
    search: params.q || undefined,
    batchId: params.batch || undefined,
  }

  const query: ProductQuery = {
    fields: 'list',
    filters,
    sort: {
      by: sortBy,
      dir: params.dir === 'asc' ? 'asc' : 'desc',
    },
    pagination: {
      page: Math.max(1, parseInt(params.page ?? '1', 10) || 1),
      pageSize: [25, 50, 100, 200].includes(Number(params.size))
        ? Number(params.size)
        : 25,
    },
  }

  const [result, categories, storeSettings] = await Promise.all([
    queryProductsAdmin(query),
    getAllCategoriesAdmin(),
    getStoreSettings(),
  ])

  const currentParams = new URLSearchParams(
    Object.entries(params).filter(([, v]) => v != null) as [string, string][]
  )

  const statusCounts: Record<string, number> = {
    all: result.counts.all,
    active: result.counts.active,
    draft: result.counts.draft,
    unavailable: result.counts.unavailable,
    noStock: result.counts.noStock,
  }

  return (
    <div className="w-full">
      <AdminPageHeader
        title="Gerenciar Produtos"
        subtitle={`${result.total} produto${result.total !== 1 ? 's' : ''} encontrado${result.total !== 1 ? 's' : ''}`}
        actions={
          <div className="flex flex-wrap gap-3">
            <Link
              href="/admin/import"
              className={getButtonClassName('secondary', 'md', '!text-ink')}
            >
              Importar CSV
            </Link>
            <Link
              href="/admin/products/media"
              className={getButtonClassName('secondary', 'md', '!text-ink')}
            >
              Central de Mídia
            </Link>
            <Link
              href="/admin/products/new"
              className={getButtonClassName('secondary', 'md', '!text-ink')}
            >
              + Novo Produto
            </Link>
          </div>
        }
      />

      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-8">
        {params.batch && (
          <div className="mb-4 rounded-lg border border-blue-200 bg-blue-50 px-4 py-3 text-sm text-blue-800">
            Mostrando produtos da importação mais recente.{' '}
            <a href="/admin/products" className="font-medium underline">
              Ver todos os produtos
            </a>
          </div>
        )}
        <AdminListPage
          header={<span />}
          toolbar={
            <div className="space-y-3">
              <div className="flex flex-wrap gap-2">
                <SearchBar
                  placeholder="Buscar por nome ou SKU..."
                  defaultValue={params.q ?? ''}
                />
                <FilterBar categories={categories} />
              </div>
              <StatusTabs
                counts={statusCounts}
                labels={STATUS_LABELS}
                paramName="status"
              />
            </div>
          }
          content={<ProductsTable products={result.products} storePersonalizationEnabled={storeSettings.personalizationEnabled} categories={categories} />}
          footer={
            <AdminPagination
              page={result.page}
              pageSize={result.pageSize}
              total={result.total}
              totalPages={result.totalPages}
              basePath="/admin/products"
              currentParams={currentParams}
            />
          }
        />
      </div>
    </div>
  )
}
