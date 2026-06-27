import { Metadata } from 'next'
import Link from 'next/link'
import { Badge } from '@/components/ui/badge'
import { getButtonClassName } from '@/components/ui/button'
import { AdminListPage } from '@/components/admin/admin-list-page'
import { AdminPageHeader } from '@/components/admin/admin-page-header'
import { AdminEmptyState } from '@/components/admin/admin-empty-state'
import { AdminPagination } from '@/components/admin/admin-pagination'
import { SearchBar } from '@/components/admin/search-bar'
import { StatusTabs } from '@/components/admin/status-tabs'
import { queryCategoriesAdmin } from '@/lib/categories'
import { getAllProductsAdmin } from '@/lib/products'
import { countProductsForCategory } from '@/lib/catalog/category-utils'
import type { CategoryQuery } from '@/lib/query'

export const metadata: Metadata = {
  title: 'Categorias',
  description: 'Gerenciar categorias da loja',
}

const VISIBILITY_LABELS: Record<string, string> = {
  visible: 'Visíveis',
  hidden: 'Ocultas',
}

export default async function AdminCategoriesPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | undefined>>
}) {
  const params = await searchParams

  const visibilityParam = params.status
  const visible =
    visibilityParam === 'visible' ? true
    : visibilityParam === 'hidden' ? false
    : undefined

  const query: CategoryQuery = {
    filters: {
      visible,
      search: params.q || undefined,
    },
    pagination: {
      page: Math.max(1, parseInt(params.page ?? '1', 10) || 1),
      pageSize: [25, 50, 100, 200].includes(Number(params.size))
        ? Number(params.size)
        : 25,
    },
  }

  const [result, products] = await Promise.all([
    queryCategoriesAdmin(query),
    getAllProductsAdmin(),
  ])

  const currentParams = new URLSearchParams(
    Object.entries(params).filter(([, v]) => v != null) as [string, string][]
  )

  // counts for visibility tabs
  const allResult = await queryCategoriesAdmin({ pagination: { pageSize: 999 } })
  const visibleCount = allResult.categories.filter((c) => c.visible).length
  const hiddenCount = allResult.categories.filter((c) => !c.visible).length
  const visibilityCounts = { visible: visibleCount, hidden: hiddenCount }

  return (
    <div className="w-full">
      <AdminPageHeader
        title="Categorias"
        subtitle="Crie, ordene e oculte categorias exibidas na vitrine."
        back={{ href: '/admin', label: 'Voltar ao Admin' }}
        actions={
          <Link
            href="/admin/categories/new"
            className={getButtonClassName('secondary', 'md', '!text-ink')}
          >
            + Nova categoria
          </Link>
        }
      />

      <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8 py-12">
        <AdminListPage
          header={<span />}
          toolbar={
            <div className="space-y-3">
              <SearchBar
                placeholder="Buscar por nome ou slug..."
                defaultValue={params.q ?? ''}
              />
              <StatusTabs
                counts={visibilityCounts}
                labels={VISIBILITY_LABELS}
                paramName="status"
              />
            </div>
          }
          content={
            result.categories.length === 0 ? (
              <AdminEmptyState message="Nenhuma categoria encontrada." />
            ) : (
              <div className="overflow-hidden rounded-lg border border-hairline bg-canvas">
                <table className="w-full">
                  <thead className="border-b border-hairline bg-soft-cloud">
                    <tr>
                      <th className="py-3 px-4 text-left text-sm font-semibold text-ink">Nome</th>
                      <th className="py-3 px-4 text-left text-sm font-semibold text-ink">Slug</th>
                      <th className="py-3 px-4 text-left text-sm font-semibold text-ink">Ordem</th>
                      <th className="py-3 px-4 text-left text-sm font-semibold text-ink">Produtos</th>
                      <th className="py-3 px-4 text-left text-sm font-semibold text-ink">Status</th>
                      <th className="py-3 px-4 text-left text-sm font-semibold text-ink">Ações</th>
                    </tr>
                  </thead>
                  <tbody>
                    {result.categories.map((category) => {
                      const { count, activeCount } = countProductsForCategory(category, products)
                      return (
                        <tr key={category.id} className="border-b border-hairline last:border-0 hover:bg-soft-cloud/50">
                          <td className="py-4 px-4 font-medium text-ink">{category.name}</td>
                          <td className="py-4 px-4 font-mono text-sm text-mute">{category.slug}</td>
                          <td className="py-4 px-4 text-sm text-mute">{category.sortOrder}</td>
                          <td className="py-4 px-4 text-sm text-mute">
                            {count} ({activeCount} ativo{activeCount !== 1 ? 's' : ''})
                          </td>
                          <td className="py-4 px-4">
                            <Badge variant={category.visible ? 'success' : 'default'}>
                              {category.visible ? 'Visível' : 'Oculta'}
                            </Badge>
                          </td>
                          <td className="py-4 px-4">
                            <Link
                              href={`/admin/categories/${category.id}/edit`}
                              className="text-sm font-medium text-ink hover:underline"
                            >
                              Editar
                            </Link>
                          </td>
                        </tr>
                      )
                    })}
                  </tbody>
                </table>
              </div>
            )
          }
          footer={
            <AdminPagination
              page={result.page}
              pageSize={result.pageSize}
              total={result.total}
              totalPages={result.totalPages}
              basePath="/admin/categories"
              currentParams={currentParams}
            />
          }
        />
      </div>
    </div>
  )
}
