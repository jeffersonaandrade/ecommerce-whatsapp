import { describe, expect, it } from 'vitest'
import { buildProductImageFilename } from './product-image-storage'

describe('buildProductImageFilename', () => {
  it('usa slug sanitizado com data e sufixo aleatório', () => {
    const name = buildProductImageFilename('Camisa Teste 2024', 'jpg')
    expect(name).toMatch(/^camisa-teste-2024-\d{8}-[a-z0-9]{6}\.jpg$/)
  })

  it('usa draft quando slug vazio', () => {
    const name = buildProductImageFilename('', 'png')
    expect(name).toMatch(/^draft-\d{8}-[a-z0-9]{6}\.png$/)
  })

  it('normaliza extensão jpeg para jpg', () => {
    const name = buildProductImageFilename('produto', 'jpeg')
    expect(name.endsWith('.jpg')).toBe(true)
  })

  it('gera nomes distintos em chamadas consecutivas', () => {
    const a = buildProductImageFilename('produto', 'webp')
    const b = buildProductImageFilename('produto', 'webp')
    expect(a).not.toBe(b)
  })
})
