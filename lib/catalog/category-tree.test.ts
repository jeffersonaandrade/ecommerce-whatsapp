import { describe, expect, it } from 'vitest'
import { Category } from '@/types/category'
import {
  assertValidParent,
  buildCategoryTree,
  computeCategoryPath,
  getCategoryBreadcrumb,
  getDescendantIds,
  isLeafCategory,
  productMatchesCategorySubtree,
} from './category-tree'

function cat(
  overrides: Partial<Category> & Pick<Category, 'id' | 'name' | 'slug'>
): Category {
  return {
    description: '',
    sortOrder: 0,
    visible: true,
    parentId: null,
    depth: 0,
    path: overrides.slug,
    createdAt: '',
    updatedAt: '',
    ...overrides,
  }
}

const categories: Category[] = [
  cat({ id: '1', name: 'Camisas', slug: 'camisas', path: 'camisas' }),
  cat({
    id: '2',
    name: 'Brasileiro',
    slug: 'brasileiro',
    parentId: '1',
    depth: 1,
    path: 'camisas/brasileiro',
  }),
  cat({
    id: '3',
    name: 'Santa Cruz',
    slug: 'santa-cruz',
    parentId: '2',
    depth: 2,
    path: 'camisas/brasileiro/santa-cruz',
  }),
  cat({
    id: '4',
    name: 'Europeu',
    slug: 'europeu',
    parentId: '1',
    depth: 1,
    path: 'camisas/europeu',
  }),
]

describe('category-tree', () => {
  it('computa path e depth', () => {
    expect(computeCategoryPath('camisas', null)).toEqual({ depth: 0, path: 'camisas' })
    expect(computeCategoryPath('brasileiro', categories[0])).toEqual({
      depth: 1,
      path: 'camisas/brasileiro',
    })
  })

  it('rejeita quarto nível', () => {
    expect(() => computeCategoryPath('x', categories[2])).toThrow(/3 níveis/)
  })

  it('monta árvore', () => {
    const tree = buildCategoryTree(categories)
    expect(tree).toHaveLength(1)
    expect(tree[0].children).toHaveLength(2)
    expect(tree[0].children[0].children[0].slug).toBe('santa-cruz')
  })

  it('lista descendentes', () => {
    expect(getDescendantIds(categories, '1').sort()).toEqual(['2', '3', '4'])
    expect(getDescendantIds(categories, '2')).toEqual(['3'])
  })

  it('identifica folha', () => {
    expect(isLeafCategory(categories, '3')).toBe(true)
    expect(isLeafCategory(categories, '1')).toBe(false)
  })

  it('breadcrumb', () => {
    expect(getCategoryBreadcrumb(categories, 'santa-cruz').map((c) => c.slug)).toEqual([
      'camisas',
      'brasileiro',
      'santa-cruz',
    ])
  })

  it('impede ciclo', () => {
    expect(() => assertValidParent(categories, '2', '1')).toThrow(/descendente/)
  })

  it('filtra produtos por subárvore', () => {
    expect(
      productMatchesCategorySubtree(
        { categoryId: '3', category: 'santa-cruz' },
        'camisas',
        categories
      )
    ).toBe(true)
    expect(
      productMatchesCategorySubtree(
        { categoryId: '3', category: 'santa-cruz' },
        'brasileiro',
        categories
      )
    ).toBe(true)
    expect(
      productMatchesCategorySubtree(
        { categoryId: '3', category: 'santa-cruz' },
        'europeu',
        categories
      )
    ).toBe(false)
    expect(
      productMatchesCategorySubtree(
        { categoryId: null, category: 'santa-cruz' },
        'camisas',
        categories
      )
    ).toBe(true)
  })
})
