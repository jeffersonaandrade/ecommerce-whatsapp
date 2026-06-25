import { Metadata } from 'next'
import Link from 'next/link'
import { mockPurchaseIntent } from '@/data/mock-purchase-intent'
import { formatPrice } from '@/lib/formatters'

export const metadata: Metadata = {
  title: 'Demonstração — Intenção de compra',
  description: 'Protótipo da visão do atendente para validação de UX',
  robots: { index: false, follow: false },
}

export default function OrderIntentDemoPage() {
  const intent = mockPurchaseIntent
  const createdLabel = new Date(intent.createdAt).toLocaleString('pt-BR')

  return (
    <div className="mx-auto max-w-3xl px-4 sm:px-6 lg:px-8 py-10 sm:py-14">
      <div className="mb-8 rounded-lg border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-900">
        <strong>Protótipo — dados de demonstração.</strong> Na V1 o canal
        confiável é a mensagem do WhatsApp. Este link não funciona entre
        dispositivos nem representa um pedido real.
      </div>

      <header className="mb-8">
        <p className="text-sm text-gray-500">Visão do atendente</p>
        <h1 className="text-2xl sm:text-3xl font-bold mt-1">
          Solicitação de compra
        </h1>
        <p className="text-sm text-gray-600 mt-2">
          Pedido #{intent.id} · {createdLabel}
        </p>
      </header>

      <ul className="space-y-6 border-t border-gray-200 pt-6">
        {intent.lines.map((line) => {
          const variation = [line.size, line.color].filter(Boolean).join(' · ')
          return (
            <li
              key={line.sku}
              className="border-b border-gray-100 pb-6 last:border-0"
            >
              <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-2">
                <div>
                  <p className="font-semibold">{line.productName}</p>
                  {variation && (
                    <p className="text-sm text-gray-600 mt-1">{variation}</p>
                  )}
                  <p className="text-xs text-gray-500 mt-1">SKU: {line.sku}</p>
                  <p className="text-sm text-gray-600 mt-1">
                    Qtd: {line.quantity}
                  </p>
                  <Link
                    href={line.productUrl}
                    className="text-sm text-blue-600 hover:underline mt-2 inline-block"
                  >
                    Ver produto no catálogo
                  </Link>
                </div>
                <p className="font-semibold shrink-0">
                  {formatPrice(line.lineSubtotal)}
                </p>
              </div>
            </li>
          )
        })}
      </ul>

      <div className="mt-8 flex justify-between items-center border-t border-gray-200 pt-6">
        <span className="text-lg font-semibold">Total do carrinho</span>
        <span className="text-2xl font-bold">{formatPrice(intent.cartTotal)}</span>
      </div>

      <p className="mt-8 text-sm text-gray-500">
        Endereço, pagamento e frete são tratados na conversa com o cliente
        (fora desta plataforma na V1).
      </p>
    </div>
  )
}
