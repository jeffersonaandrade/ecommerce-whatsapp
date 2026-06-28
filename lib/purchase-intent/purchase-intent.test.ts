import { describe, expect, it } from 'vitest'
import { computeTotals } from '@/lib/pricing/compute-totals'
import { buildPurchaseIntentFromCart } from './build-purchase-intent'
import { buildWhatsAppMessage, buildWhatsAppUrl } from './build-whatsapp-message'
import { enrichPricingWithCartItems } from './enrich-pricing-with-cart-items'
import type { CartPricing } from '@/types/cart-pricing'
import { Product } from '@/types/product'
import { PersonalizationSettings } from '@/types/personalization-settings'

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

const personalizedProduct: Product = {
  id: 'p1',
  slug: 'camisa-real-madrid',
  name: 'Camisa Real Madrid 25/26',
  shortDescription: '',
  longDescription: '',
  price: 159.9,
  category: 'camisas',
  images: [],
  variations: [{ id: 'v1', sku: 'SKU-RM-P', stock: 10, size: 'P' }],
  status: 'active',
  personalizationEnabled: true,
  personalizationPrice: 30,
}

const personalizationSettings: PersonalizationSettings = {
  enabled: true,
  defaultPrice: 30,
  nameMaxLength: 15,
  numberMin: 1,
  numberMax: 99,
  notesRequired: false,
  notesMaxLength: 200,
  updatedAt: '',
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

  it('inclui nome, número e observação da personalização por item', () => {
    const pricing: CartPricing = {
      lines: [
        {
          productId: 'p1',
          variationId: 'v1',
          quantity: 1,
          name: personalizedProduct.name,
          slug: personalizedProduct.slug,
          sku: 'SKU-RM-P',
          image: '',
          size: 'P',
          unitPrice: 159.9,
          addons: {
            personalization: {
              name: 'Jefferson Andrade',
              number: '10',
              notes: 'testando',
            },
          },
          addonsUnitTotal: 30,
          lineMerchandiseTotal: 189.9,
          maxStock: 10,
        },
      ],
      merchandiseSubtotal: 189.9,
      addonsSubtotal: 30,
      commercialDiscount: 0,
      cartTotal: 189.9,
    }

    const intent = buildPurchaseIntentFromCart(pricing, 'https://loja-unitsports')!
    const message = buildWhatsAppMessage(intent)

    expect(message).toContain('Nome na camisa: Jefferson Andrade')
    expect(message).toContain('Número: 10')
    expect(message).toContain('Observação: testando')
    expect(message).toMatch(/Taxa personalização: \+R\$[\u00a0 ]30,00/)
    expect(message).toMatch(/Total personalização: R\$[\u00a0 ]30,00/)
    expect(message).toMatch(/Produto: R\$[\u00a0 ]159,90/)
    expect(message).toMatch(/Total linha: R\$[\u00a0 ]189,90/)
  })

  it('monta mensagem com personalização a partir do carrinho precificado', () => {
    const pricing = computeTotals(
      [
        {
          productId: 'p1',
          variationId: 'v1',
          quantity: 1,
          addons: {
            personalization: {
              name: 'Jefferson Andrade',
              number: '10',
              notes: 'testando',
            },
          },
        },
      ],
      {
        getProductById: () => personalizedProduct,
        personalizationSettings,
        commercialRules: [],
      }
    )

    const intent = buildPurchaseIntentFromCart(pricing, 'https://loja-unitsports')!
    const message = buildWhatsAppMessage(intent)

    expect(message).toContain('Nome na camisa: Jefferson Andrade')
    expect(message).toContain('Número: 10')
    expect(message).toContain('Observação: testando')
  })

  it('recupera addons do carrinho quando a linha precificada não os traz', () => {
    const pricing: CartPricing = {
      lines: [
        {
          productId: 'p1',
          variationId: 'v1',
          quantity: 1,
          name: personalizedProduct.name,
          slug: personalizedProduct.slug,
          sku: 'SKU-RM-P',
          image: '',
          size: 'P',
          unitPrice: 159.9,
          addonsUnitTotal: 30,
          lineMerchandiseTotal: 189.9,
          maxStock: 10,
        },
      ],
      merchandiseSubtotal: 189.9,
      addonsSubtotal: 30,
      commercialDiscount: 0,
      cartTotal: 189.9,
    }

    const items = [
      {
        productId: 'p1',
        variationId: 'v1',
        quantity: 1,
        addons: {
          personalization: {
            name: 'Jefferson Andrade',
            number: '10',
            notes: 'testando',
          },
        },
      },
    ]

    const enriched = enrichPricingWithCartItems(pricing, items)
    const intent = buildPurchaseIntentFromCart(enriched, 'https://loja-unitsports')!
    const message = buildWhatsAppMessage(intent)

    expect(enriched.lines[0].addons?.personalization?.name).toBe('Jefferson Andrade')
    expect(message).toContain('Nome na camisa: Jefferson Andrade')
  })
})

describe('buildWhatsAppUrl', () => {
  it('monta link wa.me com telefone e mensagem', () => {
    const url = buildWhatsAppUrl('5511999999999', 'Olá')
    expect(url).toContain('https://wa.me/5511999999999')
    expect(url).toContain(encodeURIComponent('Olá'))
  })
})
