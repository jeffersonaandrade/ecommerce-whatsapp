import { Metadata } from 'next'
import Link from 'next/link'

export const metadata: Metadata = {
  title: 'Configurações da Loja',
  description: 'Configurações gerais e finalização de pedidos',
}

export default function AdminSettingsPage() {
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
          <h1 className="text-3xl sm:text-4xl font-bold mt-4">Configurações</h1>
          <p className="text-gray-400 mt-2">
            Preferências da loja — persistência na Fase 7
          </p>
        </div>
      </div>

      <div className="mx-auto max-w-3xl px-4 sm:px-6 lg:px-8 py-12 space-y-8">
        <section className="bg-white border border-gray-200 rounded-lg p-6 space-y-4">
          <h2 className="text-lg font-semibold">Finalização do pedido</h2>
          <p className="text-sm text-gray-600">
            Modo de finalização padrão do template. Configuração funcional na
            Fase 6 (WhatsApp).
          </p>
          <fieldset className="space-y-3" disabled>
            <label className="flex items-center gap-3 cursor-not-allowed">
              <input type="radio" name="completion" defaultChecked readOnly />
              <span>WhatsApp</span>
            </label>
            <label className="flex items-center gap-3 cursor-not-allowed opacity-60">
              <input type="radio" name="completion" readOnly />
              <span>Checkout online</span>
            </label>
            <label className="flex items-center gap-3 cursor-not-allowed opacity-60">
              <input type="radio" name="completion" readOnly />
              <span>Ambos</span>
            </label>
          </fieldset>
          <p className="text-xs text-gray-500">
            Campos futuros: telefone WhatsApp, mensagem padrão, texto do botão.
          </p>
        </section>
      </div>
    </div>
  )
}
