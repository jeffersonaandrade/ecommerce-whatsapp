/**
 * @vitest-environment jsdom
 */
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { cleanup, render, screen } from '@testing-library/react'
import { ProductPurchasePanel } from './product-purchase-panel'
import { Product } from '@/types/product'
import { PersonalizationSettings } from '@/types/personalization-settings'

const mockAddItem = vi.fn()

const mockSettings = vi.hoisted(() => ({
  current: {
    enabled: true,
    defaultPrice: 25,
    nameMaxLength: 15,
    numberMin: 0,
    numberMax: 99,
    notesRequired: false,
    notesMaxLength: 200,
    updatedAt: '',
  } satisfies PersonalizationSettings,
}))

vi.mock('@/context/cart-context', () => ({
  useCart: () => ({
    addItem: mockAddItem,
    personalizationSettings: mockSettings.current,
  }),
  useProductPersonalizationPrice: (product: Product) =>
    product.personalizationPrice != null
      ? product.personalizationPrice
      : mockSettings.current.defaultPrice,
}))

const baseProduct: Product = {
  id: '1',
  slug: 'camisa',
  name: 'Camisa',
  shortDescription: '',
  longDescription: '',
  price: 100,
  category: 'Camisas',
  images: [],
  variations: [{ id: 'v1', sku: 'SKU', stock: 10, size: 'M' }],
  status: 'active',
  personalizationEnabled: true,
  personalizationPrice: 35,
}

describe('ProductPurchasePanel — personalização', () => {
  beforeEach(() => {
    cleanup()
    mockAddItem.mockReset()
    mockSettings.current.enabled = true
  })

  it('renderiza bloco quando config global e produto estão ativos', () => {
    render(<ProductPurchasePanel product={baseProduct} />)

    expect(screen.getByText('Adicionar personalização')).toBeTruthy()
    expect(screen.getByText(/R\$ 35,00/)).toBeTruthy()
  })

  it('não renderiza quando config global está inativa', () => {
    mockSettings.current.enabled = false

    render(<ProductPurchasePanel product={baseProduct} />)

    expect(screen.queryByText('Adicionar personalização')).toBeNull()
  })

  it('não renderiza quando produto não está habilitado', () => {
    render(
      <ProductPurchasePanel
        product={{ ...baseProduct, personalizationEnabled: false }}
      />
    )

    expect(screen.queryByText('Adicionar personalização')).toBeNull()
  })

  it('usa preço global quando produto não define override', () => {
    render(
      <ProductPurchasePanel
        product={{ ...baseProduct, personalizationPrice: null }}
      />
    )

    expect(screen.getByText(/R\$ 25,00/)).toBeTruthy()
  })
})
