import { Metadata } from 'next'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import { ProductForm } from '@/components/admin/product-form'
import { getCategoriesAdmin, getProductByIdAdmin } from '@/lib/products'

interface EditProductPageProps {
  params: Promise<{ id: string }>
  searchParams: Promise<{ created?: string }>
}

export async function generateMetadata({
  params,
}: EditProductPageProps): Promise<Metadata> {
  const { id } = await params
  const product = getProductByIdAdmin(id)
  return {
    title: product ? `Editar — ${product.name}` : 'Produto não encontrado',
  }
}

export default async function EditProductPage({
  params,
  searchParams,
}: EditProductPageProps) {
  const { id } = await params
  const { created } = await searchParams
  const product = getProductByIdAdmin(id)

  if (!product) notFound()

  const categories = getCategoriesAdmin()

  return (
    <div className="w-full">
      <div className="bg-gray-900 text-white py-8 sm:py-12">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <Link
            href="/admin/products"
            className="text-sm text-gray-400 hover:text-white transition-colors"
          >
            ← Voltar para Produtos
          </Link>
          <h1 className="text-3xl sm:text-4xl font-bold mt-4">Editar Produto</h1>
          <p className="text-gray-400 mt-2">{product.name}</p>
        </div>
      </div>

      <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8 py-12 space-y-4">
        {created === '1' && (
          <div className="rounded-lg border border-green-200 bg-green-50 p-4 text-sm text-green-800">
            Produto criado com sucesso. Revise os dados e publique quando estiver
            pronto.
          </div>
        )}
        <div className="bg-white border border-gray-200 rounded-lg p-6 sm:p-8">
          <ProductForm
            mode="edit"
            product={product}
            categories={categories}
          />
        </div>
      </div>
    </div>
  )
}
