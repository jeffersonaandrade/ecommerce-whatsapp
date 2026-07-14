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
          <Alert
            type={product.status === 'draft' ? 'info' : 'success'}
            className="space-y-2"
          >
            {product.status === 'draft' ? (
              <>
                <p className="font-semibold">Produto salvo como rascunho.</p>
                <p>
                  Ele ainda <strong>não aparece na loja</strong>. Status inicial é
                  Rascunho de propósito (evita publicar incompleto).
                </p>
                <p>Para publicar na vitrine:</p>
                <ol className="list-inside list-decimal space-y-1">
                  <li>Confira imagem, preço e estoque da variação.</li>
                  <li>
                    Altere <strong>Status</strong> para <strong>Ativo</strong>.
                  </li>
                  <li>
                    Clique em <strong>Salvar alterações</strong>.
                  </li>
                </ol>
              </>
            ) : (
              <>
                <p className="font-semibold">Produto criado com sucesso.</p>
                <p>Revise os dados abaixo e confirme que a vitrine está correta.</p>
              </>
            )}
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
