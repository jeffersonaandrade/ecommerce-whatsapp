import { Metadata } from 'next'
import Link from 'next/link'
import { Button } from '@/components/ui/button'

export const metadata: Metadata = {
  title: 'Novo Produto',
  description: 'Cadastro de produto — em breve',
}

export default function AdminNewProductPage() {
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
          <p className="text-gray-400 mt-2">
            Cadastro manual — implementação na Fase 4
          </p>
        </div>
      </div>

      <div className="mx-auto max-w-3xl px-4 sm:px-6 lg:px-8 py-12">
        <div className="bg-white border border-gray-200 rounded-lg p-8 text-center space-y-4">
          <div className="text-5xl">📝</div>
          <h2 className="text-xl font-semibold">Em breve</h2>
          <p className="text-gray-600 text-sm max-w-md mx-auto">
            Formulário com nome, categoria, marca, preço, galeria de imagens
            (até 5), variações e status rascunho/ativo — ver{' '}
            <code className="bg-gray-100 px-1 rounded text-xs">
              docs/MODULE_ROADMAP.md
            </code>
            .
          </p>
          <Link href="/admin/products">
            <Button variant="outline">Ver lista de produtos</Button>
          </Link>
        </div>
      </div>
    </div>
  )
}
