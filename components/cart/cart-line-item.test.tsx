/**
 * @vitest-environment jsdom
 */
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { cleanup, render, screen } from '@testing-library/react'
import { CartLineItem } from './cart-line-item'
import type { PricedCartLine } from '@/types/cart-pricing'
import { mockPricedCartLine } from '@/lib/pricing/mock-priced-cart-line'
import { Product } from '@/types/product'
import { PersonalizationSettings } from '@/types/personalization-settings'

const mockGetProductById = vi.fn()

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

vi.mock('@/context/cart-context', () => ({
  useCart: () => ({
    updateQuantity: vi.fn(),
    removeItem: vi.fn(),
    personalizationSettings,
    isHydrated: true,
  }),
}))

vi.mock('@/lib/products-client', () => ({
  getProductById: (...args: unknown[]) => mockGetProductById(...args),
}))

vi.mock('next/image', () => ({
  default: () => null,
}))

const product: Product = {
  id: 'p1',
  slug: 'camisa-x',
  name: 'Camisa X',
  shortDescription: '',
  longDescription: '',
  price: 159.9,
  category: 'camisas',
  images: ['https://example.com/img.jpg'],
  variations: [{ id: 'v1', sku: 'SKU', stock: 5, size: 'P' }],
  status: 'active',
  personalizationEnabled: true,
}

const baseLine: PricedCartLine = mockPricedCartLine({
  productId: 'p1',
  variationId: 'v1',
  quantity: 1,
  unitPrice: 159.9,
  name: 'Camisa X',
  slug: 'camisa-x',
  sku: 'SKU',
  image: 'https://example.com/img.jpg',
  size: 'P',
  maxStock: 5,
})

describe('CartLineItem — atalho de personalização', () => {
  beforeEach(() => {
    cleanup()
    mockGetProductById.mockReset()
    mockGetProductById.mockReturnValue(product)
  })

  it('mostra atalho para item elegível sem personalização', () => {
    render(<CartLineItem line={baseLine} />)

    expect(screen.getByText('Quer adicionar nome e número?')).toBeTruthy()
    expect(
      screen.getByText('Você será levado ao produto para preencher a personalização.')
    ).toBeTruthy()
    const link = screen.getByRole('link', { name: 'Adicionar nome e número' })
    expect(link.getAttribute('href')).toBe(
      '/products/camisa-x?personalizar=1&fromCart=1&variation=v1'
    )
  })

  it('não mostra atalho quando item já tem personalização', () => {
    render(
      <CartLineItem
        line={{
          ...baseLine,
          addons: { personalization: { name: 'Jeff', number: '10' } },
          addonsUnitTotal: 30,
          lineMerchandiseTotal: 189.9,
        }}
      />
    )

    expect(screen.queryByText('Quer adicionar nome e número?')).toBeNull()
    expect(screen.getByText('Nome: Jeff')).toBeTruthy()
  })

  it('não mostra atalho quando produto não é personalizável', () => {
    mockGetProductById.mockReturnValue({
      ...product,
      personalizationEnabled: false,
    })

    render(<CartLineItem line={baseLine} />)

    expect(screen.queryByRole('link', { name: 'Adicionar nome e número' })).toBeNull()
  })
})
