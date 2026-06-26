import { describe, expect, it, beforeAll } from 'vitest'
import { mergeImages, normalizeImageInputs, isValidProductStoragePath } from './validate-image-path'

const BASE = 'https://example.supabase.co'

beforeAll(() => {
  process.env.NEXT_PUBLIC_SUPABASE_URL = BASE
})

describe('validate-image-path', () => {
  it('valida path sob productId', () => {
    expect(isValidProductStoragePath('12/abc.jpg', '12')).toBe(true)
    expect(isValidProductStoragePath('99/abc.jpg', '12')).toBe(false)
    expect(isValidProductStoragePath('../etc/passwd', '12')).toBe(false)
  })

  it('normaliza paths em URLs públicas', () => {
    const { urls, paths } = normalizeImageInputs(['12/photo.jpg'], '12')
    expect(paths).toEqual(['12/photo.jpg'])
    expect(urls[0]).toContain('/storage/v1/object/public/products/12/photo.jpg')
  })

  it('replace substitui imagens', () => {
    const merged = mergeImages(
      ['https://old.example/a.jpg'],
      [`${BASE}/storage/v1/object/public/products/1/new.jpg`],
      'replace'
    )
    expect(merged).toHaveLength(1)
    expect(merged[0]).toContain('/products/1/new.jpg')
  })

  it('append preserva existentes até 5', () => {
    const merged = mergeImages(
      ['https://a.com/1.jpg', 'https://a.com/2.jpg'],
      [`${BASE}/storage/v1/object/public/products/1/3.jpg`],
      'append'
    )
    expect(merged).toHaveLength(3)
  })

  it('rejeita data urls', () => {
    expect(() => normalizeImageInputs(['data:image/png;base64,abc'], '1')).toThrow()
  })
})
