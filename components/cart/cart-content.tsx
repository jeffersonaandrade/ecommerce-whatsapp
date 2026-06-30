'use client'

import Link from 'next/link'
import { useState } from 'react'
import { useCart } from '@/context/cart-context'
import { getCartDiscountDisplay } from '@/lib/commercial/engine/discount-trace-display'
import { formatPrice } from '@/lib/formatters'
import { Button, getButtonClassName } from '@/components/ui/button'
import { CartLineItem } from '@/components/cart/cart-line-item'
import { buildPurchaseIntentFromCart } from '@/lib/purchase-intent/build-purchase-intent'
import { enrichPricingWithCartItems } from '@/lib/purchase-intent/enrich-pricing-with-cart-items'
import {
  buildWhatsAppMessage,
  buildWhatsAppUrl,
} from '@/lib/purchase-intent/build-whatsapp-message'
import { cartItemKey } from '@/lib/cart-storage'

type CartContentProps = {
  siteUrl: string
  whatsappPhone: string
  whatsappMessagePrefix?: string
}

export function CartContent({
  siteUrl,
  whatsappPhone,
  whatsappMessagePrefix = '',
}: CartContentProps) {
  const {
    pricing,
    itemCount,
    clearCart,
    isHydrated,
    items,
    couponInput,
    appliedCouponCode,
    applyCoupon,
    removeCoupon,
  } = useCart()
  const [couponDraft, setCouponDraft] = useState(couponInput)
  const discountDisplay = getCartDiscountDisplay(pricing.trace)

  function handleWhatsAppCheckout() {
    const enrichedPricing = enrichPricingWithCartItems(pricing, items)
    const intent = buildPurchaseIntentFromCart(enrichedPricing, siteUrl)
    if (!intent) return

    const message = buildWhatsAppMessage(intent, whatsappMessagePrefix)
    const url = buildWhatsAppUrl(whatsappPhone, message)
    window.open(url, '_blank', 'noopener,noreferrer')
  }

  if (!isHydrated) {
    return (
      <p className="py-16 text-center text-mute">Carregando carrinho...</p>
    )
  }

  if (pricing.lines.length === 0) {
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
      <div className="lg:col-span-2">
        <div className="divide-y divide-hairline border-y border-hairline">
          {pricing.lines.map((line) => (
            <CartLineItem
              key={cartItemKey(line.productId, line.variationId, line.addons)}
              line={line}
            />
          ))}
        </div>
      </div>

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

          <div className="space-y-2 border-t border-hairline pt-4 text-sm">
            <div className="space-y-2">
              <label className="block text-xs font-medium uppercase tracking-wide text-mute">
                Cupom de desconto
              </label>
              <div className="flex gap-2">
                <input
                  type="text"
                  value={couponDraft}
                  onChange={(e) => setCouponDraft(e.target.value.toUpperCase())}
                  placeholder="Código do cupom"
                  className="min-w-0 flex-1 rounded-lg border border-hairline px-3 py-2 text-sm uppercase"
                />
                {appliedCouponCode ? (
                  <button
                    type="button"
                    onClick={() => {
                      removeCoupon()
                      setCouponDraft('')
                    }}
                    className="shrink-0 rounded-lg border border-hairline px-3 py-2 text-xs font-medium text-mute hover:text-ink"
                  >
                    Remover
                  </button>
                ) : (
                  <button
                    type="button"
                    onClick={() => applyCoupon(couponDraft)}
                    className="shrink-0 rounded-lg border border-hairline bg-soft-cloud px-3 py-2 text-xs font-medium text-ink hover:bg-canvas"
                  >
                    Aplicar
                  </button>
                )}
              </div>
              {pricing.pricingErrors?.map((err) => (
                <p key={err.code} className="text-xs text-error">
                  {err.message}
                </p>
              ))}
              {appliedCouponCode && !pricing.pricingErrors?.length ? (
                <p className="text-xs text-success">Cupom {appliedCouponCode} aplicado.</p>
              ) : null}
            </div>

            <div className="flex justify-between">
              <span className="text-mute">Subtotal produtos</span>
              <span className="text-ink">{formatPrice(pricing.merchandiseSubtotal)}</span>
            </div>
            {pricing.addonsSubtotal > 0 && (
              <div className="flex justify-between">
                <span className="text-mute">Personalização</span>
                <span className="text-ink">{formatPrice(pricing.addonsSubtotal)}</span>
              </div>
            )}
            {discountDisplay.lines.length > 0 ? (
              <>
                {discountDisplay.lines.map((line) => (
                  <div key={line.label} className="flex justify-between text-success">
                    <span>{line.label}</span>
                    <span>-{formatPrice(line.amount)}</span>
                  </div>
                ))}
                {discountDisplay.lines.length > 1 && (
                  <div className="flex justify-between font-medium text-success">
                    <span>Total de descontos</span>
                    <span>-{formatPrice(discountDisplay.total)}</span>
                  </div>
                )}
              </>
            ) : (
              pricing.commercialDiscount > 0 && (
                <div className="flex justify-between text-success">
                  <span>
                    Desconto
                    {pricing.appliedRule?.ruleName
                      ? ` (${pricing.appliedRule.ruleName})`
                      : ''}
                  </span>
                  <span>-{formatPrice(pricing.commercialDiscount)}</span>
                </div>
              )
            )}
          </div>

          <div className="flex items-baseline justify-between border-t border-hairline pt-4">
            <span className="font-semibold text-ink">Total</span>
            <span className="text-2xl font-bold text-ink">
              {formatPrice(pricing.cartTotal)}
            </span>
          </div>

          <div className="space-y-3 pt-1">
            <Button
              size="lg"
              className="w-full"
              onClick={handleWhatsAppCheckout}
            >
              Finalizar via WhatsApp
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
