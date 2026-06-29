/**
 * Benchmark de carga da árvore de categorias (4 níveis).
 * Documenta tempos no CI/local — não é limite rígido de performance.
 *
 * Cenário: ~300 categorias, 1000 produtos, mover nó de nível 1.
 */
import { describe, expect, it } from 'vitest'
import { Category } from '@/types/category'
import {
  buildCategoryTree,
  getDescendantIds,
  getSubtreeIds,
  productMatchesCategorySubtree,
  recomputeDescendantPaths,
} from './category-tree'

const ROOT_TYPES = ['camisas', 'chuteiras', 'conjuntos', 'shorts'] as const
const REGIONS = ['brasileiro', 'europeu', 'nba', 'selecoes'] as const
const LINES = ['retro', 'jogador', 'feminina', 'infantil', 'manga-longa'] as const

function buildLargeCategoryTree(): Category[] {
  const categories: Category[] = []
  let clubIndex = 0

  const push = (c: Omit<Category, 'createdAt' | 'updatedAt'>) => {
    categories.push({
      ...c,
      description: '',
      sortOrder: categories.length,
      visible: true,
      createdAt: '',
      updatedAt: '',
    })
  }

  for (const rootSlug of ROOT_TYPES) {
    const rootId = `root-${rootSlug}`
    push({
      id: rootId,
      name: rootSlug,
      slug: rootSlug,
      parentId: null,
      depth: 0,
      path: rootSlug,
    })

    for (const regionSlug of REGIONS) {
      const regionId = `${rootId}-${regionSlug}`
      push({
        id: regionId,
        name: regionSlug,
        slug: `${rootSlug}-${regionSlug}`,
        parentId: rootId,
        depth: 1,
        path: `${rootSlug}/${regionSlug}`,
      })

      for (const lineSlug of LINES) {
        const lineId = `${regionId}-${lineSlug}`
        push({
          id: lineId,
          name: lineSlug,
          slug: `${rootSlug}-${regionSlug}-${lineSlug}`,
          parentId: regionId,
          depth: 2,
          path: `${rootSlug}/${regionSlug}/${lineSlug}`,
        })

        for (let i = 0; i < 3 && categories.length < 300; i += 1) {
          clubIndex += 1
          const clubSlug = `clube-${clubIndex}`
          push({
            id: `${lineId}-${clubSlug}`,
            name: `Clube ${clubIndex}`,
            slug: clubSlug,
            parentId: lineId,
            depth: 3,
            path: `${rootSlug}/${regionSlug}/${lineSlug}/${clubSlug}`,
          })
        }
      }
    }
  }

  return categories.slice(0, 300)
}

function buildProducts(categories: Category[], count: number) {
  const leaves = categories.filter((c) => c.depth === 3)
  return Array.from({ length: count }, (_, i) => {
    const leaf = leaves[i % leaves.length]!
    return {
      categoryId: leaf.id,
      category: leaf.slug,
      status: 'active' as const,
    }
  })
}

function ms(start: number, end: number): number {
  return Math.round((end - start) * 100) / 100
}

describe('category-tree load benchmark', () => {
  it('documenta tempos com ~300 categorias e 1000 produtos', () => {
    const categories = buildLargeCategoryTree()
    const products = buildProducts(categories, 1000)
    const camisas = categories.find((c) => c.slug === 'camisas')!
    const categoriesWithOutlet = categories

    expect(categories.length).toBeGreaterThanOrEqual(280)
    expect(categories.length).toBeLessThanOrEqual(300)
    expect(leavesCount(categories)).toBeGreaterThan(50)

    let t0 = performance.now()
    const tree = buildCategoryTree(categoriesWithOutlet)
    const buildTreeMs = ms(t0, performance.now())
    expect(tree.length).toBeGreaterThan(0)

    t0 = performance.now()
    const descendants = getDescendantIds(categoriesWithOutlet, camisas.id)
    const descendantsMs = ms(t0, performance.now())
    expect(descendants.length).toBeGreaterThan(80)

    t0 = performance.now()
    getSubtreeIds(categoriesWithOutlet, camisas.id)
    const subtreeIdsMs = ms(t0, performance.now())

    t0 = performance.now()
    const europeu = categories.find((c) => c.id === 'root-camisas-europeu')!
    const brasileiroLine = categories.find(
      (c) => c.parentId === 'root-camisas-brasileiro' && c.depth === 2
    )!
    const movedLine = {
      ...brasileiroLine,
      parentId: europeu.id,
      depth: 2,
      path: `${europeu.path}/${brasileiroLine.slug}`,
    }
    const afterMove = recomputeDescendantPaths(
      categories.map((c) => (c.id === brasileiroLine.id ? movedLine : c)),
      brasileiroLine.id
    )
    const moveSubtreeMs = ms(t0, performance.now())
    expect(afterMove.find((c) => c.id === brasileiroLine.id)?.path).toContain('europeu')

    t0 = performance.now()
    let matchCount = 0
    for (const product of products) {
      if (productMatchesCategorySubtree(product, 'camisas', categoriesWithOutlet)) {
        matchCount += 1
      }
    }
    const subtreeFilterMs = ms(t0, performance.now())
    expect(matchCount).toBeGreaterThan(0)

    const report = {
      categories: categories.length,
      products: products.length,
      buildTreeMs,
      descendantsMs,
      subtreeIdsMs,
      moveSubtreeMs,
      subtreeFilterMs,
      matchCount,
    }

    // eslint-disable-next-line no-console -- benchmark output intencional
    console.info('[category-tree benchmark]', JSON.stringify(report))

    // Sanity: operações em memória devem ficar abaixo de 5s em CI/dev
    expect(buildTreeMs).toBeLessThan(5000)
    expect(moveSubtreeMs).toBeLessThan(5000)
    expect(subtreeFilterMs).toBeLessThan(5000)

    // Baseline documentado (ajustar se regressão real)
    expect(report).toMatchObject({
      categories: expect.any(Number),
      buildTreeMs: expect.any(Number),
      moveSubtreeMs: expect.any(Number),
      subtreeFilterMs: expect.any(Number),
    })
  })
})

function leavesCount(categories: Category[]): number {
  const parentIds = new Set(
    categories.map((c) => c.parentId).filter((id): id is string => Boolean(id))
  )
  return categories.filter((c) => !parentIds.has(c.id)).length
}
