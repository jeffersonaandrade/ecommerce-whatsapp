import { describe, expect, it } from 'vitest'
import {
  buildExpectedFilename,
  matchFilesToProducts,
  parseAssociationFilename,
} from './filename-association'

const products = [
  { id: '1', name: 'Camisa Brasil', slug: 'camisa-brasil', sku: 'BRA-001', images: [] },
  { id: '2', name: 'Short', slug: 'short-preto', sku: 'SHO-001', images: ['https://x.com/a.jpg'] },
]

function mockFile(name: string, size = 1024): File {
  return new File([new Uint8Array(size)], name, { type: 'image/jpeg' })
}

describe('filename-association', () => {
  it('parseia slug--01.jpg', () => {
    expect(parseAssociationFilename('camisa-brasil--01.jpg')).toEqual({
      key: 'camisa-brasil',
      order: 1,
      ext: 'jpg',
    })
  })

  it('associa por SKU com prioridade', () => {
    const result = matchFilesToProducts([mockFile('BRA-001--01.jpg')], products)
    expect(result.matches).toHaveLength(1)
    expect(result.matches[0].productId).toBe('1')
  })

  it('associa por slug', () => {
    const result = matchFilesToProducts([mockFile('short-preto--02.webp')], products)
    expect(result.matches[0].productSlug).toBe('short-preto')
    expect(result.matches[0].order).toBe(2)
  })

  it('detecta ordem duplicada', () => {
    const result = matchFilesToProducts(
      [mockFile('camisa-brasil--01.jpg'), mockFile('camisa-brasil--01.png')],
      products
    )
    expect(result.errors.some((e) => e.code === 'DUPLICATE_ORDER')).toBe(true)
  })

  it('detecta arquivo órfão', () => {
    const result = matchFilesToProducts([mockFile('inexistente--01.jpg')], products)
    expect(result.orphans).toContain('inexistente--01.jpg')
  })

  it('gera expected filename', () => {
    expect(buildExpectedFilename('camisa-brasil', 2, 'webp')).toBe('camisa-brasil--02.webp')
  })
})
