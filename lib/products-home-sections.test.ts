import { describe, expect, it } from 'vitest'
import { pickHomeProductSections } from './products-home-sections'
import { Product } from '@/types/product'

function product(id: string): Product {
  return {
    id,
    slug: id,
    name: id,
    shortDescription: '',
    longDescription: '',
    category: 'Camisas',
    price: 100,
    status: 'active',
    variations: [],
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
})
