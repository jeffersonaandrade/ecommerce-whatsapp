import { describe, expect, it } from 'vitest'
import {
  buildPersonalizationPdpUrl,
  canShowPersonalizationShortcut,
} from './personalization-shortcut'
import { Product } from '@/types/product'

const product: Product = {
  id: 'p1',
  slug: 'camisa-x',
  name: 'Camisa X',
  shortDescription: '',
  longDescription: '',
  price: 100,
  category: 'camisas',
  images: [],
  variations: [{ id: 'v1', sku: 'SKU', stock: 5, size: 'M' }],
  status: 'active',
  personalizationEnabled: true,
}

const line = {
  addons: undefined,
  maxStock: 5,
}

describe('canShowPersonalizationShortcut', () => {
  it('retorna true quando elegível', () => {
    expect(
      canShowPersonalizationShortcut({
        globalEnabled: true,
        product,
        line,
        isCatalogReady: true,
      })
    ).toBe(true)
  })

  it('retorna false quando global está inativa', () => {
    expect(
      canShowPersonalizationShortcut({
        globalEnabled: false,
        product,
        line,
      })
    ).toBe(false)
  })

  it('retorna false quando produto não personalizável', () => {
    expect(
      canShowPersonalizationShortcut({
        globalEnabled: true,
        product: { ...product, personalizationEnabled: false },
        line,
      })
    ).toBe(false)
  })

  it('retorna false quando item já tem personalização', () => {
    expect(
      canShowPersonalizationShortcut({
        globalEnabled: true,
        product,
        line: {
          addons: { personalization: { name: 'A', number: '10' } },
          maxStock: 5,
        },
      })
    ).toBe(false)
  })

  it('retorna false quando produto não foi resolvido', () => {
    expect(
      canShowPersonalizationShortcut({
        globalEnabled: true,
        product: undefined,
        line,
      })
    ).toBe(false)
  })

  it('retorna false quando catálogo ainda não carregou', () => {
    expect(
      canShowPersonalizationShortcut({
        globalEnabled: true,
        product,
        line,
        isCatalogReady: false,
      })
    ).toBe(false)
  })

  it('retorna false quando variação sem estoque', () => {
    expect(
      canShowPersonalizationShortcut({
        globalEnabled: true,
        product,
        line: { addons: undefined, maxStock: 0 },
      })
    ).toBe(false)
  })
})

describe('buildPersonalizationPdpUrl', () => {
  it('monta URL com personalizar e variation', () => {
    expect(buildPersonalizationPdpUrl('camisa-x', 'v1')).toBe(
      '/products/camisa-x?personalizar=1&variation=v1'
    )
  })
})
