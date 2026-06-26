import { describe, expect, it } from 'vitest'
import {
  errorsToFieldMap,
  formatProductValidationError,
  normalizeProductErrors,
} from './product-form-errors'

describe('product-form-errors', () => {
  it('formata erro com rótulo do campo', () => {
    expect(
      formatProductValidationError({
        field: 'price',
        message: 'Preço deve ser maior que zero',
      })
    ).toBe('Preço: Preço deve ser maior que zero')
  })

  it('infere campo a partir da mensagem legada', () => {
    const normalized = normalizeProductErrors(['Adicione ao menos uma imagem'])
    expect(normalized[0]?.field).toBe('images')
  })

  it('mapeia erros por campo', () => {
    const map = errorsToFieldMap([
      { field: 'name', message: 'Nome é obrigatório' },
      { field: 'images', message: 'Adicione ao menos uma imagem' },
    ])
    expect(map.name).toBe('Nome é obrigatório')
    expect(map.images).toBe('Adicione ao menos uma imagem')
  })
})
