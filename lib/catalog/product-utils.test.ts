import { describe, expect, it } from 'vitest'
import { Product } from '@/types/product'
import {
  assignVariationIds,
  deriveShortDescription,
  deriveShortFromHtml,
  slugifyUnique,
  stripHtml,
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

  it('remove HTML antes de truncar', () => {
    expect(deriveShortDescription('<p>Camisa PSG</p>')).toBe('Camisa PSG')
  })

  it('trunca descrições longas', () => {
    const long = 'a'.repeat(150)
    const result = deriveShortDescription(long, 120)
    expect(result.length).toBeLessThanOrEqual(120)
    expect(result.endsWith('...')).toBe(true)
  })
})

describe('stripHtml', () => {
  it('remove tags simples do CSV de importação', () => {
    expect(stripHtml('<p>Camisa Flamengo 26/27 - Marrom</p>')).toBe(
      'Camisa Flamengo 26/27 - Marrom'
    )
  })
})

describe('deriveShortFromHtml', () => {
  it('gera resumo legível a partir de HTML', () => {
    expect(deriveShortFromHtml('<p>Camisa Celtic Manga Longa</p>')).toBe(
      'Camisa Celtic Manga Longa'
    )
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

  it('rejeita SKU duplicado via conflictingSkus', () => {
    const errors = validateProductInput(
      {
        ...validInput,
        variations: [{ sku: 'SKU-1', stock: 1 }],
      },
      [],
      undefined,
      undefined,
      ['SKU-1']
    )
    expect(errors.some((e) => e.message.includes('SKU-1'))).toBe(true)
  })

  it('exige ao menos uma imagem', () => {
    const errors = validateProductInput({ ...validInput, images: [] }, [])
    expect(errors.some((e) => e.field === 'images')).toBe(true)
  })

  it('rejeita imagens base64/data URL', () => {
    const errors = validateProductInput(
      { ...validInput, images: ['data:image/png;base64,abc123'] },
      []
    )
    expect(errors.some((e) => e.field === 'images' && e.message.includes('base64'))).toBe(
      true
    )
  })
})

describe('assignVariationIds', () => {
  it('gera UUID estável por variação quando não há id prévio', () => {
    const uuidRe =
      /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i
    const [a, b] = assignVariationIds([
      { sku: 'A-1', stock: 1 },
      { sku: 'B-1', stock: 2 },
    ])
    expect(a.id).toMatch(uuidRe)
    expect(b.id).toMatch(uuidRe)
    expect(a.id).not.toBe(b.id)
  })

  it('preserva ids existentes em edição', () => {
    const result = assignVariationIds(
      [{ sku: 'A-1', stock: 3 }],
      [{ id: 'keep-me', sku: 'A-1', stock: 1 }]
    )
    expect(result[0].id).toBe('keep-me')
  })
})
