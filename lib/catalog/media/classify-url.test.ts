import { describe, expect, it } from 'vitest'
import {
  classifyProductImagesInitial,
  extractProductsStoragePath,
  isProductsStorageUrl,
  resolveMediaStatus,
} from './classify-url'

const BASE = 'https://example.supabase.co'

describe('classify-url', () => {
  it('detecta URL do bucket products', () => {
    const url = `${BASE}/storage/v1/object/public/products/12/abc.jpg`
    expect(isProductsStorageUrl(url, BASE)).toBe(true)
    expect(extractProductsStoragePath(url, BASE)).toBe('12/abc.jpg')
  })

  it('rejeita URL externa', () => {
    expect(isProductsStorageUrl('https://cdn.example.com/a.jpg', BASE)).toBe(false)
  })

  it('classifica produto sem imagem', () => {
    expect(classifyProductImagesInitial([], BASE)).toBe('empty')
  })

  it('classifica produto com URL externa', () => {
    expect(classifyProductImagesInitial(['https://cdn.example.com/a.jpg'], BASE)).toBe(
      'external'
    )
  })

  it('classifica produto com storage', () => {
    expect(
      classifyProductImagesInitial(
        [`${BASE}/storage/v1/object/public/products/1/a.jpg`],
        BASE
      )
    ).toBe('storage')
  })

  it('resolve broken após probe', () => {
    const status = resolveMediaStatus(
      'external',
      ['https://cdn.example.com/a.jpg'],
      { 'https://cdn.example.com/a.jpg': false },
      false
    )
    expect(status).toBe('broken')
  })

  it('mantém external sem probe confirmado', () => {
    const status = resolveMediaStatus(
      'external',
      ['https://cdn.example.com/a.jpg'],
      {},
      false
    )
    expect(status).toBe('external')
  })

  it('mostra checking apenas enquanto probing', () => {
    expect(
      resolveMediaStatus(
        'external',
        ['https://cdn.example.com/a.jpg'],
        {},
        true
      )
    ).toBe('checking')
  })
})
