import { describe, expect, it } from 'vitest'
import { Category } from '@/types/category'
import {
  assertValidParent,
  assertSubtreeFitsMaxDepth,
  buildCategoryTree,
  computeCategoryPath,
  formatCategoryOptionLabel,
  getCategoryBreadcrumb,
  getDescendantIds,
  isLeafCategory,
  productMatchesCategorySubtree,
  recomputeDescendantPaths,
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

  it('aceita quarto nível visual (depth 3)', () => {
    const retro = cat({
      id: '5',
      name: 'Retrô',
      slug: 'retro',
      parentId: '2',
      depth: 2,
      path: 'camisas/brasileiro/retro',
    })
    expect(computeCategoryPath('santa-cruz', retro)).toEqual({
      depth: 3,
      path: 'camisas/brasileiro/retro/santa-cruz',
    })
  })

  it('rejeita quinto nível', () => {
    const retro = cat({
      id: '5',
      name: 'Retrô',
      slug: 'retro',
      parentId: '2',
      depth: 2,
      path: 'camisas/brasileiro/retro',
    })
    const santaCruzLeaf = cat({
      id: '6',
      name: 'Santa Cruz',
      slug: 'santa-cruz',
      parentId: '5',
      depth: 3,
      path: 'camisas/brasileiro/retro/santa-cruz',
    })
    expect(() => computeCategoryPath('x', santaCruzLeaf)).toThrow(/4 níveis/)
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

  describe('cascade path/depth', () => {
    it('recalcula descendentes após mover pai', () => {
      const esportes = cat({ id: 'e', name: 'Esportes', slug: 'esportes', path: 'esportes' })
      const camisas = cat({
        id: 'c',
        name: 'Camisas',
        slug: 'camisas',
        path: 'camisas',
      })
      const mangaLonga = cat({
        id: 'm',
        name: 'Manga Longa',
        slug: 'manga-longa',
        parentId: 'c',
        depth: 1,
        path: 'camisas/manga-longa',
      })
      const tree = [esportes, camisas, mangaLonga]

      const movedCamisas = {
        ...camisas,
        parentId: 'e',
        depth: 1,
        path: 'esportes/camisas',
      }
      const afterMove = recomputeDescendantPaths(
        tree.map((c) => (c.id === 'c' ? movedCamisas : c)),
        'c'
      )

      expect(afterMove.find((c) => c.id === 'e')?.path).toBe('esportes')
      expect(afterMove.find((c) => c.id === 'c')?.path).toBe('esportes/camisas')
      expect(afterMove.find((c) => c.id === 'm')?.path).toBe('esportes/camisas/manga-longa')
    })

    it('rejeita mover subárvore que excede profundidade máxima', () => {
      const esportes = cat({ id: 'e', name: 'Esportes', slug: 'esportes' })
      const retro = cat({
        id: '5',
        name: 'Retrô',
        slug: 'retro',
        parentId: '2',
        depth: 2,
        path: 'camisas/brasileiro/retro',
      })
      const deepSantaCruz = cat({
        id: '6',
        name: 'Santa Cruz',
        slug: 'santa-cruz',
        parentId: '5',
        depth: 3,
        path: 'camisas/brasileiro/retro/santa-cruz',
      })
      const deepTree = [
        ...categories.filter((c) => c.id !== '3'),
        retro,
        deepSantaCruz,
        esportes,
      ]
      expect(() => assertSubtreeFitsMaxDepth(deepTree, '1', 1)).toThrow(/4 níveis/)
    })

    it('permite árvore Camisas > Brasileiro > Retrô > Santa Cruz', () => {
      const retro = cat({
        id: '5',
        name: 'Retrô',
        slug: 'retro',
        parentId: '2',
        depth: 2,
        path: 'camisas/brasileiro/retro',
      })
      const santaCruzLeaf = cat({
        id: '6',
        name: 'Santa Cruz',
        slug: 'santa-cruz',
        parentId: '5',
        depth: 3,
        path: 'camisas/brasileiro/retro/santa-cruz',
      })
      const tree = [
        categories[0],
        categories[1],
        retro,
        santaCruzLeaf,
      ]
      expect(() => assertSubtreeFitsMaxDepth(tree, '1', 0)).not.toThrow()
      expect(getCategoryBreadcrumb(tree, 'santa-cruz').map((c) => c.slug)).toEqual([
        'camisas',
        'brasileiro',
        'retro',
        'santa-cruz',
      ])
    })

    it('recalcula descendentes após renomear slug do pai', () => {
      const renamed = {
        ...categories[0],
        slug: 'camisas-esportivas',
        path: 'camisas-esportivas',
      }
      const afterRename = recomputeDescendantPaths(
        categories.map((c) => (c.id === '1' ? renamed : c)),
        '1'
      )
      expect(afterRename.find((c) => c.id === '2')?.path).toBe('camisas-esportivas/brasileiro')
      expect(afterRename.find((c) => c.id === '3')?.path).toBe(
        'camisas-esportivas/brasileiro/santa-cruz'
      )
    })

    it('vitrine encontra produto após cascade de path', () => {
      const esportes = cat({ id: 'e', name: 'Esportes', slug: 'esportes', path: 'esportes' })
      const camisas = cat({ id: 'c', name: 'Camisas', slug: 'camisas', path: 'camisas' })
      const mangaLonga = cat({
        id: 'm',
        name: 'Manga Longa',
        slug: 'manga-longa',
        parentId: 'c',
        depth: 1,
        path: 'camisas/manga-longa',
      })
      const stale = [esportes, camisas, mangaLonga]
      const product = { categoryId: 'm', category: 'manga-longa' }

      expect(productMatchesCategorySubtree(product, 'esportes', stale)).toBe(false)

      const movedCamisas = {
        ...camisas,
        parentId: 'e',
        depth: 1,
        path: 'esportes/camisas',
      }
      const fresh = recomputeDescendantPaths(
        stale.map((c) => (c.id === 'c' ? movedCamisas : c)),
        'c'
      )
      expect(productMatchesCategorySubtree(product, 'esportes', fresh)).toBe(true)
    })
  })

  it('formatCategoryOptionLabel indenta por depth', () => {
    expect(formatCategoryOptionLabel({ name: 'Raiz', depth: 0, visible: true })).toBe('Raiz')
    expect(formatCategoryOptionLabel({ name: 'Filho', depth: 1, visible: true })).toBe('— Filho')
    expect(formatCategoryOptionLabel({ name: 'Oculta', depth: 0, visible: false })).toBe(
      'Oculta (oculta)'
    )
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
