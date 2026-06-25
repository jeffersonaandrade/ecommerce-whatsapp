import { Metadata } from 'next'
import Link from 'next/link'
import { Badge } from '@/components/ui/badge'
import { getAllProductsAdmin } from '@/lib/products'
import { countProductsByCategory } from '@/lib/catalog/product-utils'

export const metadata: Metadata = {
  title: 'Categorias',
  description: 'Categorias derivadas do catálogo',
}

export default async function AdminCategoriesPage() {
  const products = await getAllProductsAdmin()
  const categories = countProductsByCategory(products)

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
          <h1 className="text-3xl sm:text-4xl font-bold mt-4">Categorias</h1>
          <p className="text-gray-400 mt-2">
            Listagem derivada dos produtos — sem CRUD separado na v4.0
          </p>
        </div>
      </div>

      <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8 py-12">
        {categories.length === 0 ? (
          <p className="text-gray-600 text-center py-12">
            Nenhuma categoria ainda. Cadastre produtos para gerar categorias.
          </p>
        ) : (
          <div className="bg-white border border-gray-200 rounded-lg overflow-hidden">
            <table className="w-full">
              <thead className="border-b border-gray-200 bg-gray-50">
                <tr>
                  <th className="text-left py-3 px-4 font-semibold text-gray-700">
                    Categoria
                  </th>
                  <th className="text-left py-3 px-4 font-semibold text-gray-700">
                    Total
                  </th>
                  <th className="text-left py-3 px-4 font-semibold text-gray-700">
                    Ativos
                  </th>
                </tr>
              </thead>
              <tbody>
                {categories.map((row) => (
                  <tr key={row.category} className="border-b border-gray-100">
                    <td className="py-4 px-4 font-medium text-gray-900">
                      {row.category}
                    </td>
                    <td className="py-4 px-4 text-sm text-gray-600">
                      {row.count}
                    </td>
                    <td className="py-4 px-4">
                      <Badge variant={row.activeCount > 0 ? 'success' : 'default'}>
                        {row.activeCount} ativo{row.activeCount !== 1 ? 's' : ''}
                      </Badge>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  )
}
