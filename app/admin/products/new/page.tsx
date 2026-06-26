import { Metadata } from 'next'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
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
      <div className="bg-gray-900 text-white py-8 sm:py-12">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <Link
            href="/admin/products"
            className="text-sm text-gray-400 hover:text-white transition-colors"
          >
            ← Voltar para Produtos
          </Link>
          <h1 className="text-3xl sm:text-4xl font-bold mt-4">Novo Produto</h1>
          <p className="text-gray-400 mt-2">Cadastro manual no catálogo</p>
        </div>
      </div>

      <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8 py-12">
        <div className="bg-white border border-gray-200 rounded-lg p-6 sm:p-8">
          <ProductForm mode="create" categories={categories} />
        </div>
      </div>
    </div>
  )
}
