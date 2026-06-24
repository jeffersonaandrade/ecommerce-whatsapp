import { Metadata } from 'next'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { getAllProducts } from '@/lib/products'
import { formatPrice } from '@/lib/formatters'

export const metadata: Metadata = {
  title: 'Admin - Produtos',
  description: 'Gerencie os produtos da loja',
}

export default function AdminProductsPage() {
  const allProducts = getAllProducts()

  return (
    <div className="w-full">
      {/* Page Header */}
      <div className="bg-gray-900 text-white py-8">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold">Gerenciar Produtos</h1>
            <p className="text-gray-400 mt-1">
              {allProducts.length} produtos no sistema
            </p>
          </div>
          <Button className="bg-white text-black hover:bg-gray-100">
            + Novo Produto
          </Button>
        </div>
      </div>

      {/* Products Table */}
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-8">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="border-b border-gray-200">
              <tr>
                <th className="text-left py-3 px-4 font-semibold text-gray-700">
                  Produto
                </th>
                <th className="text-left py-3 px-4 font-semibold text-gray-700">
                  Categoria
                </th>
                <th className="text-left py-3 px-4 font-semibold text-gray-700">
                  Preço
                </th>
                <th className="text-left py-3 px-4 font-semibold text-gray-700">
                  Estoque
                </th>
                <th className="text-left py-3 px-4 font-semibold text-gray-700">
                  Status
                </th>
                <th className="text-left py-3 px-4 font-semibold text-gray-700">
                  Ações
                </th>
              </tr>
            </thead>
            <tbody>
              {allProducts.map((product) => {
                const totalStock = product.variations.reduce(
                  (sum, v) => sum + v.stock,
                  0
                )
                return (
                  <tr key={product.id} className="border-b border-gray-100">
                    <td className="py-4 px-4">
                      <div>
                        <p className="font-medium text-gray-900">
                          {product.name}
                        </p>
                        <p className="text-sm text-gray-500">{product.slug}</p>
                      </div>
                    </td>
                    <td className="py-4 px-4 text-sm text-gray-600">
                      {product.category}
                    </td>
                    <td className="py-4 px-4">
                      <div className="text-sm">
                        <p className="font-medium">
                          {formatPrice(product.price)}
                        </p>
                        {product.promotionalPrice && (
                          <p className="text-gray-500 line-through text-xs">
                            {formatPrice(product.promotionalPrice)}
                          </p>
                        )}
                      </div>
                    </td>
                    <td className="py-4 px-4 text-sm text-gray-600">
                      {totalStock > 0 ? (
                        <span className="text-green-600 font-medium">
                          {totalStock} unidades
                        </span>
                      ) : (
                        <span className="text-red-600 font-medium">
                          Sem estoque
                        </span>
                      )}
                    </td>
                    <td className="py-4 px-4">
                      <Badge
                        variant={
                          product.status === 'active' ? 'success' : 'default'
                        }
                      >
                        {product.status === 'active' ? 'Ativo' : 'Inativo'}
                      </Badge>
                    </td>
                    <td className="py-4 px-4">
                      <div className="flex gap-2">
                        <button className="text-blue-600 hover:text-blue-800 text-sm font-medium">
                          Editar
                        </button>
                        <button className="text-red-600 hover:text-red-800 text-sm font-medium">
                          Deletar
                        </button>
                      </div>
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Info Box */}
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-8">
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-6">
          <h3 className="font-semibold text-yellow-900 mb-2">
            ⚠️ Funcionalidade em Desenvolvimento
          </h3>
          <p className="text-yellow-800 text-sm">
            Criar, editar e deletar produtos não está implementado nesta versão.
            Use este painel apenas para visualizar os produtos mockados.
          </p>
        </div>
      </div>
    </div>
  )
}
