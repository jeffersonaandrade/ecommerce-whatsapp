import { describe, expect, it } from 'vitest'
import { Product } from '@/types/product'
import {
  deriveShortDescription,
  slugifyUnique,
  validateProductInput,
} from './product-utils'
import { ProductInput } from './product-repository'

const baseProduct: Product = {
  id: '1',
  name: 'Camisa Teste',
  slug: 'camisa-teste',
  shortDescription: 'Curta',
  longDescription: 'Descrição longa do produto teste',
  price: 100,
  category: 'Camisas',
  images: ['https://example.com/a.jpg'],
  variations: [{ id: 'v1', sku: 'SKU-1', stock: 5 }],
  status: 'active',
}

const validInput: ProductInput = {
  name: 'Novo Produto',
  longDescription: 'Descrição completa do novo produto',
  price: 199.99,
  category: 'Shorts',
  images: ['https://example.com/img.jpg'],
  variations: [{ sku: 'NEW-SKU-1', stock: 10 }],
  status: 'draft',
}

describe('slugifyUnique', () => {
  it('gera slug kebab-case a partir do nome', () => {
    expect(slugifyUnique('Camisa São Paulo 2024', [])).toBe('camisa-sao-paulo-2024')
  })

  it('adiciona sufixo quando slug já existe', () => {
    const existing = [{ ...baseProduct, slug: 'camisa-teste' }]
    expect(slugifyUnique('Camisa Teste', existing)).toBe('camisa-teste-2')
  })

  it('ignora o produto em edição ao checar duplicata', () => {
    expect(slugifyUnique('Camisa Teste', [baseProduct], '1')).toBe('camisa-teste')
  })
})

describe('deriveShortDescription', () => {
  it('retorna texto curto sem alteração', () => {
    expect(deriveShortDescription('Texto curto')).toBe('Texto curto')
  })

  it('trunca descrições longas', () => {
    const long = 'a'.repeat(150)
    const result = deriveShortDescription(long, 120)
    expect(result.length).toBeLessThanOrEqual(120)
    expect(result.endsWith('...')).toBe(true)
  })
})

describe('validateProductInput', () => {
  it('aceita input válido', () => {
    const errors = validateProductInput(validInput, [baseProduct])
    expect(errors).toHaveLength(0)
  })

  it('rejeita preço promocional maior ou igual ao preço', () => {
    const errors = validateProductInput(
      { ...validInput, price: 100, promotionalPrice: 100 },
      []
    )
    expect(errors.some((e) => e.field === 'promotionalPrice')).toBe(true)
  })

  it('rejeita SKU duplicado no catálogo', () => {
    const errors = validateProductInput(
      {
        ...validInput,
        variations: [{ sku: 'SKU-1', stock: 1 }],
      },
      [baseProduct]
    )
    expect(errors.some((e) => e.message.includes('SKU-1'))).toBe(true)
  })

  it('exige ao menos uma imagem', () => {
    const errors = validateProductInput({ ...validInput, images: [] }, [])
    expect(errors.some((e) => e.field === 'images')).toBe(true)
  })
})
