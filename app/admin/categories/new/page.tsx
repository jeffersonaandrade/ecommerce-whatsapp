import { Metadata } from 'next'
import { AdminPageHeader } from '@/components/admin/admin-page-header'
import { CategoryForm } from '@/components/admin/category-form'
import { getAllCategoriesAdmin } from '@/lib/categories'

export const metadata: Metadata = {
  title: 'Nova Categoria',
  description: 'Cadastrar categoria',
}

export default async function AdminNewCategoryPage() {
  const allCategories = await getAllCategoriesAdmin()

  return (
    <div className="w-full">
      <AdminPageHeader
        title="Nova categoria"
        back={{ href: '/admin/categories', label: 'Voltar para Categorias' }}
      />

      <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8 py-12">
        <div className="bg-canvas border border-hairline rounded-lg p-6 sm:p-8">
          <CategoryForm mode="create" allCategories={allCategories} />
        </div>
      </div>
    </div>
  )
}
