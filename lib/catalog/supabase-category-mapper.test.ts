import { describe, expect, it } from 'vitest'
import { categoryInputToRow, rowToCategory } from './supabase-category-mapper'

describe('supabase-category-mapper', () => {
  it('mapeia row snake_case para Category', () => {
    expect(
      rowToCategory({
        id: 'abc',
        name: 'Camisas',
        slug: 'camisas',
        description: 'Desc',
        sort_order: 10,
        visible: true,
        image_path: null,
        created_at: '2026-01-01T00:00:00.000Z',
        updated_at: '2026-01-02T00:00:00.000Z',
      })
    ).toEqual({
      id: 'abc',
      name: 'Camisas',
      slug: 'camisas',
      description: 'Desc',
      sortOrder: 10,
      visible: true,
      createdAt: '2026-01-01T00:00:00.000Z',
      updatedAt: '2026-01-02T00:00:00.000Z',
    })
  })

  it('gera slug a partir do nome quando omitido', () => {
    const row = categoryInputToRow({ name: 'Acessórios', sortOrder: 10, visible: true })
    expect(row.slug).toBe('acessorios')
    expect(row.name).toBe('Acessórios')
    expect(row.sort_order).toBe(10)
  })
})
