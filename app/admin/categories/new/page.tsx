import { Metadata } from 'next'
import Link from 'next/link'
import { CategoryForm } from '@/components/admin/category-form'

export const metadata: Metadata = {
  title: 'Nova Categoria',
  description: 'Cadastrar categoria',
}

export default function AdminNewCategoryPage() {
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
          <h1 className="text-3xl sm:text-4xl font-bold mt-4">Nova categoria</h1>
        </div>
      </div>

      <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8 py-12">
        <div className="bg-white border border-gray-200 rounded-lg p-6 sm:p-8">
          <CategoryForm mode="create" />
        </div>
      </div>
    </div>
  )
}
