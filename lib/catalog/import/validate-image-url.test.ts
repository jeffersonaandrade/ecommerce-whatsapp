import { describe, expect, it } from 'vitest'
import { isAllowedImportImageUrl } from './validate-image-url'

describe('isAllowedImportImageUrl', () => {
  it('aceita HTTPS público', () => {
    expect(isAllowedImportImageUrl('https://cdn.example.com/image.jpg')).toBe(true)
  })

  it('bloqueia HTTP', () => {
    expect(isAllowedImportImageUrl('http://cdn.example.com/image.jpg')).toBe(false)
  })

  it('bloqueia localhost e IPs privados', () => {
    expect(isAllowedImportImageUrl('https://localhost/image.jpg')).toBe(false)
    expect(isAllowedImportImageUrl('https://127.0.0.1/image.jpg')).toBe(false)
    expect(isAllowedImportImageUrl('https://192.168.0.10/image.jpg')).toBe(false)
    expect(isAllowedImportImageUrl('https://10.0.0.5/image.jpg')).toBe(false)
  })

  it('bloqueia credenciais na URL', () => {
    expect(isAllowedImportImageUrl('https://user:pass@cdn.example.com/a.jpg')).toBe(false)
  })
})
