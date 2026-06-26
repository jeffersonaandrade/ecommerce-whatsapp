import { describe, expect, it } from 'vitest'
import { canonicalImportSlug } from './canonical-import-slug'
import { prepareImportBatch } from './prepare-import-batch'
import type { ParsedProduct } from './types'
import type { Product } from '@/types/product'

function parsedProduct(overrides: Partial<ParsedProduct> = {}): ParsedProduct {
  return {
    slug: 'camisa-brasil',
    name: 'Camisa Brasil',
    longDescription: 'Descrição longa',
    price: 199,
    category: 'camisas',
    brand: 'Nike',
    images: ['https://cdn.example.com/a.jpg'],
    variations: [{ sku: 'BRA-P', stock: 5, size: 'P', rowNumber: 2 }],
    rowNumbers: [2],
    ...overrides,
  }
}

function catalogProduct(overrides: Partial<Product> = {}): Product {
  return {
    id: 'existing-1',
    slug: 'camisa-brasil-26-27-jogador-manga-longa--preto-11vod',
    name: 'Camisa antiga',
    shortDescription: '',
    longDescription: '',
    price: 100,
    category: 'camisas',
    images: [],
    variations: [{ id: 'v1', sku: 'BRA-P', stock: 1, size: 'P' }],
    status: 'draft',
    ...overrides,
  }
}

describe('canonicalImportSlug', () => {
  it('converte -- em slug canonico', () => {
    expect(
      canonicalImportSlug('camisa-psg-26-27-jogador-manga-longa--preto-11vod')
    ).toBe('camisa-psg-26-27-jogador-manga-longa-preto-11vod')
  })
})

describe('prepareImportBatch', () => {
  it('classifica produto existente por slug canonico como update', () => {
    const slug = 'camisa-psg-26-27-jogador-manga-longa--preto-11vod'
    const catalog = [catalogProduct({ slug })]
    const batch = prepareImportBatch(
      [parsedProduct({ slug, name: 'Camisa PSG' })],
      catalog,
      { batchId: 'batch-1', policy: 'draft', idFactory: () => 'new-id' }
    )

    expect(batch.updated).toBe(1)
    expect(batch.created).toBe(0)
    expect(batch.items[0].isUpdate).toBe(true)
    expect(batch.items[0].product.id).toBe('existing-1')
    expect(batch.items[0].product.slug).toBe(
      'camisa-psg-26-27-jogador-manga-longa-preto-11vod'
    )
    expect(batch.items[0].product.importBatchId).toBe('batch-1')
  })

  it('classifica 39 updates e 52 creates em lote simulado', () => {
    const catalog: Product[] = Array.from({ length: 39 }, (_, index) =>
      catalogProduct({
        id: `p-${index + 1}`,
        slug: `produto-${index + 1}--legacy`,
        variations: [{ id: `v-${index}`, sku: `SKU-${index}`, stock: 1 }],
      })
    )
    const incoming: ParsedProduct[] = Array.from({ length: 91 }, (_, index) =>
      parsedProduct({
        slug: index < 39 ? `produto-${index + 1}--legacy` : `novo-produto-${index + 1}`,
        name: `Produto ${index + 1}`,
        variations: [{ sku: `SKU-${index}`, stock: 2, rowNumber: index + 2 }],
      })
    )

    const batch = prepareImportBatch(incoming, catalog, {
      batchId: 'batch-recovery',
      policy: 'draft',
      idFactory: () => crypto.randomUUID(),
    })

    expect(batch.updated).toBe(39)
    expect(batch.created).toBe(52)
    expect(batch.items).toHaveLength(91)
  })

  it('preserva importBatchId nos produtos preparados', () => {
    const batch = prepareImportBatch([parsedProduct()], [], {
      batchId: 'batch-xyz',
      policy: 'draft',
    })
    expect(batch.items[0].product.importBatchId).toBe('batch-xyz')
  })

  it('rejeita slug duplicado apos canonicalizacao', () => {
    expect(() =>
      prepareImportBatch(
        [
          parsedProduct({ slug: 'produto-a--x' }),
          parsedProduct({ slug: 'produto-a-x', name: 'Outro' }),
        ],
        [],
        { batchId: 'batch-dup', policy: 'draft' }
      )
    ).toThrow(/slug canônico/)
  })
})
