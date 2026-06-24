import { Metadata } from 'next'
import Link from 'next/link'
import { getButtonClassName } from '@/components/ui/button'

export const metadata: Metadata = {
  title: 'Finalização do pedido',
  description: 'Finalize sua solicitação de compra',
}

export default function CheckoutPage() {
  return (
    <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-12 sm:py-16">
      <h1 className="text-3xl sm:text-4xl font-bold mb-4">
        Finalização do pedido
      </h1>
      <p className="text-gray-600 mb-8 max-w-2xl">
        Na V1, a finalização acontece pelo carrinho via WhatsApp. Checkout
        online com pagamento e entrega no site está previsto para a Fase 9.
      </p>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2">
          <div className="bg-gray-50 rounded-lg p-8 text-center">
            <div className="text-5xl mb-4">💬</div>
            <h2 className="text-2xl font-semibold mb-2">Use o carrinho</h2>
            <p className="text-gray-600 mb-6">
              Adicione produtos no carrinho e use &quot;Finalizar Pedido&quot;
              para enviar sua solicitação à loja pelo WhatsApp.
            </p>
            <Link href="/cart" className={getButtonClassName('default', 'md')}>
              Ir para o carrinho
            </Link>
          </div>
        </div>

        <div>
          <div className="bg-white border border-gray-200 rounded-lg p-6 sticky top-20">
            <h2 className="font-semibold text-lg mb-4">Sobre o checkout online</h2>
            <p className="text-sm text-gray-600">
              Endereço, pagamento e frete não são coletados nesta versão. A
              negociação com a loja ocorre no WhatsApp após você enviar o resumo
              do carrinho.
            </p>
          </div>
        </div>
      </div>

      <div className="mt-8 flex gap-3">
        <Link href="/products" className={getButtonClassName('outline', 'md')}>
          ← Voltar para Produtos
        </Link>
      </div>
    </div>
  )
}
