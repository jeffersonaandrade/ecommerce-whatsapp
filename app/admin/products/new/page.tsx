import { Metadata } from 'next'
import Link from 'next/link'
import { AdminPageHeader } from '@/components/admin/admin-page-header'
import { ProductForm } from '@/components/admin/product-form'
import { getAllCategoriesAdmin } from '@/lib/categories'

export const metadata: Metadata = {
  title: 'Novo Produto',
  description: 'Cadastro manual de produto',
}

export default async function AdminNewProductPage() {
  const categories = await getAllCategoriesAdmin()

  return (
    <div className="w-full">
      <AdminPageHeader
        title="Novo Produto"
        subtitle="Cadastro manual no catálogo"
        back={{ href: '/admin/products', label: 'Voltar para Produtos' }}
      />

      <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8 py-12">
        <div className="bg-canvas border border-hairline rounded-lg p-6 sm:p-8">
          <ProductForm mode="create" categories={categories} />
        </div>
      </div>
    </div>
  )
}
