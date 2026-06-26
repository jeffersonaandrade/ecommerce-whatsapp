import { describe, expect, it } from 'vitest'
import {
  generateCategorySlug,
  isValidCategorySlug,
  normalizeCategorySlug,
  productMatchesCategoryFilter,
  resolveCategoryParam,
  resolveCategoryToSlug,
  validateCategoryInput,
} from './category-utils'
import { Category } from '@/types/category'

const sampleCategories: Category[] = [
  {
    id: '1',
    name: 'Camisas',
    slug: 'camisas',
    description: '',
    sortOrder: 20,
    visible: true,
    createdAt: '',
    updatedAt: '',
  },
  {
    id: '2',
    name: 'Shorts',
    slug: 'shorts',
    description: '',
    sortOrder: 50,
    visible: true,
    createdAt: '',
    updatedAt: '',
  },
]

describe('generateCategorySlug', () => {
  it('gera slug kebab sem acentos', () => {
    expect(generateCategorySlug('Acessórios')).toBe('acessorios')
    expect(generateCategorySlug('Camisas')).toBe('camisas')
  })
})

describe('normalizeCategorySlug', () => {
  it('normaliza casing e hifens', () => {
    expect(normalizeCategorySlug(' Camisas ')).toBe('camisas')
    expect(normalizeCategorySlug('camisas--teste')).toBe('camisas-teste')
  })
})

describe('isValidCategorySlug', () => {
  it('aceita slug válido e rejeita inválido', () => {
    expect(isValidCategorySlug('camisas')).toBe(true)
    expect(isValidCategorySlug('Camisas')).toBe(true)
    expect(isValidCategorySlug('qa test')).toBe(false)
    expect(isValidCategorySlug('')).toBe(false)
  })
})

describe('resolveCategoryParam', () => {
  it('resolve por slug', () => {
    expect(resolveCategoryParam('camisas', sampleCategories)?.name).toBe('Camisas')
  })

  it('resolve por nome legado', () => {
    expect(resolveCategoryParam('Camisas', sampleCategories)?.slug).toBe('camisas')
  })
})

describe('resolveCategoryToSlug', () => {
  it('normaliza nome legado para slug', () => {
    expect(resolveCategoryToSlug('Camisas', sampleCategories)).toBe('camisas')
    expect(resolveCategoryToSlug('camisas', sampleCategories)).toBe('camisas')
  })

  it('retorna null para categoria desconhecida', () => {
    expect(resolveCategoryToSlug('Fantasma', sampleCategories)).toBeNull()
  })
})

describe('productMatchesCategoryFilter', () => {
  it('combina slug e nome legado do produto', () => {
    expect(productMatchesCategoryFilter('Camisas', 'camisas', sampleCategories)).toBe(true)
    expect(productMatchesCategoryFilter('camisas', 'Camisas', sampleCategories)).toBe(true)
    expect(productMatchesCategoryFilter('Shorts', 'camisas', sampleCategories)).toBe(false)
  })

  it('funciona sem lista de categorias via comparação direta', () => {
    expect(productMatchesCategoryFilter('Camisas', 'Camisas', [])).toBe(true)
    expect(productMatchesCategoryFilter('Camisas', 'camisas', [])).toBe(true)
  })
})

describe('validateCategoryInput', () => {
  it('bloqueia nome vazio e slug inválido', () => {
    expect(validateCategoryInput({ name: '' }, [])).toEqual(
      expect.arrayContaining([
        expect.objectContaining({ field: 'name' }),
        expect.objectContaining({ field: 'slug' }),
      ])
    )
    expect(validateCategoryInput({ name: 'Teste', slug: 'inválido' }, [])).toEqual(
      expect.arrayContaining([expect.objectContaining({ field: 'slug' })])
    )
  })

  it('bloqueia slug duplicado', () => {
    const errors = validateCategoryInput({ name: 'Outra', slug: 'camisas' }, sampleCategories)
    expect(errors.some((e) => e.field === 'slug')).toBe(true)
  })
})
