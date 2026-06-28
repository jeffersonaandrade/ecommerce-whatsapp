import { describe, expect, it } from 'vitest'
import { pickHomeProductSections } from './products-home-sections'
import { Product } from '@/types/product'

function product(id: string, stock = 10): Product {
  return {
    id,
    slug: id,
    name: id,
    shortDescription: '',
    longDescription: '',
    category: 'Camisas',
    price: 100,
    status: 'active',
    variations: [{ id: `${id}-v`, sku: id, stock }],
    images: [],
  }
}

describe('pickHomeProductSections', () => {
  it('evita repetir produtos entre destaques e veja também', () => {
    const all = [product('1'), product('2'), product('3'), product('4'), product('5'), product('6'), product('7')]
    const { featured, seeAlso } = pickHomeProductSections(all, 6, 4)
    expect(featured).toHaveLength(6)
    expect(seeAlso).toHaveLength(1)
    expect(seeAlso[0]?.id).toBe('7')
    const overlap = featured.some((p) => seeAlso.some((s) => s.id === p.id))
    expect(overlap).toBe(false)
  })

  it('exclui produtos sem estoque de destaques e veja também', () => {
    const all = [
      product('1', 0),
      product('2', 0),
      product('3', 5),
      product('4', 2),
      product('5', 0),
      product('6', 1),
    ]
    const { featured, seeAlso } = pickHomeProductSections(all, 6, 4)
    expect(featured.map((p) => p.id)).toEqual(['3', '4', '6'])
    expect(seeAlso).toHaveLength(0)
    expect(featured.every((p) => p.variations.some((v) => v.stock > 0))).toBe(true)
  })
})
