import { describe, expect, it } from 'vitest'
import { categoryInputToRow, rowToCategory, buildCategoryUpdatePayload } from './supabase-category-mapper'

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
        parent_id: null,
        depth: 0,
        path: 'camisas',
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
      parentId: null,
      depth: 0,
      path: 'camisas',
      createdAt: '2026-01-01T00:00:00.000Z',
      updatedAt: '2026-01-02T00:00:00.000Z',
    })
  })

  it('gera slug a partir do nome quando omitido', () => {
    const row = categoryInputToRow({ name: 'Acessórios', sortOrder: 10, visible: true }, null)
    expect(row.slug).toBe('acessorios')
    expect(row.name).toBe('Acessórios')
    expect(row.sort_order).toBe(10)
  })

  it('buildCategoryUpdatePayload inclui image_path quando informado', () => {
    expect(
      buildCategoryUpdatePayload(
        {
          name: 'Seleção Brasileira',
          slug: 'selecao-brasileira',
          imagePath: 'categories/abc.webp',
        },
        { sortOrder: 10, visible: true }
      )
    ).toMatchObject({
      name: 'Seleção Brasileira',
      slug: 'selecao-brasileira',
      image_path: 'categories/abc.webp',
    })
  })

  it('buildCategoryUpdatePayload preserva image_path quando omitido', () => {
    expect(
      buildCategoryUpdatePayload(
        { name: 'Camisas', slug: 'camisas' },
        { sortOrder: 10, visible: true }
      )
    ).not.toHaveProperty('image_path')
  })
})
