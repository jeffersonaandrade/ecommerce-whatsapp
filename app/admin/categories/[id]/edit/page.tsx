import { Metadata } from 'next'
import { notFound } from 'next/navigation'
import { AdminPageHeader } from '@/components/admin/admin-page-header'
import { CategoryForm } from '@/components/admin/category-form'
import { getCategoryById } from '@/lib/categories'
import { getAllProductsAdmin } from '@/lib/products'
import { countProductsForCategory } from '@/lib/catalog/category-utils'

export const metadata: Metadata = {
  title: 'Editar Categoria',
  description: 'Editar categoria',
}

type EditCategoryPageProps = {
  params: Promise<{ id: string }>
}

export default async function AdminEditCategoryPage({ params }: EditCategoryPageProps) {
  const { id } = await params
  const category = await getCategoryById(id)
  if (!category) notFound()

  const products = await getAllProductsAdmin()
  const { count } = countProductsForCategory(category, products)

  return (
    <div className="w-full">
      <AdminPageHeader
        title="Editar categoria"
        subtitle={category.name}
        back={{ href: '/admin/categories', label: 'Voltar para Categorias' }}
      />

      <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8 py-12">
        <div className="bg-canvas border border-hairline rounded-lg p-6 sm:p-8">
          <CategoryForm mode="edit" category={category} productCount={count} />
        </div>
      </div>
    </div>
  )
}
