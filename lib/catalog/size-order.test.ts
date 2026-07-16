import { describe, expect, it } from 'vitest'
import { compareProductSize, sortSizes, sortVariationsBySize } from './size-order'

describe('compareProductSize', () => {
  it('ordena vestuário P → 4XL', () => {
    expect(sortSizes(['4XL', '2XL', '3XL', 'P', 'M', 'G', 'GG'])).toEqual([
      'P',
      'M',
      'G',
      'GG',
      '2XL',
      '3XL',
      '4XL',
    ])
  })

  it('ordena grade BR com 2GG/3GG/4GG junto dos XL', () => {
    expect(sortSizes(['4GG', 'P', '2GG', 'G', '3GG', 'M', 'GG'])).toEqual([
      'P',
      'M',
      'G',
      'GG',
      '2GG',
      '3GG',
      '4GG',
    ])
  })

  it('ordena numeração de chuteira', () => {
    expect(sortSizes(['42', '38', '40', '36'])).toEqual(['36', '38', '40', '42'])
  })

  it('ordena faixas infantis por idade inicial', () => {
    expect(sortSizes(['09-10 ANOS', '02-04 ANOS', '05-06 ANOS'])).toEqual([
      '02-04 ANOS',
      '05-06 ANOS',
      '09-10 ANOS',
    ])
  })

  it('compareProductSize é estável para iguais', () => {
    expect(compareProductSize('P', 'p')).toBe(0)
  })
})

describe('sortVariationsBySize', () => {
  it('ordena variações pelo size', () => {
    const sorted = sortVariationsBySize([
      { size: '4XL', sku: 'a' },
      { size: 'P', sku: 'b' },
      { size: 'M', sku: 'c' },
    ])
    expect(sorted.map((v) => v.size)).toEqual(['P', 'M', '4XL'])
  })
})
