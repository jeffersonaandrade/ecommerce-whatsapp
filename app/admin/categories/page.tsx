import { Metadata } from 'next'
import Link from 'next/link'
import { Button } from '@/components/ui/button'

export const metadata: Metadata = {
  title: 'Categorias',
  description: 'Gestão de categorias — em breve',
}

export default function AdminCategoriesPage() {
  return (
    <div className="w-full">
      <div className="bg-gray-900 text-white py-8 sm:py-12">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <Link
            href="/admin"
            className="text-sm text-gray-400 hover:text-white transition-colors"
          >
            ← Voltar ao Admin
          </Link>
          <h1 className="text-3xl sm:text-4xl font-bold mt-4">Categorias</h1>
          <p className="text-gray-400 mt-2">Organização do catálogo</p>
        </div>
      </div>

      <div className="mx-auto max-w-3xl px-4 sm:px-6 lg:px-8 py-12">
        <div className="bg-white border border-gray-200 rounded-lg p-8 text-center space-y-4">
          <div className="text-5xl">🏷️</div>
          <h2 className="text-xl font-semibold">Em breve</h2>
          <p className="text-gray-600 text-sm">
            Gestão de categorias será incluída no módulo Catálogo (Fase 4).
          </p>
          <Link href="/admin">
            <Button variant="outline">Voltar ao dashboard</Button>
          </Link>
        </div>
      </div>
    </div>
  )
}
