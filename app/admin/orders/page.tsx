import { Metadata } from 'next'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'

export const metadata: Metadata = {
  title: 'Admin - Pedidos',
  description: 'Gerencie os pedidos da loja',
}

export default function AdminOrdersPage() {
  return (
    <div className="w-full">
      {/* Page Header */}
      <div className="bg-gray-900 text-white py-8">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <h1 className="text-3xl font-bold">Gerenciar Pedidos</h1>
          <p className="text-gray-400 mt-1">Acompanhe todos os pedidos dos clientes</p>
        </div>
      </div>

      {/* Empty State */}
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-16 text-center">
        <div className="text-6xl mb-4">📭</div>
        <h2 className="text-2xl font-semibold mb-2 text-gray-900">
          Nenhum Pedido Ainda
        </h2>
        <p className="text-gray-600 mb-8">
          Os pedidos dos clientes aparecerão aqui quando o sistema de checkout
          estiver funcionando.
        </p>
        <Button variant="outline">Voltar ao Dashboard</Button>
      </div>

      {/* Info Box */}
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 pb-8">
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
          <h3 className="font-semibold text-blue-900 mb-2">ℹ️ Sobre os Pedidos</h3>
          <p className="text-blue-800 text-sm mb-3">
            Este painel está preparado para receber pedidos quando:
          </p>
          <ul className="text-blue-800 text-sm space-y-1 list-disc list-inside">
            <li>Sistema de checkout real for implementado</li>
            <li>Banco de dados for conectado</li>
            <li>Sistema de pagamento for integrado</li>
            <li>Autenticação de usuários for ativada</li>
          </ul>
        </div>
      </div>
    </div>
  )
}
