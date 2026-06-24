import { Metadata } from 'next'
import Link from 'next/link'
import { getButtonClassName } from '@/components/ui/button'
import { getAllProducts, getAllProductsAdmin } from '@/lib/products'

export const metadata: Metadata = {
  title: 'Admin Dashboard',
  description: 'Painel de administração da loja',
}

function NavCard({
  href,
  emoji,
  title,
  description,
  buttonLabel,
  disabled,
}: {
  href?: string
  emoji: string
  title: string
  description: string
  buttonLabel: string
  disabled?: boolean
}) {
  const inner = (
    <div
      className={`bg-white border border-gray-200 rounded-lg p-6 text-center h-full ${
        disabled
          ? 'opacity-50 cursor-not-allowed'
          : 'hover:shadow-lg transition-shadow'
      }`}
    >
      <div className="text-4xl mb-3">{emoji}</div>
      <h2 className="text-lg font-semibold mb-1">{title}</h2>
      <p className="text-gray-600 text-sm mb-4 min-h-10">{description}</p>
      <span
        className={getButtonClassName(
          'outline',
          'sm',
          `w-full ${disabled ? 'opacity-50 cursor-not-allowed' : ''}`
        )}
      >
        {buttonLabel}
      </span>
    </div>
  )

  if (disabled || !href) return inner
  return <Link href={href}>{inner}</Link>
}

export default function AdminPage() {
  const allProducts = getAllProductsAdmin()
  const activeProducts = getAllProducts()
  const totalProducts = allProducts.length

  return (
    <div className="w-full">
      <div className="bg-gray-900 text-white py-8 sm:py-12">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <h1 className="text-3xl sm:text-4xl font-bold">Admin Dashboard</h1>
          <p className="text-gray-400 mt-2">Gerencie sua loja esportiva</p>
        </div>
      </div>

      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-12 sm:py-16">
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 mb-12">
          <div className="bg-white border border-gray-200 rounded-lg p-6">
            <div className="text-3xl font-bold text-black mb-2">
              {totalProducts}
            </div>
            <p className="text-gray-600">Total de Produtos</p>
          </div>
          <div className="bg-white border border-gray-200 rounded-lg p-6">
            <div className="text-3xl font-bold text-green-600 mb-2">
              {activeProducts.length}
            </div>
            <p className="text-gray-600">Produtos Ativos</p>
          </div>
          <div className="bg-white border border-gray-200 rounded-lg p-6">
            <div className="text-3xl font-bold text-blue-600 mb-2">0</div>
            <p className="text-gray-600">Pedidos (V2)</p>
          </div>
        </div>

        <section className="mb-10">
          <h2 className="text-sm font-semibold text-gray-500 uppercase tracking-wide mb-4">
            Produtos
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <NavCard
              href="/admin/products"
              emoji="📋"
              title="Lista"
              description="Ver e gerenciar produtos do catálogo"
              buttonLabel="Ir para lista"
            />
            <NavCard
              href="/admin/products/new"
              emoji="➕"
              title="Novo Produto"
              description="Cadastro manual — Fase 4"
              buttonLabel="Criar produto"
            />
            <NavCard
              href="/admin/import"
              emoji="📥"
              title="Importar CSV"
              description="Carga em massa via planilha"
              buttonLabel="Importar"
            />
          </div>
        </section>

        <section>
          <h2 className="text-sm font-semibold text-gray-500 uppercase tracking-wide mb-4">
            Loja
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <NavCard
              href="/admin/categories"
              emoji="🏷️"
              title="Categorias"
              description="Organização do catálogo — Fase 4"
              buttonLabel="Categorias"
            />
            <NavCard
              href="/admin/orders"
              emoji="📦"
              title="Pedidos"
              description="Placeholder até checkout online (V2)"
              buttonLabel="Ver pedidos"
            />
            <NavCard
              href="/admin/settings"
              emoji="⚙️"
              title="Configurações"
              description="Finalização via WhatsApp e dados da loja"
              buttonLabel="Configurar"
            />
          </div>
        </section>
      </div>
    </div>
  )
}
