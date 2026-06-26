import { Metadata } from 'next'
import Link from 'next/link'
import { notFound } from 'next/navigation'
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
      <div className="bg-gray-900 text-white py-8 sm:py-12">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <Link
            href="/admin/categories"
            className="text-sm text-gray-400 hover:text-white transition-colors"
          >
            ← Voltar para Categorias
          </Link>
          <h1 className="text-3xl sm:text-4xl font-bold mt-4">Editar categoria</h1>
          <p className="text-gray-400 mt-2">{category.name}</p>
        </div>
      </div>

      <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8 py-12">
        <div className="bg-white border border-gray-200 rounded-lg p-6 sm:p-8">
          <CategoryForm mode="edit" category={category} productCount={count} />
        </div>
      </div>
    </div>
  )
}
