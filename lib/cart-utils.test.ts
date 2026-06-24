import { describe, expect, it, vi, beforeEach } from 'vitest'
import { resolveProductPrice, resolveCartLines } from '@/lib/cart-utils'
import type { Product } from '@/types/product'

vi.mock('@/lib/products', () => ({
  getProductById: vi.fn(),
}))

import { getProductById } from '@/lib/products'

const baseProduct: Product = {
  id: '1',
  name: 'Camisa Teste',
  slug: 'camisa-teste',
  shortDescription: 'Desc',
  longDescription: 'Long',
  price: 100,
  category: 'Camisas',
  images: ['https://example.com/img.jpg'],
  variations: [
    { id: 'v1', size: 'M', color: 'Vermelho', sku: 'SKU-1', stock: 10 },
    { id: 'v2', size: 'G', color: 'Vermelho', sku: 'SKU-2', stock: 0 },
  ],
  status: 'active',
}

describe('resolveProductPrice', () => {
  it('retorna preço normal sem promoção', () => {
    expect(resolveProductPrice({ ...baseProduct, promotionalPrice: undefined })).toBe(
      100
    )
  })

  it('retorna preço promocional quando menor que o preço', () => {
    expect(
      resolveProductPrice({ ...baseProduct, promotionalPrice: 79.99 })
    ).toBe(79.99)
  })

  it('retorna preço normal quando promoção não é menor', () => {
    expect(
      resolveProductPrice({ ...baseProduct, promotionalPrice: 100 })
    ).toBe(100)
    expect(
      resolveProductPrice({ ...baseProduct, promotionalPrice: 120 })
    ).toBe(100)
  })
})

describe('resolveCartLines', () => {
  beforeEach(() => {
    vi.mocked(getProductById).mockReset()
  })

  it('resolve linha válida com preço promocional', () => {
    vi.mocked(getProductById).mockReturnValue({
      ...baseProduct,
      promotionalPrice: 80,
    })

    const lines = resolveCartLines([
      { productId: '1', variationId: 'v1', quantity: 2 },
    ])

    expect(lines).toHaveLength(1)
    expect(lines[0].name).toBe('Camisa Teste')
    expect(lines[0].unitPrice).toBe(80)
    expect(lines[0].lineTotal).toBe(160)
    expect(lines[0].quantity).toBe(2)
  })

  it('ignora produto inexistente', () => {
    vi.mocked(getProductById).mockReturnValue(undefined)

    const lines = resolveCartLines([
      { productId: '999', variationId: 'v1', quantity: 1 },
    ])

    expect(lines).toHaveLength(0)
  })

  it('ignora variação inexistente', () => {
    vi.mocked(getProductById).mockReturnValue(baseProduct)

    const lines = resolveCartLines([
      { productId: '1', variationId: 'invalid', quantity: 1 },
    ])

    expect(lines).toHaveLength(0)
  })

  it('ignora variação sem estoque', () => {
    vi.mocked(getProductById).mockReturnValue(baseProduct)

    const lines = resolveCartLines([
      { productId: '1', variationId: 'v2', quantity: 1 },
    ])

    expect(lines).toHaveLength(0)
  })

  it('ignora produto inativo', () => {
    vi.mocked(getProductById).mockReturnValue({
      ...baseProduct,
      status: 'draft',
    })

    const lines = resolveCartLines([
      { productId: '1', variationId: 'v1', quantity: 1 },
    ])

    expect(lines).toHaveLength(0)
  })
})
