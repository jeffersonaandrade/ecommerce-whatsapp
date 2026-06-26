import { Metadata } from 'next'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import { Alert } from '@/components/ui/alert'
import { ProductForm } from '@/components/admin/product-form'
import { getAllCategoriesAdmin } from '@/lib/categories'
import { getProductByIdAdmin } from '@/lib/products'

interface EditProductPageProps {
  params: Promise<{ id: string }>
  searchParams: Promise<{ created?: string }>
}

export async function generateMetadata({
  params,
}: EditProductPageProps): Promise<Metadata> {
  const { id } = await params
  const product = await getProductByIdAdmin(id)
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
  const product = await getProductByIdAdmin(id)

  if (!product) notFound()

  const categories = await getAllCategoriesAdmin()

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
          <Alert type="success" className="space-y-2">
            <p className="font-semibold">Produto criado com sucesso.</p>
            <p>Revise os dados abaixo. Para publicar na loja:</p>
            <ol className="list-inside list-decimal space-y-1">
              <li>Confira imagem, preço e estoque da variação.</li>
              <li>
                Altere <strong>Status</strong> para <strong>Ativo</strong>.
              </li>
              <li>
                Clique em <strong>Salvar alterações</strong>.
              </li>
            </ol>
          </Alert>
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
