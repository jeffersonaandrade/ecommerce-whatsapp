import fs from 'fs'
import path from 'path'
import { describe, expect, it } from 'vitest'
import { parseCsv, csvToRecords } from './parse-csv'
import { groupRowsBySlug, findConflictingProductRows } from './map-rows'
import { buildImportPreview, getValidProducts } from './validate-import'
import { applyImport } from './apply-import'
import { ProductRepository } from '@/lib/catalog/product-repository'
import { Product } from '@/types/product'
import { Category } from '@/types/category'

const TEMPLATE_PATH = path.join(
  process.cwd(),
  'public/templates/importacao-produtos-exemplo.csv'
)

const importCategories: Category[] = [
  {
    id: 'cat-camisas',
    name: 'Camisas',
    slug: 'camisas',
    description: '',
    sortOrder: 20,
    visible: true,
    createdAt: '',
    updatedAt: '',
  },
]

const CSV_HEADERS = `Identificador URL,Nome (Português),Categorias,Preço,Preço promocional,Estoque,SKU,Descrição (Português)`

describe('parseCsv', () => {
  it('parseia campos com vírgulas entre aspas', () => {
    const rows = parseCsv('a,b\n"hello, world",2')
    expect(rows).toEqual([
      ['a', 'b'],
      ['hello, world', '2'],
    ])
  })

  it('remove BOM UTF-8', () => {
    const rows = parseCsv('\uFEFFslug,name\na,b')
    expect(rows[0]).toEqual(['slug', 'name'])
  })
})

describe('buildImportPreview', () => {
  it('importa template de exemplo como válido', () => {
    const csv = fs.readFileSync(TEMPLATE_PATH, 'utf-8')
    const preview = buildImportPreview(csv, 'importacao-produtos-exemplo.csv', [], importCategories)

    expect(preview.stats.totalProducts).toBe(1)
    expect(preview.stats.validProducts).toBe(1)
    expect(preview.stats.errorCount).toBe(0)
    const valid = getValidProducts(preview)
    expect(valid).toHaveLength(1)
    expect(valid[0].category).toBe('camisas')
    expect(valid[0].variations).toHaveLength(2)
  })

  it('detecta CSV_E006 para slug vazio', () => {
    const csv = `${CSV_HEADERS}
,Camisa,Camisas,100,,5,SKU-1,Desc`
    const preview = buildImportPreview(csv, 'invalid.csv', [], importCategories)
    expect(preview.issues.some((i) => i.code === 'CSV_E006')).toBe(true)
  })

  it('detecta CSV_E004 preço promocional inválido', () => {
    const csv = `${CSV_HEADERS}
camisa-teste,Camisa,Camisas,100,150,5,SKU-1,Desc`
    const preview = buildImportPreview(csv, 'promo.csv', [], importCategories)
    expect(preview.issues.some((i) => i.code === 'CSV_E004')).toBe(true)
  })

  it('detecta CSV_E003 para host privado em image_urls', () => {
    const csv = `${CSV_HEADERS},image_urls
camisa-teste,Camisa,Camisas,100,,5,SKU-1,Desc,https://127.0.0.1/a.jpg`
    const preview = buildImportPreview(csv, 'private-host.csv', [], importCategories)
    expect(preview.issues.some((i) => i.code === 'CSV_E003')).toBe(true)
  })

  it('detecta header ausente como CSV_E006', () => {
    const csv = `camisa-teste,Camisa,Camisas,100,,5,SKU-1,Desc`
    const preview = buildImportPreview(csv, 'no-header.csv', [], importCategories)
    expect(preview.issues.some((i) => i.code === 'CSV_E006')).toBe(true)
  })

  it('parseia preview pequeno em menos de 10 segundos', () => {
    const rows = Array.from({ length: 20 }, (_, i) =>
      `prod-${i},Prod ${i},Camisas,100,,5,SKU-${i},Desc`
    ).join('\n')
    const csv = `${CSV_HEADERS}\n${rows}`
    const started = performance.now()
    const preview = buildImportPreview(csv, 'timing.csv', [], importCategories)
    const durationMs = performance.now() - started
    expect(preview.stats.totalProducts).toBe(20)
    expect(durationMs).toBeLessThan(10_000)
  })

  it('detecta CSV_E002 SKU duplicado', () => {
    const csv = `${CSV_HEADERS}
prod-a,Prod A,Camisas,100,,5,DUP-SKU,Desc
prod-b,Prod B,Camisas,100,,5,DUP-SKU,Desc`
    const preview = buildImportPreview(csv, 'dup.csv', [], importCategories)
    expect(preview.issues.some((i) => i.code === 'CSV_E002')).toBe(true)
  })

  it('detecta CSV_E008 para categoria inexistente', () => {
    const csv = `${CSV_HEADERS}
prod-x,Prod X,CategoriaFantasma,100,,5,SKU-X,Desc`
    const preview = buildImportPreview(csv, 'bad-category.csv', [], importCategories)
    expect(preview.issues.some((i) => i.code === 'CSV_E008')).toBe(true)
    expect(getValidProducts(preview)).toHaveLength(0)
  })

  it('normaliza "Camisas" para slug camisas', () => {
    const csv = `${CSV_HEADERS}
prod-y,Prod Y,Camisas,100,,5,SKU-Y,Desc`
    const preview = buildImportPreview(csv, 'legacy-name.csv', [], importCategories)
    const valid = getValidProducts(preview)
    expect(valid).toHaveLength(1)
    expect(valid[0].category).toBe('camisas')
  })
})

describe('groupRowsBySlug', () => {
  it('agrupa variações pelo Identificador URL', () => {
    const rows = csvToRecords(fs.readFileSync(TEMPLATE_PATH, 'utf-8'))
    const products = groupRowsBySlug(rows)
    expect(products).toHaveLength(1)
    expect(products[0].slug).toBe('camisa-brasil-2024')
    expect(products[0].variations.map((v) => v.size)).toEqual(['P', 'M'])
  })
})

describe('findConflictingProductRows', () => {
  it('detecta CSV_E001 campos conflitantes', () => {
    const rows = csvToRecords(`Identificador URL,Nome (Português),Categorias,Preço,Preço promocional,Estoque,SKU,Descrição (Português)
same-slug,Nome A,Camisas,100,,5,SKU-A,Desc
same-slug,Nome B,Camisas,100,,5,SKU-B,Desc`)
    const conflicts = findConflictingProductRows(rows)
    expect(conflicts).toHaveLength(1)
    expect(conflicts[0].slug).toBe('same-slug')
  })
})

describe('applyImport', () => {
  it('cria produtos no repositório em memória', async () => {
    const products: Product[] = []
    const repo: ProductRepository = {
      getAll: async () => products,
      getActive: async () => products.filter((p) => p.status === 'active'),
      getById: async (id) => products.find((p) => p.id === id),
      getBySlug: async (slug) => products.find((p) => p.slug === slug),
      create: async (input) => {
        const product: Product = {
          id: String(products.length + 1),
          name: input.name,
          slug: input.slug ?? 'slug',
          shortDescription: input.shortDescription ?? '',
          longDescription: input.longDescription,
          price: input.price,
          promotionalPrice: input.promotionalPrice,
          category: input.category,
          club: input.club,
          images: input.images,
          variations: input.variations.map((v, i) => ({
            id: `v-${i}`,
            ...v,
          })),
          status: input.status,
        }
        products.push(product)
        return product
      },
      update: async (id, input) => {
        const index = products.findIndex((p) => p.id === id)
        if (index === -1) throw new Error('not found')
        products[index] = {
          ...products[index],
          name: input.name,
          variations: input.variations.map((v, i) => ({
            id: products[index].variations[i]?.id ?? `v-${i}`,
            ...v,
          })),
        }
        return products[index]
      },
      delete: async (id) => {
        const index = products.findIndex((p) => p.id === id)
        if (index !== -1) products.splice(index, 1)
      },
      saveAll: async (next) => {
        products.splice(0, products.length, ...next)
      },
      query: async () => ({ products: [], total: 0, page: 1, pageSize: 25, totalPages: 0, counts: { all: 0, active: 0, draft: 0, unavailable: 0, noStock: 0 } }),
      bulkSetStatus: async () => {},
      bulkSetCategory: async () => {},
      bulkSetCategoryId: async () => {},
      bulkSetPersonalization: async () => {},
      deleteMany: async () => {},
      setProductImages: async (id, images) => {
        const product = products.find((p) => p.id === id)
        if (!product) throw new Error('not found')
        return { ...product, images }
      },
      bulkSetProductImages: async () => {},
      getByIds: async (ids) => products.filter((p) => ids.includes(p.id) && p.status === 'active'),
      getByIdsAdmin: async (ids) => products.filter((p) => ids.includes(p.id)),
      queryStorefront: async () => ({ products: [], total: 0, page: 1, pageSize: 25, totalPages: 0, counts: { all: 0, active: 0, draft: 0, unavailable: 0, noStock: 0 } }),
      getStorefrontFeatured: async () => [],
      findConflictingSkus: async () => [],
    }

    const csv = fs.readFileSync(TEMPLATE_PATH, 'utf-8')
    const preview = buildImportPreview(csv, 'template.csv', [], importCategories)
    const valid = getValidProducts(preview)
    const result = await applyImport(valid, repo, {
      policy: 'draft',
      batchId: 'test-batch-1',
      existingBySlug: new Map(),
    })

    expect(result.created).toBe(1)
    expect(result.durationMs).toBeGreaterThanOrEqual(0)
    expect(products).toHaveLength(1)
    expect(products[0].status).toBe('draft')
    expect(products[0].category).toBe('camisas')
    expect(products[0].variations).toHaveLength(2)
  })
})
