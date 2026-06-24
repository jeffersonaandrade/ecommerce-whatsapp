'use client'

import Image from 'next/image'
import Link from 'next/link'
import { useCart } from '@/context/cart-context'
import { formatPrice } from '@/lib/formatters'
import { resolveCartLines, type CartLine } from '@/lib/cart-utils'
import { Button, getButtonClassName } from '@/components/ui/button'

function CartLineItem({ line }: { line: CartLine }) {
  const { updateQuantity, removeItem } = useCart()

  const variationLabel = [line.size, line.color].filter(Boolean).join(' · ')

  return (
    <div className="flex gap-4 border-b border-gray-200 py-6">
      <Link
        href={`/products/${line.slug}`}
        className="relative h-24 w-24 shrink-0 overflow-hidden rounded-lg bg-gray-100"
      >
        {line.image && (
          <Image
            src={line.image}
            alt={line.name}
            fill
            className="object-cover"
            sizes="96px"
          />
        )}
      </Link>

      <div className="flex min-w-0 flex-1 flex-col justify-between gap-3 sm:flex-row sm:items-center">
        <div className="min-w-0">
          <Link
            href={`/products/${line.slug}`}
            className="font-semibold hover:text-gray-600 transition-colors line-clamp-2"
          >
            {line.name}
          </Link>
          {variationLabel && (
            <p className="text-sm text-gray-600 mt-1">{variationLabel}</p>
          )}
          <p className="text-sm font-medium mt-1">{formatPrice(line.unitPrice)}</p>
        </div>

        <div className="flex items-center gap-3">
          <div className="flex items-center border border-gray-300 rounded-lg">
            <button
              type="button"
              onClick={() =>
                updateQuantity(line.productId, line.variationId, line.quantity - 1)
              }
              className="px-3 py-2 hover:bg-gray-50 transition-colors"
              aria-label="Diminuir quantidade"
            >
              −
            </button>
            <span className="min-w-8 text-center text-sm font-medium">
              {line.quantity}
            </span>
            <button
              type="button"
              onClick={() =>
                updateQuantity(line.productId, line.variationId, line.quantity + 1)
              }
              disabled={line.quantity >= line.maxStock}
              className="px-3 py-2 hover:bg-gray-50 transition-colors disabled:opacity-40"
              aria-label="Aumentar quantidade"
            >
              +
            </button>
          </div>

          <p className="min-w-24 text-right font-semibold">
            {formatPrice(line.lineTotal)}
          </p>

          <button
            type="button"
            onClick={() => removeItem(line.productId, line.variationId)}
            className="text-sm text-gray-500 hover:text-red-600 transition-colors"
          >
            Remover
          </button>
        </div>
      </div>
    </div>
  )
}

export function CartContent() {
  const { items, itemCount, subtotal, clearCart, isHydrated } = useCart()
  const lines = resolveCartLines(items)

  if (!isHydrated) {
    return (
      <div className="py-16 text-center text-gray-600">Carregando carrinho...</div>
    )
  }

  if (lines.length === 0) {
    return (
      <div className="text-center py-16">
        <div className="text-6xl mb-4">🛒</div>
        <h2 className="text-2xl font-semibold mb-2">Carrinho Vazio</h2>
        <p className="text-gray-600 mb-8">
          Você não tem produtos no seu carrinho. Comece a explorar!
        </p>
        <Link href="/products" className={getButtonClassName('default', 'lg')}>
          Ir para Produtos
        </Link>
      </div>
    )
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
      <div className="lg:col-span-2">
        {lines.map((line) => (
          <CartLineItem
            key={`${line.productId}-${line.variationId}`}
            line={line}
          />
        ))}
      </div>

      <div className="lg:col-span-1">
        <div className="sticky top-24 rounded-lg border border-gray-200 p-6 space-y-4">
          <h2 className="text-lg font-semibold">Resumo</h2>

          <div className="flex justify-between text-sm">
            <span className="text-gray-600">Quantidade total</span>
            <span className="font-medium">
              {itemCount} {itemCount === 1 ? 'item' : 'itens'}
            </span>
          </div>

          <div className="flex justify-between border-t border-gray-200 pt-4">
            <span className="font-semibold">Subtotal</span>
            <span className="text-xl font-bold">{formatPrice(subtotal)}</span>
          </div>

          <Button
            size="lg"
            className="w-full"
            disabled
            title="Finalização via WhatsApp — disponível na Fase 6"
          >
            Finalizar Pedido
          </Button>

          <Link
            href="/products"
            className={getButtonClassName('outline', 'lg', 'w-full block text-center')}
          >
            Continuar comprando
          </Link>

          <button
            type="button"
            onClick={clearCart}
            className="w-full text-sm text-gray-500 hover:text-red-600 transition-colors"
          >
            Limpar carrinho
          </button>
        </div>
      </div>
    </div>
  )
}
