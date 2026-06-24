import { describe, expect, it } from 'vitest'
import { buildPurchaseIntentFromCart } from './build-purchase-intent'
import { buildWhatsAppMessage, buildWhatsAppUrl } from './build-whatsapp-message'
import type { CartLine } from '@/lib/cart-utils'

const sampleLines: CartLine[] = [
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
    lineTotal: 379.8,
    maxStock: 10,
  },
]

describe('buildPurchaseIntentFromCart', () => {
  it('monta intent com links PDP e total', () => {
    const intent = buildPurchaseIntentFromCart(sampleLines, 'https://loja.exemplo.com')
    expect(intent).not.toBeNull()
    expect(intent!.lines[0].productUrl).toBe(
      'https://loja.exemplo.com/products/camisa-flamengo-2024'
    )
    expect(intent!.cartTotal).toBe(379.8)
  })

  it('retorna null para carrinho vazio', () => {
    expect(buildPurchaseIntentFromCart([], 'https://loja.exemplo.com')).toBeNull()
  })
})

describe('buildWhatsAppMessage', () => {
  it('gera mensagem estruturada conforme arquitetura V1', () => {
    const intent = buildPurchaseIntentFromCart(sampleLines, 'https://loja.exemplo.com')!
    const message = buildWhatsAppMessage(intent)

    expect(message).toContain('Olá! Gostaria de solicitar este pedido.')
    expect(message).toContain('Camisa Flamengo 2024')
    expect(message).toContain('Tamanho: G')
    expect(message).toContain('SKU:')
    expect(message).toContain('Total:')
    expect(message).toContain('/products/camisa-flamengo-2024')
  })
})

describe('buildWhatsAppUrl', () => {
  it('monta link wa.me com telefone e mensagem', () => {
    const url = buildWhatsAppUrl('5511999999999', 'Olá')
    expect(url).toContain('https://wa.me/5511999999999')
    expect(url).toContain(encodeURIComponent('Olá'))
  })
})
