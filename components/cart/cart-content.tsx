'use client'

import Link from 'next/link'
import { useCart } from '@/context/cart-context'
import { formatPrice } from '@/lib/formatters'
import { resolveCartLines } from '@/lib/cart-utils'
import { Button, getButtonClassName } from '@/components/ui/button'
import { CartLineItem } from '@/components/cart/cart-line-item'

export function CartContent() {
  const { items, itemCount, subtotal, clearCart, isHydrated } = useCart()
  const lines = resolveCartLines(items)

  if (!isHydrated) {
    return (
      <p className="py-16 text-center text-mute">Carregando carrinho...</p>
    )
  }

  if (lines.length === 0) {
    return (
      <div className="border border-hairline bg-soft-cloud px-6 py-16 text-center">
        <h2 className="text-2xl font-bold tracking-tight text-ink">
          Seu carrinho está vazio
        </h2>
        <p className="mx-auto mt-2 max-w-md text-mute">
          Explore o catálogo e adicione produtos para continuar.
        </p>
        <Link
          href="/products"
          className={`mt-8 inline-flex ${getButtonClassName('default', 'lg')}`}
        >
          Continuar comprando
        </Link>
      </div>
    )
  }

  return (
    <div className="grid grid-cols-1 gap-8 lg:grid-cols-3 lg:gap-12">
      {/* Line items — DS §5 cart list 2 cols span */}
      <div className="lg:col-span-2">
        <div className="divide-y divide-hairline border-y border-hairline">
          {lines.map((line) => (
            <CartLineItem
              key={`${line.productId}-${line.variationId}`}
              line={line}
            />
          ))}
        </div>
      </div>

      {/* Summary — DS §5 sticky; §8 hairline + shadow-sm exception */}
      <div className="lg:col-span-1">
        <aside className="sticky top-24 space-y-5 border border-hairline bg-canvas p-6 shadow-sm">
          <h2 className="text-sm font-semibold uppercase tracking-wide text-ink">
            Resumo do pedido
          </h2>

          <div className="flex justify-between text-sm">
            <span className="text-mute">Itens</span>
            <span className="font-medium text-ink">
              {itemCount} {itemCount === 1 ? 'item' : 'itens'}
            </span>
          </div>

          <div className="flex items-baseline justify-between border-t border-hairline pt-4">
            <span className="font-semibold text-ink">Subtotal</span>
            <span className="text-2xl font-bold text-ink">
              {formatPrice(subtotal)}
            </span>
          </div>

          <div className="space-y-3 pt-1">
            <Button
              size="lg"
              className="w-full"
              disabled
              title="Finalização via WhatsApp — disponível na Fase 6"
            >
              Finalizar pedido
            </Button>

            <Link
              href="/products"
              className={getButtonClassName(
                'outline',
                'lg',
                'w-full justify-center'
              )}
            >
              Continuar comprando
            </Link>

            <button
              type="button"
              onClick={clearCart}
              className="w-full text-sm font-medium text-mute transition-colors hover:text-error"
            >
              Limpar carrinho
            </button>
          </div>
        </aside>
      </div>
    </div>
  )
}
