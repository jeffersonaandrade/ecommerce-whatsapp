import fs from 'fs'
import path from 'path'
import { describe, expect, it } from 'vitest'
import { parseCsv, csvToRecords } from './parse-csv'
import { groupRowsBySlug, findConflictingProductRows } from './map-rows'
import { buildImportPreview, getValidProducts } from './validate-import'
import { applyImport } from './apply-import'
import { ProductRepository } from '@/lib/catalog/product-repository'
import { Product } from '@/types/product'

const TEMPLATE_PATH = path.join(
  process.cwd(),
  'public/templates/importacao-produtos-exemplo.csv'
)

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
    const preview = buildImportPreview(csv, 'importacao-produtos-exemplo.csv')

    expect(preview.stats.totalProducts).toBe(1)
    expect(preview.stats.validProducts).toBe(1)
    expect(preview.stats.errorCount).toBe(0)
    expect(getValidProducts(preview)).toHaveLength(1)
    expect(getValidProducts(preview)[0].variations).toHaveLength(2)
  })

  it('detecta CSV_E006 para slug vazio', () => {
    const csv = `Identificador URL,Nome (Português),Categorias,Preço,Preço promocional,Estoque,SKU,Descrição (Português)
,Camisa,Camisas,100,,5,SKU-1,Desc`
    const preview = buildImportPreview(csv, 'invalid.csv')
    expect(preview.issues.some((i) => i.code === 'CSV_E006')).toBe(true)
  })

  it('detecta CSV_E004 preço promocional inválido', () => {
    const csv = `Identificador URL,Nome (Português),Categorias,Preço,Preço promocional,Estoque,SKU,Descrição (Português)
camisa-teste,Camisa,Camisas,100,150,5,SKU-1,Desc`
    const preview = buildImportPreview(csv, 'promo.csv')
    expect(preview.issues.some((i) => i.code === 'CSV_E004')).toBe(true)
  })

  it('detecta CSV_E003 para URL http', () => {
    const csv = `Identificador URL,Nome (Português),Categorias,Preço,Preço promocional,Estoque,SKU,Descrição (Português),image_urls
camisa-teste,Camisa,Camisas,100,,5,SKU-1,Desc,http://example.com/a.jpg`
    const preview = buildImportPreview(csv, 'http.csv')
    expect(preview.issues.some((i) => i.code === 'CSV_E003')).toBe(true)
  })

  it('detecta CSV_E002 SKU duplicado', () => {
    const csv = `Identificador URL,Nome (Português),Categorias,Preço,Preço promocional,Estoque,SKU,Descrição (Português)
prod-a,Prod A,Camisas,100,,5,DUP-SKU,Desc
prod-b,Prod B,Camisas,100,,5,DUP-SKU,Desc`
    const preview = buildImportPreview(csv, 'dup.csv')
    expect(preview.issues.some((i) => i.code === 'CSV_E002')).toBe(true)
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
  it('cria produtos no repositório em memória', () => {
    const products: Product[] = []
    const repo: ProductRepository = {
      getAll: () => products,
      getById: (id) => products.find((p) => p.id === id),
      getBySlug: (slug) => products.find((p) => p.slug === slug),
      create(input) {
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
      update(id, input) {
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
      delete(id) {
        const index = products.findIndex((p) => p.id === id)
        if (index !== -1) products.splice(index, 1)
      },
      saveAll(next) {
        products.splice(0, products.length, ...next)
      },
    }

    const csv = fs.readFileSync(TEMPLATE_PATH, 'utf-8')
    const preview = buildImportPreview(csv, 'template.csv')
    const valid = getValidProducts(preview)
    const result = applyImport(valid, repo)

    expect(result.created).toBe(1)
    expect(result.durationMs).toBeGreaterThanOrEqual(0)
    expect(products).toHaveLength(1)
    expect(products[0].variations).toHaveLength(2)
  })
})
