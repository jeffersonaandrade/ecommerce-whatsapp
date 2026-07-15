import { Metadata } from 'next'
import { notFound } from 'next/navigation'
import { AdminPageHeader } from '@/components/admin/admin-page-header'
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
      <AdminPageHeader
        title="Editar Produto"
        subtitle={product.name}
        back={{ href: '/admin/products', label: 'Voltar para Produtos' }}
      />

      <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8 py-12 space-y-4">
        {created === '1' && (
          <Alert type="success" className="space-y-2">
            <p className="font-semibold">Produto criado com sucesso.</p>
            <p>
              O cadastro ficou em <strong>rascunho</strong> (não aparece na vitrine até você
              publicar). Isso não é perda do produto — revise e ative:
            </p>
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
        <div className="bg-canvas border border-hairline rounded-lg p-6 sm:p-8">
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
