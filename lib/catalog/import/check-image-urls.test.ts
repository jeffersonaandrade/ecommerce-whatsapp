import { describe, expect, it } from 'vitest'
import { validateProductImageUrlsLocal } from './check-image-urls'

describe('validateProductImageUrlsLocal', () => {
  it('aceita URLs HTTPS públicas válidas', () => {
    const issues = validateProductImageUrlsLocal(
      ['https://cdn.example.com/img/product.jpg'],
      'produto-teste'
    )
    expect(issues).toHaveLength(0)
  })

  it('rejeita host privado sem requisição de rede', () => {
    const issues = validateProductImageUrlsLocal(
      ['https://127.0.0.1/secret.jpg'],
      'produto-teste'
    )
    expect(issues.some((i) => i.severity === 'error')).toBe(true)
  })

  it('rejeita mais de cinco URLs', () => {
    const urls = Array.from({ length: 6 }, (_, i) => `https://cdn.example.com/${i}.jpg`)
    const issues = validateProductImageUrlsLocal(urls, 'produto-teste')
    expect(issues).toHaveLength(1)
    expect(issues[0].code).toBe('CSV_E003')
  })
})
