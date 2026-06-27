import { Metadata } from 'next'
import Link from 'next/link'
import { AdminPageHeader } from '@/components/admin/admin-page-header'
import { AdminEmptyState } from '@/components/admin/admin-empty-state'
import { getButtonClassName } from '@/components/ui/button'

export const metadata: Metadata = {
  title: 'Admin - Pedidos',
  description: 'Gerencie os pedidos da loja',
}

export default function AdminOrdersPage() {
  return (
    <div className="w-full">
      <AdminPageHeader
        title="Gerenciar Pedidos"
        subtitle="Acompanhe todos os pedidos dos clientes"
      />

      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-16">
        <AdminEmptyState message="Nenhum pedido ainda.">
          <p className="mt-2 text-sm text-mute">
            Os pedidos dos clientes aparecerão aqui quando o sistema de checkout estiver
            funcionando.
          </p>
          <Link href="/admin" className={getButtonClassName('outline', 'md', 'mt-6 inline-flex')}>
            Voltar ao Dashboard
          </Link>
        </AdminEmptyState>
      </div>

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
