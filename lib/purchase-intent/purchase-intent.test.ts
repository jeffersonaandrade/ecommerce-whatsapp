import { describe, expect, it } from 'vitest'
import { buildPurchaseIntentFromCart } from './build-purchase-intent'
import { buildWhatsAppMessage, buildWhatsAppUrl } from './build-whatsapp-message'
import type { CartPricing } from '@/types/cart-pricing'

const samplePricing: CartPricing = {
  lines: [
    {
      productId: '1',
      variationId: 'v1',
      quantity: 2,
      name: 'Camisa Flamengo 2024',
      slug: 'camisa-flamengo-2024',
      sku: 'CAM-FLA-G',
      image: '',
      size: 'G',
      color: 'Vermelha',
      unitPrice: 189.9,
      addonsUnitTotal: 0,
      lineMerchandiseTotal: 379.8,
      maxStock: 10,
    },
  ],
  merchandiseSubtotal: 379.8,
  addonsSubtotal: 0,
  commercialDiscount: 0,
  cartTotal: 379.8,
}

describe('buildPurchaseIntentFromCart', () => {
  it('monta intent com links PDP e total', () => {
    const intent = buildPurchaseIntentFromCart(samplePricing, 'https://loja.exemplo.com')
    expect(intent).not.toBeNull()
    expect(intent!.lines[0].productUrl).toBe(
      'https://loja.exemplo.com/products/camisa-flamengo-2024'
    )
    expect(intent!.cartTotal).toBe(379.8)
    expect(intent!.merchandiseSubtotal).toBe(379.8)
  })

  it('retorna null para carrinho vazio', () => {
    const empty: CartPricing = {
      lines: [],
      merchandiseSubtotal: 0,
      addonsSubtotal: 0,
      commercialDiscount: 0,
      cartTotal: 0,
    }
    expect(buildPurchaseIntentFromCart(empty, 'https://loja.exemplo.com')).toBeNull()
  })
})

describe('buildWhatsAppMessage', () => {
  it('gera mensagem estruturada conforme arquitetura V1', () => {
    const intent = buildPurchaseIntentFromCart(samplePricing, 'https://loja.exemplo.com')!
    const message = buildWhatsAppMessage(intent)

    expect(message).toContain('Pedido #')
    expect(message).toContain('TEMP-')
    expect(message).toContain('Olá! Gostaria de solicitar este pedido.')
    expect(message).toContain('Camisa Flamengo 2024')
    expect(message).toContain('Tamanho: G')
    expect(message).toContain('SKU:')
    expect(message).toContain('Total:')
    expect(message).toContain('/products/camisa-flamengo-2024')
  })

  it('inclui desconto comercial quando aplicável', () => {
    const intent = buildPurchaseIntentFromCart(
      {
        ...samplePricing,
        commercialDiscount: 50,
        appliedRule: {
          ruleId: 'r1',
          ruleName: 'Leve 3',
          ruleType: 'quantity_discount',
          eligibleQuantity: 3,
          discountGroups: 1,
          discountAmount: 50,
        },
        cartTotal: 329.8,
      },
      'https://loja.exemplo.com'
    )!
    const message = buildWhatsAppMessage(intent)
    expect(message).toContain('Desconto (Leve 3)')
    expect(message).toContain('Total:')
  })
})

describe('buildWhatsAppUrl', () => {
  it('monta link wa.me com telefone e mensagem', () => {
    const url = buildWhatsAppUrl('5511999999999', 'Olá')
    expect(url).toContain('https://wa.me/5511999999999')
    expect(url).toContain(encodeURIComponent('Olá'))
  })
})
