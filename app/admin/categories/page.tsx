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
import { fetchCategoryVisibilityCounts, getAllCategoriesAdmin } from '@/lib/categories'
import { fetchProductsByCategoryCounts } from '@/lib/catalog/product-aggregates'
import { normalizeCategorySlug } from '@/lib/catalog/category-utils'
import { buildCategoryTree, flattenCategoryTree } from '@/lib/catalog/category-tree'

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

  const [allCategories, categoryCounts, visibilityCounts] = await Promise.all([
    getAllCategoriesAdmin(),
    fetchProductsByCategoryCounts(),
    fetchCategoryVisibilityCounts(),
  ])

  const search = params.q?.trim().toLowerCase()
  let filtered = allCategories
  if (visibilityParam === 'visible') {
    filtered = filtered.filter((c) => c.visible)
  } else if (visibilityParam === 'hidden') {
    filtered = filtered.filter((c) => !c.visible)
  }
  if (search) {
    filtered = filtered.filter(
      (c) =>
        c.name.toLowerCase().includes(search) ||
        c.slug.toLowerCase().includes(search)
    )
  }

  const treeOrdered = flattenCategoryTree(buildCategoryTree(filtered))
  const pageSize = [25, 50, 100, 200].includes(Number(params.size))
    ? Number(params.size)
    : 25
  const page = Math.max(1, parseInt(params.page ?? '1', 10) || 1)
  const total = treeOrdered.length
  const totalPages = Math.max(1, Math.ceil(total / pageSize))
  const offset = (page - 1) * pageSize
  const pagedCategories = treeOrdered.slice(offset, offset + pageSize)

  const result = {
    categories: pagedCategories,
    total,
    page,
    pageSize,
    totalPages,
  }

  const currentParams = new URLSearchParams(
    Object.entries(params).filter(([, v]) => v != null) as [string, string][]
  )

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

      <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8 py-12" data-onboarding="categories-list">
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
                      const key = normalizeCategorySlug(category.slug)
                      const stats = categoryCounts[key] ?? categoryCounts[category.slug.toLowerCase()] ?? {
                        total: 0,
                        active: 0,
                      }
                      const count = stats.total
                      const activeCount = stats.active
                      return (
                        <tr key={category.id} className="border-b border-hairline last:border-0 hover:bg-soft-cloud/50">
                          <td className="py-4 px-4 font-medium text-ink">
                            <span style={{ paddingLeft: `${category.depth * 1.25}rem` }}>
                              {category.depth > 0 && (
                                <span className="text-mute mr-1" aria-hidden>
                                  └
                                </span>
                              )}
                              {category.name}
                            </span>
                          </td>
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
