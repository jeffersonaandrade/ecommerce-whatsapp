import { describe, expect, it } from 'vitest'
import type { Product } from '@/types/product'
import {
  validateProductForPublication,
  validateProductsForBulkActivation,
} from './publication-rules'

const base: Product = {
  id: '1',
  name: 'Camisa Teste',
  slug: 'camisa-teste',
  shortDescription: '',
  longDescription: '',
  price: 99.9,
  category: 'Camisas',
  images: ['https://cdn.example.com/img.jpg'],
  variations: [{ id: 'v1', sku: 'SKU-1', stock: 10 }],
  status: 'draft',
}

describe('validateProductForPublication', () => {
  it('produto completo não tem erros', () => {
    expect(validateProductForPublication(base)).toEqual([])
  })

  it('detecta sem_nome', () => {
    expect(validateProductForPublication({ ...base, name: '' })).toContain('sem_nome')
    expect(validateProductForPublication({ ...base, name: '   ' })).toContain('sem_nome')
  })

  it('detecta sem_slug', () => {
    expect(validateProductForPublication({ ...base, slug: '' })).toContain('sem_slug')
  })

  it('detecta sem_preco quando price é 0', () => {
    expect(validateProductForPublication({ ...base, price: 0 })).toContain('sem_preco')
  })

  it('detecta sem_preco quando price é negativo', () => {
    expect(validateProductForPublication({ ...base, price: -1 })).toContain('sem_preco')
  })

  it('detecta sem_categoria', () => {
    expect(validateProductForPublication({ ...base, category: '' })).toContain('sem_categoria')
  })

  it('detecta sem_imagem', () => {
    expect(validateProductForPublication({ ...base, images: [] })).toContain('sem_imagem')
  })

  it('detecta sem_variacao', () => {
    expect(validateProductForPublication({ ...base, variations: [] })).toContain('sem_variacao')
  })

  it('detecta sem_estoque quando todas as variações têm stock 0', () => {
    const p = { ...base, variations: [{ id: 'v1', sku: 'SKU-1', stock: 0 }] }
    expect(validateProductForPublication(p)).toContain('sem_estoque')
  })

  it('não detecta sem_estoque se ao menos uma variação tem stock > 0', () => {
    const p = {
      ...base,
      variations: [
        { id: 'v1', sku: 'SKU-1', stock: 0 },
        { id: 'v2', sku: 'SKU-2', stock: 3 },
      ],
    }
    expect(validateProductForPublication(p)).not.toContain('sem_estoque')
  })

  it('acumula múltiplos erros', () => {
    const p = { ...base, name: '', price: 0, images: [] }
    const errors = validateProductForPublication(p)
    expect(errors).toContain('sem_nome')
    expect(errors).toContain('sem_preco')
    expect(errors).toContain('sem_imagem')
    expect(errors).toHaveLength(3)
  })
})

describe('validateProductsForBulkActivation', () => {
  const valid1: Product = { ...base, id: '1' }
  const valid2: Product = { ...base, id: '2', name: 'Camisa 2', slug: 'camisa-2' }
  const noImage: Product = { ...base, id: '3', name: 'Sem Imagem', slug: 'sem-imagem', images: [] }
  const noPrice: Product = { ...base, id: '4', name: 'Sem Preço', slug: 'sem-preco', price: 0 }

  it('separa válidos de inválidos corretamente', () => {
    const result = validateProductsForBulkActivation([valid1, valid2, noImage, noPrice])
    expect(result.total).toBe(4)
    expect(result.validIds).toEqual(['1', '2'])
    expect(result.invalid).toHaveLength(2)
    expect(result.invalid[0].productId).toBe('3')
    expect(result.invalid[0].errors).toContain('sem_imagem')
    expect(result.invalid[1].productId).toBe('4')
    expect(result.invalid[1].errors).toContain('sem_preco')
  })

  it('todos válidos', () => {
    const result = validateProductsForBulkActivation([valid1, valid2])
    expect(result.validIds).toHaveLength(2)
    expect(result.invalid).toHaveLength(0)
  })

  it('todos inválidos', () => {
    const result = validateProductsForBulkActivation([noImage, noPrice])
    expect(result.validIds).toHaveLength(0)
    expect(result.invalid).toHaveLength(2)
  })

  it('lista vazia', () => {
    const result = validateProductsForBulkActivation([])
    expect(result.total).toBe(0)
    expect(result.validIds).toHaveLength(0)
    expect(result.invalid).toHaveLength(0)
  })
})
