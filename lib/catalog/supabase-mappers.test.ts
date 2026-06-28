import { describe, expect, it } from 'vitest'
import { productToRow, rowsToProduct } from './supabase-mappers'
import { Product } from '@/types/product'

const baseProduct: Product = {
  id: 'prod-1',
  slug: 'camisa-teste',
  name: 'Camisa Teste',
  shortDescription: 'Resumo',
  longDescription: 'Descrição',
  price: 199.9,
  category: 'Camisas',
  images: ['https://example.com/img.jpg'],
  variations: [{ id: 'v1', sku: 'SKU-1', stock: 5, size: 'M' }],
  status: 'active',
  personalizationEnabled: true,
  personalizationPrice: 35,
}

describe('supabase product mappers — personalização', () => {
  it('rowsToProduct lê personalization_enabled e personalization_price', () => {
    const product = rowsToProduct(
      {
        id: 'prod-1',
        slug: 'camisa',
        name: 'Camisa',
        short_description: 'Resumo',
        price: 100,
        promotional_price: null,
        category: 'Camisas',
        club: null,
        images: [],
        status: 'active',
        import_batch_id: null,
        personalization_enabled: true,
        personalization_price: 42.5,
      },
      [{ id: 'v1', product_id: 'prod-1', sku: 'SKU', stock: 1, size: 'M', color: null }]
    )

    expect(product.personalizationEnabled).toBe(true)
    expect(product.personalizationPrice).toBe(42.5)
  })

  it('productToRow persiste personalization e trata preço 0 sem virar null', () => {
    const row = productToRow({ ...baseProduct, personalizationPrice: 0 })

    expect(row.personalization_enabled).toBe(true)
    expect(row.personalization_price).toBe(0)
  })

  it('roundtrip mantém campos de personalização', () => {
    const row = productToRow(baseProduct)
    const restored = rowsToProduct(row, [
      {
        id: 'v1',
        product_id: 'prod-1',
        sku: 'SKU-1',
        stock: 5,
        size: 'M',
        color: null,
      },
    ])

    expect(restored.personalizationEnabled).toBe(true)
    expect(restored.personalizationPrice).toBe(35)
  })
})
