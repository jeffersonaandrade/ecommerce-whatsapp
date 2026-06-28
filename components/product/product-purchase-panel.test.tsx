/**
 * @vitest-environment jsdom
 */
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { cleanup, render, screen } from '@testing-library/react'
import { ProductPurchasePanel } from './product-purchase-panel'
import { Product } from '@/types/product'
import { PersonalizationSettings } from '@/types/personalization-settings'

const mockAddItem = vi.fn()
const mockRemoveItem = vi.fn()
const mockUpdateQuantity = vi.fn()
const mockItems = vi.hoisted(() => ({
  current: [] as Array<{
    productId: string
    variationId: string
    quantity: number
    addons?: { personalization?: { name: string; number: string } }
  }>,
}))
const mockSearchParams = vi.hoisted(() => ({
  get: vi.fn(() => null as string | null),
}))

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

vi.mock('next/navigation', () => ({
  useSearchParams: () => ({
    get: (key: string) => mockSearchParams.get(key),
  }),
}))

vi.mock('@/context/cart-context', () => ({
  useCart: () => ({
    addItem: mockAddItem,
    removeItem: mockRemoveItem,
    updateQuantity: mockUpdateQuantity,
    items: mockItems.current,
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
    mockRemoveItem.mockReset()
    mockUpdateQuantity.mockReset()
    mockItems.current = []
    mockSearchParams.get.mockReset()
    mockSearchParams.get.mockReturnValue(null)
    mockSettings.current.enabled = true
    Element.prototype.scrollIntoView = vi.fn()
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

  it('abre personalização automaticamente com ?personalizar=1', () => {
    mockSearchParams.get.mockImplementation((key: string) =>
      key === 'personalizar' ? '1' : null
    )

    render(<ProductPurchasePanel product={baseProduct} />)

    expect(screen.getByLabelText('Nome na camisa')).toBeTruthy()
    expect(screen.getByLabelText('Número')).toBeTruthy()
  })

  it('pré-seleciona variação com ?variation=', () => {
    mockSearchParams.get.mockImplementation((key: string) => {
      if (key === 'personalizar') return '1'
      if (key === 'variation') return 'v1'
      return null
    })

    render(<ProductPurchasePanel product={baseProduct} />)

    const sizeButton = screen.getByRole('button', { name: 'M' })
    expect(sizeButton.getAttribute('aria-pressed')).toBe('true')
  })

  it('substitui linha sem personalização ao adicionar via atalho do carrinho', async () => {
    mockSearchParams.get.mockImplementation((key: string) => {
      if (key === 'personalizar') return '1'
      if (key === 'fromCart') return '1'
      if (key === 'variation') return 'v1'
      return null
    })
    mockItems.current = [
      { productId: '1', variationId: 'v1', quantity: 1 },
    ]
    mockAddItem.mockReturnValue(null)

    const { default: userEvent } = await import('@testing-library/user-event')
    const user = userEvent.setup()

    render(<ProductPurchasePanel product={baseProduct} />)

    await user.type(screen.getByLabelText('Nome na camisa'), 'Jeff')
    await user.type(screen.getByLabelText('Número'), '10')
    await user.click(screen.getByRole('button', { name: 'Adicionar ao Carrinho' }))

    expect(mockRemoveItem).toHaveBeenCalledWith('1', 'v1', undefined)
    expect(mockUpdateQuantity).not.toHaveBeenCalled()
    expect(mockAddItem).toHaveBeenCalledWith(
      '1',
      'v1',
      1,
      expect.objectContaining({
        personalization: expect.objectContaining({ name: 'Jeff', number: '10' }),
      })
    )
  })

  it('decrementa qty da linha sem personalização quando qty > 1', async () => {
    mockSearchParams.get.mockImplementation((key: string) => {
      if (key === 'personalizar') return '1'
      if (key === 'fromCart') return '1'
      if (key === 'variation') return 'v1'
      return null
    })
    mockItems.current = [
      { productId: '1', variationId: 'v1', quantity: 3 },
    ]
    mockAddItem.mockReturnValue(null)

    const { default: userEvent } = await import('@testing-library/user-event')
    const user = userEvent.setup()

    render(<ProductPurchasePanel product={baseProduct} />)

    await user.type(screen.getByLabelText('Nome na camisa'), 'Jeff')
    await user.type(screen.getByLabelText('Número'), '10')
    await user.click(screen.getByRole('button', { name: 'Adicionar ao Carrinho' }))

    expect(mockUpdateQuantity).toHaveBeenCalledWith('1', 'v1', 2, undefined)
    expect(mockRemoveItem).not.toHaveBeenCalled()
  })
})
