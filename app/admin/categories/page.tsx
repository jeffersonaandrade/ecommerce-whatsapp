import { Metadata } from 'next'
import Link from 'next/link'
import { Badge } from '@/components/ui/badge'
import { getButtonClassName } from '@/components/ui/button'
import { getAllCategoriesAdmin } from '@/lib/categories'
import { getAllProductsAdmin } from '@/lib/products'
import { countProductsForCategory } from '@/lib/catalog/category-utils'

export const metadata: Metadata = {
  title: 'Categorias',
  description: 'Gerenciar categorias da loja',
}

export default async function AdminCategoriesPage() {
  const [categories, products] = await Promise.all([
    getAllCategoriesAdmin(),
    getAllProductsAdmin(),
  ])

  return (
    <div className="w-full">
      <div className="bg-gray-900 text-white py-8 sm:py-12">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <Link
            href="/admin"
            className="text-sm text-gray-400 hover:text-white transition-colors"
          >
            ← Voltar ao Admin
          </Link>
          <div className="mt-4 flex flex-wrap items-end justify-between gap-4">
            <div>
              <h1 className="text-3xl sm:text-4xl font-bold">Categorias</h1>
              <p className="text-gray-400 mt-2">
                Crie, ordene e oculte categorias exibidas na vitrine.
              </p>
            </div>
            <Link
              href="/admin/categories/new"
              className={getButtonClassName('secondary', 'md', '!text-ink')}
            >
              + Nova categoria
            </Link>
          </div>
        </div>
      </div>

      <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8 py-12">
        {categories.length === 0 ? (
          <p className="text-gray-600 text-center py-12">
            Nenhuma categoria cadastrada ainda.
          </p>
        ) : (
          <div className="bg-white border border-gray-200 rounded-lg overflow-hidden">
            <table className="w-full">
              <thead className="border-b border-gray-200 bg-gray-50">
                <tr>
                  <th className="text-left py-3 px-4 font-semibold text-gray-700">Nome</th>
                  <th className="text-left py-3 px-4 font-semibold text-gray-700">Slug</th>
                  <th className="text-left py-3 px-4 font-semibold text-gray-700">Ordem</th>
                  <th className="text-left py-3 px-4 font-semibold text-gray-700">Produtos</th>
                  <th className="text-left py-3 px-4 font-semibold text-gray-700">Status</th>
                  <th className="text-left py-3 px-4 font-semibold text-gray-700">Ações</th>
                </tr>
              </thead>
              <tbody>
                {categories.map((category) => {
                  const { count, activeCount } = countProductsForCategory(category, products)
                  return (
                    <tr key={category.id} className="border-b border-gray-100">
                      <td className="py-4 px-4 font-medium text-gray-900">{category.name}</td>
                      <td className="py-4 px-4 text-sm text-gray-600 font-mono">{category.slug}</td>
                      <td className="py-4 px-4 text-sm text-gray-600">{category.sortOrder}</td>
                      <td className="py-4 px-4 text-sm text-gray-600">
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
                          className="text-sm font-medium text-gray-900 hover:underline"
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
        )}
      </div>
    </div>
  )
}
