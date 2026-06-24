'use client'

import { useMemo, useState } from 'react'
import { useCart } from '@/context/cart-context'
import { CART_STORAGE_KEY, loadCartItems } from '@/lib/cart-storage'
import { resolveCartLines } from '@/lib/cart-utils'

const MOCK_PRODUCT_ID = '1'
const MOCK_VARIATION_ID = 'v1'
const MOCK_VARIATION_ID_ALT = 'v2'

export function CartTestClient() {
  const cart = useCart()
  const [variationId, setVariationId] = useState(MOCK_VARIATION_ID)

  const lines = useMemo(() => resolveCartLines(cart.items), [cart.items])
  const localStorageRaw =
    typeof window !== 'undefined'
      ? localStorage.getItem(CART_STORAGE_KEY)
      : null

  function handleRemoveFirst() {
    const first = cart.items[0]
    if (!first) return
    cart.removeItem(first.productId, first.variationId)
  }

  return (
    <div className="mx-auto max-w-4xl px-4 py-8 font-mono text-sm space-y-8">
      <header>
        <h1 className="text-2xl font-bold mb-1">Cart QA (dev only)</h1>
        <p className="text-gray-600">/dev/cart-test</p>
      </header>

      <section className="border border-gray-300 rounded p-4 space-y-2">
        <h2 className="font-bold text-base">Estado do carrinho</h2>
        <p>itemCount: {cart.itemCount}</p>
        <p>subtotal: {cart.subtotal.toFixed(2)}</p>
        <p>linhas (resolveCartLines): {lines.length}</p>
        <p>items (context): {cart.items.length}</p>
        <p>isHydrated: {String(cart.isHydrated)}</p>
        <pre className="bg-gray-100 p-3 rounded overflow-auto text-xs">
          {JSON.stringify(cart.items, null, 2)}
        </pre>
      </section>

      <section className="border border-gray-300 rounded p-4 space-y-3">
        <h2 className="font-bold text-base">Ferramentas rápidas</h2>
        <div className="flex flex-wrap gap-2">
          <button
            type="button"
            className="border border-black px-3 py-1 rounded hover:bg-gray-100"
            onClick={() => cart.addItem(MOCK_PRODUCT_ID, MOCK_VARIATION_ID, 1)}
          >
            Adicionar produto mock (id=1, v1)
          </button>
          <div className="flex items-center gap-2">
            <input
              type="text"
              value={variationId}
              onChange={(e) => setVariationId(e.target.value)}
              className="border border-gray-400 px-2 py-1 w-24"
              aria-label="variationId"
            />
            <button
              type="button"
              className="border border-black px-3 py-1 rounded hover:bg-gray-100"
              onClick={() =>
                cart.addItem(MOCK_PRODUCT_ID, variationId, 1)
              }
            >
              Adicionar variação específica
            </button>
          </div>
          <button
            type="button"
            className="border border-black px-3 py-1 rounded hover:bg-gray-100"
            onClick={handleRemoveFirst}
            disabled={cart.items.length === 0}
          >
            Remover primeiro item
          </button>
          <button
            type="button"
            className="border border-red-600 text-red-600 px-3 py-1 rounded hover:bg-red-50"
            onClick={cart.clearCart}
          >
            Limpar carrinho
          </button>
        </div>
        <p className="text-xs text-gray-500">
          Mock: produto 1 = Camisa São Paulo; variações v1–v4. Alternativa: v2 ={' '}
          {MOCK_VARIATION_ID_ALT}
        </p>
      </section>

      <section className="border border-gray-300 rounded p-4 space-y-2">
        <h2 className="font-bold text-base">Debug</h2>
        <h3 className="font-semibold">CartContext (resumo)</h3>
        <pre className="bg-gray-100 p-3 rounded overflow-auto text-xs">
          {JSON.stringify(
            {
              itemCount: cart.itemCount,
              subtotal: cart.subtotal,
              isHydrated: cart.isHydrated,
              items: cart.items,
            },
            null,
            2
          )}
        </pre>

        <h3 className="font-semibold">localStorage ({CART_STORAGE_KEY})</h3>
        <pre className="bg-gray-100 p-3 rounded overflow-auto text-xs">
          {localStorageRaw ?? '(vazio)'}
        </pre>
        <p className="text-xs text-gray-500">
          Parsed via loadCartItems():{' '}
          {JSON.stringify(loadCartItems())}
        </p>

        <h3 className="font-semibold">resolveCartLines()</h3>
        <pre className="bg-gray-100 p-3 rounded overflow-auto text-xs max-h-64">
          {JSON.stringify(lines, null, 2)}
        </pre>
      </section>
    </div>
  )
}
