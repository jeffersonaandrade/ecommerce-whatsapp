import { Metadata } from 'next'
import Link from 'next/link'
import { getButtonClassName } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { DeleteProductButton } from '@/components/admin/delete-product-button'
import { getAllProductsAdmin } from '@/lib/products'
import { formatPrice } from '@/lib/formatters'

export const metadata: Metadata = {
  title: 'Admin - Produtos',
  description: 'Gerencie os produtos da loja',
}

function statusLabel(status: string): string {
  if (status === 'active') return 'Ativo'
  if (status === 'draft') return 'Rascunho'
  return 'Indisponível'
}

function statusVariant(
  status: string
): 'success' | 'warning' | 'default' {
  if (status === 'active') return 'success'
  if (status === 'draft') return 'warning'
  return 'default'
}

export default async function AdminProductsPage() {
  const allProducts = await getAllProductsAdmin()

  return (
    <div className="w-full">
      <div className="bg-gray-900 text-white py-8">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <h1 className="text-3xl font-bold">Gerenciar Produtos</h1>
            <p className="text-gray-400 mt-1">
              {allProducts.length} produtos no catálogo
            </p>
          </div>
          <Link
            href="/admin/products/new"
            className={getButtonClassName(
              'default',
              'md',
              'bg-white text-black hover:bg-gray-100 focus:ring-gray-300'
            )}
          >
            + Novo Produto
          </Link>
        </div>
      </div>

      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-8">
        {allProducts.length === 0 ? (
          <div className="text-center py-16 text-gray-600">
            <p className="mb-4">Nenhum produto cadastrado.</p>
            <Link href="/admin/products/new" className={getButtonClassName('default', 'md')}>
              Criar primeiro produto
            </Link>
          </div>
        ) : (
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
                  const hasPromotion =
                    product.promotionalPrice != null &&
                    product.promotionalPrice < product.price

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
                          {hasPromotion ? (
                            <>
                              <p className="font-medium">
                                {formatPrice(product.promotionalPrice!)}
                              </p>
                              <p className="text-gray-500 line-through text-xs">
                                {formatPrice(product.price)}
                              </p>
                            </>
                          ) : (
                            <p className="font-medium">
                              {formatPrice(product.price)}
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
                        <Badge variant={statusVariant(product.status)}>
                          {statusLabel(product.status)}
                        </Badge>
                      </td>
                      <td className="py-4 px-4">
                        <div className="flex gap-3">
                          <Link
                            href={`/admin/products/${product.id}/edit`}
                            className="text-blue-600 hover:text-blue-800 text-sm font-medium"
                          >
                            Editar
                          </Link>
                          <DeleteProductButton
                            productId={product.id}
                            productName={product.name}
                          />
                        </div>
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
