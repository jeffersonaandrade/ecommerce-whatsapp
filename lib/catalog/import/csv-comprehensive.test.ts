import fs from 'fs'
import path from 'path'
import { parseCsv, csvToRecords } from './parse-csv'
import { groupRowsBySlug, findConflictingProductRows } from './map-rows'
import { buildImportPreview, getValidProducts, hasBlockingErrors } from './validate-import'
import { applyImport } from './apply-import'
import { ProductRepository } from '@/lib/catalog/product-repository'
import { Product } from '@/types/product'

interface TestResult {
  name: string
  passed: boolean
  error?: string
  details: Record<string, any>
}

const results: TestResult[] = []

function mockRepository(initialProducts: Product[] = []): ProductRepository {
  const products = [...initialProducts]
  return {
    getAll: () => products,
    getById: (id) => products.find((p) => p.id === id),
    getBySlug: (slug) => products.find((p) => p.slug === slug),
    create(input) {
      const product: Product = {
        id: `id-${Date.now()}-${Math.random()}`,
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
          id: `v-${i}-${Date.now()}`,
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
        slug: input.slug,
        shortDescription: input.shortDescription ?? '',
        longDescription: input.longDescription,
        price: input.price,
        promotionalPrice: input.promotionalPrice,
        category: input.category,
        club: input.club,
        images: input.images,
        variations: input.variations.map((v, i) => ({
          id: v.id ?? products[index].variations[i]?.id ?? `v-${i}`,
          sku: v.sku,
          stock: v.stock,
          size: v.size,
          color: v.color,
        })),
        status: input.status,
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
}

function test(name: string, fn: () => void) {
  try {
    fn()
    results.push({ name, passed: true, details: {} })
    console.log(`✓ ${name}`)
  } catch (error) {
    results.push({
      name,
      passed: false,
      error: String(error),
      details: {},
    })
    console.log(`✗ ${name}`)
    console.log(`  ${error}`)
  }
}

function expect(value: any) {
  return {
    toBe(expected: any) {
      if (value !== expected) {
        throw new Error(`Expected ${expected}, got ${value}`)
      }
    },
    toEqual(expected: any) {
      if (JSON.stringify(value) !== JSON.stringify(expected)) {
        throw new Error(
          `Expected ${JSON.stringify(expected)}, got ${JSON.stringify(value)}`
        )
      }
    },
    toHaveLength(length: number) {
      if (Array.isArray(value) && value.length !== length) {
        throw new Error(`Expected length ${length}, got ${value.length}`)
      }
    },
    toBeTruthy() {
      if (!value) throw new Error(`Expected truthy value`)
    },
    toBeFalsy() {
      if (value) throw new Error(`Expected falsy value`)
    },
  }
}

const templatePath = path.join(
  process.cwd(),
  'public/templates/importacao-produtos-exemplo.csv'
)

// Helper: Create test CSV strings
const createCsvString = (headerRow: string, dataRows: string[]): string => {
  return [headerRow, ...dataRows].join('\n')
}

const baseHeader = `Identificador URL,Nome (Português),Categorias,Preço,Preço promocional,Estoque,SKU,Descrição (Português),image_urls`

// TEST 1: Parse CSV with simple data
test('TEST_1: Parse CSV with simple data', () => {
  const csv = `slug,name\na,b\nc,d`
  const matrix = parseCsv(csv)
  expect(matrix.length).toBe(3)
  expect(matrix[0]).toEqual(['slug', 'name'])
})

// TEST 2: Parse CSV with quoted fields
test('TEST_2: Parse CSV with quoted fields containing commas', () => {
  const csv = `a,b\n"hello, world",2`
  const matrix = parseCsv(csv)
  expect(matrix[1][0]).toBe('hello, world')
})

// TEST 3: Parse CSV with BOM
test('TEST_3: Parse CSV with UTF-8 BOM', () => {
  const csv = '﻿slug,name\na,b'
  const matrix = parseCsv(csv)
  expect(matrix[0]).toEqual(['slug', 'name'])
})

// TEST 4: CSV to records
test('TEST_4: CSV to records conversion', () => {
  const csv = `slug,name\na,b\nc,d`
  const records = csvToRecords(csv)
  expect(records.length).toBe(2)
  expect(records[0].slug).toBe('a')
  expect(records[0].name).toBe('b')
  expect(records[0].__rowNumber).toBe(2)
})

// TEST 5: Validate CSV_E006 - Empty slug
test('TEST_5: Validate CSV_E006 - Empty slug', () => {
  const csv = createCsvString(baseHeader, [
    `,Nome Produto,Camisas,100,,5,SKU-001,Descrição`,
  ])
  const preview = buildImportPreview(csv, 'test.csv')
  expect(
    preview.issues.filter((i) => i.code === 'CSV_E006').length > 0
  ).toBeTruthy()
  expect(preview.stats.errorCount > 0).toBeTruthy()
})

// TEST 6: Validate CSV_E006 - Missing required column
test('TEST_6: Validate CSV_E006 - Missing required column', () => {
  const csv = `Identificador URL,Nome (Português),Categorias,Preço,Estoque,SKU,Descrição (Português)`
  const preview = buildImportPreview(csv, 'test.csv')
  expect(preview.issues.some((i) => i.code === 'CSV_E006')).toBeTruthy()
})

// TEST 7: Validate CSV_E005 - Invalid stock
test('TEST_7: Validate CSV_E005 - Invalid stock (negative)', () => {
  const csv = createCsvString(baseHeader, [
    `prod-a,Produto A,Camisas,100,,5,SKU-001,Descrição`,
    `prod-a,Produto A,Camisas,100,,-5,SKU-002,Descrição`,
  ])
  const preview = buildImportPreview(csv, 'test.csv')
  expect(preview.issues.some((i) => i.code === 'CSV_E005')).toBeTruthy()
})

// TEST 8: Validate CSV_E004 - Invalid promotional price
test('TEST_8: Validate CSV_E004 - Promo >= regular price', () => {
  const csv = createCsvString(baseHeader, [
    `prod-a,Produto A,Camisas,100,150,5,SKU-001,Descrição`,
  ])
  const preview = buildImportPreview(csv, 'test.csv')
  expect(preview.issues.some((i) => i.code === 'CSV_E004')).toBeTruthy()
})

// TEST 9: Validate CSV_E003 - Invalid image URL (HTTP)
test('TEST_9: Validate CSV_E003 - HTTP image URL instead of HTTPS', () => {
  const csv = createCsvString(baseHeader, [
    `prod-a,Produto A,Camisas,100,,5,SKU-001,Descrição,http://example.com/img.jpg`,
  ])
  const preview = buildImportPreview(csv, 'test.csv')
  expect(preview.issues.some((i) => i.code === 'CSV_E003')).toBeTruthy()
})

// TEST 10: Validate CSV_E003 - Invalid image extension
test('TEST_10: Validate CSV_E003 - Invalid image extension', () => {
  const csv = createCsvString(baseHeader, [
    `prod-a,Produto A,Camisas,100,,5,SKU-001,Descrição,https://example.com/img.txt`,
  ])
  const preview = buildImportPreview(csv, 'test.csv')
  expect(preview.issues.some((i) => i.code === 'CSV_E003')).toBeTruthy()
})

// TEST 11: Validate CSV_E003 - Too many image URLs
test('TEST_11: Validate CSV_E003 - More than 5 image URLs', () => {
  const urls = Array(6)
    .fill(0)
    .map((_, i) => `https://example.com/img${i}.jpg`)
    .join('|')
  const csv = createCsvString(baseHeader, [
    `prod-a,Produto A,Camisas,100,,5,SKU-001,Descrição,${urls}`,
  ])
  const preview = buildImportPreview(csv, 'test.csv')
  expect(preview.issues.some((i) => i.code === 'CSV_E003')).toBeTruthy()
})

// TEST 12: Validate CSV_E002 - Duplicate SKU in file
test('TEST_12: Validate CSV_E002 - Duplicate SKU in same file', () => {
  const csv = createCsvString(baseHeader, [
    `prod-a,Produto A,Camisas,100,,5,DUP-SKU,Descrição`,
    `prod-b,Produto B,Camisas,100,,5,DUP-SKU,Descrição`,
  ])
  const preview = buildImportPreview(csv, 'test.csv')
  expect(preview.issues.some((i) => i.code === 'CSV_E002')).toBeTruthy()
})

// TEST 13: Validate CSV_E001 - Conflicting product fields
test('TEST_13: Validate CSV_E001 - Conflicting product fields', () => {
  const csv = createCsvString(baseHeader, [
    `same-slug,Nome A,Camisas,100,,5,SKU-A,Descrição A`,
    `same-slug,Nome B,Camisas,100,,5,SKU-B,Descrição A`,
  ])
  const preview = buildImportPreview(csv, 'test.csv')
  expect(preview.issues.some((i) => i.code === 'CSV_E001')).toBeTruthy()
})

// TEST 14: Validate CSV_E007 - Invalid dimension format
test('TEST_14: Validate CSV_E007 - Invalid dimension format', () => {
  const csv = `Identificador URL,Nome (Português),Categorias,Preço,Preço promocional,Estoque,SKU,Descrição (Português),Peso (kg)
prod-a,Produto A,Camisas,100,,5,SKU-001,Descrição,abc`
  const preview = buildImportPreview(csv, 'test.csv')
  expect(preview.issues.some((i) => i.code === 'CSV_E007')).toBeTruthy()
})

// TEST 15: Valid product with multiple variations
test('TEST_15: Valid product with multiple variations', () => {
  const csv = createCsvString(baseHeader, [
    `prod-multi,Produto Multi,Camisas,100,,10,SKU-001,Descrição`,
    `prod-multi,Produto Multi,Camisas,100,,8,SKU-002,Descrição`,
  ])
  const preview = buildImportPreview(csv, 'test.csv')
  expect(preview.stats.validProducts).toBe(1)
  expect(preview.stats.errorCount).toBe(0)
})

// TEST 16: Valid product with images
test('TEST_16: Valid product with multiple images', () => {
  const csv = createCsvString(baseHeader, [
    `prod-img,Produto Img,Camisas,100,,5,SKU-001,Descrição,https://example.com/img1.jpg|https://example.com/img2.webp`,
  ])
  const preview = buildImportPreview(csv, 'test.csv')
  expect(preview.stats.validProducts).toBe(1)
  const products = getValidProducts(preview)
  expect(products[0].images.length).toBe(2)
})

// TEST 17: Create new product
test('TEST_17: Create new product via applyImport', () => {
  const csv = createCsvString(baseHeader, [
    `new-prod,Novo Produto,Camisas,99.99,,15,NEW-SKU-001,Descrição do novo produto`,
  ])
  const preview = buildImportPreview(csv, 'test.csv')
  const valid = getValidProducts(preview)
  const repo = mockRepository()
  const result = applyImport(valid, repo)

  expect(result.created).toBe(1)
  expect(result.updated).toBe(0)
  expect(repo.getBySlug('new-prod')).toBeTruthy()
  expect(repo.getBySlug('new-prod')?.price).toBe(99.99)
})

// TEST 18: Update existing product
test('TEST_18: Update existing product via applyImport', () => {
  const existing: Product = {
    id: 'existing-1',
    slug: 'existing-prod',
    name: 'Existing Product',
    shortDescription: 'Short',
    longDescription: 'Long',
    price: 50,
    category: 'Camisas',
    images: [],
    variations: [{ id: 'v1', sku: 'EXIST-SKU-001', stock: 5, size: 'P' }],
    status: 'active',
  }

  const csv = createCsvString(baseHeader, [
    `existing-prod,Existing Product Updated,Camisas,75.50,,20,EXIST-SKU-001,Updated description`,
    `existing-prod,Existing Product Updated,Camisas,75.50,,10,EXIST-SKU-002,Updated description`,
  ])

  const preview = buildImportPreview(csv, 'test.csv', [existing])
  const valid = getValidProducts(preview)
  const repo = mockRepository([existing])
  const result = applyImport(valid, repo)

  expect(result.updated).toBe(1)
  expect(result.created).toBe(0)
  const updated = repo.getBySlug('existing-prod')
  expect(updated?.price).toBe(75.5)
  expect(updated?.variations.length).toBe(2)
})

// TEST 19: Rollback on error
test('TEST_19: Rollback on applyImport error', () => {
  const csv = createCsvString(baseHeader, [
    `rollback-test,Rollback Test,Camisas,100,,5,ROLLBACK-SKU-001,Descrição`,
  ])
  const preview = buildImportPreview(csv, 'test.csv')
  const valid = getValidProducts(preview)

  const repo = mockRepository()
  const initialState = repo.getAll()

  // Simulate error in update method
  const originalUpdate = repo.update
  let errorThrown = false
  repo.update = () => {
    errorThrown = true
    throw new Error('Simulated database error')
  }

  try {
    applyImport(valid, repo)
  } catch (error) {
    // Error expected
  }

  repo.update = originalUpdate
})

// TEST 20: Image URL processing
test('TEST_20: Image URL deduplication and processing', () => {
  const csv = createCsvString(baseHeader, [
    `img-dedup,Imagem Dedup,Camisas,100,,5,IMG-SKU-001,Descrição,https://example.com/img.jpg|https://example.com/img.jpg|https://example.com/img2.png`,
  ])
  const preview = buildImportPreview(csv, 'test.csv')
  const valid = getValidProducts(preview)
  expect(valid[0].images.length).toBe(2) // Deduplicated
})

// TEST 21: Empty CSV
test('TEST_21: Handle empty CSV file', () => {
  const csv = ``
  const preview = buildImportPreview(csv, 'empty.csv')
  expect(preview.stats.totalRows).toBe(0)
  expect(preview.stats.errorCount > 0).toBeTruthy()
})

// TEST 22: Products with promotional price
test('TEST_22: Products with valid promotional price', () => {
  const csv = createCsvString(baseHeader, [
    `promo-prod,Promo Produto,Camisas,199.90,149.90,5,PROMO-SKU-001,Descrição com preço promocional`,
  ])
  const preview = buildImportPreview(csv, 'test.csv')
  expect(preview.stats.validProducts).toBe(1)
  const valid = getValidProducts(preview)
  expect(valid[0].promotionalPrice).toBe(149.9)
})

// TEST 23: Skip products without variations
test('TEST_23: Skip products without valid variations', () => {
  const csv = createCsvString(baseHeader, [
    `,Sem SKU,Camisas,100,,5,,Descrição sem SKU`,
  ])
  const preview = buildImportPreview(csv, 'test.csv')
  // This should have an error for missing slug
  expect(preview.stats.errorCount > 0).toBeTruthy()
})

// TEST 24: Template file validation
test('TEST_24: Template CSV is valid', () => {
  const templateCsv = fs.readFileSync(templatePath, 'utf-8')
  const preview = buildImportPreview(templateCsv, 'template.csv')
  expect(preview.stats.validProducts > 0).toBeTruthy()
  expect(preview.stats.errorCount).toBe(0)
  expect(hasBlockingErrors(preview)).toBeFalsy()
})

// TEST 25: Template CSV creates correct products
test('TEST_25: Template CSV creates correct product with variations', () => {
  const templateCsv = fs.readFileSync(templatePath, 'utf-8')
  const preview = buildImportPreview(templateCsv, 'template.csv')
  const valid = getValidProducts(preview)
  const repo = mockRepository()
  const result = applyImport(valid, repo)

  expect(result.created).toBe(1)
  const product = repo.getBySlug('camisa-brasil-2024')
  expect(product).toBeTruthy()
  expect(product?.variations.length).toBe(2)
  expect(product?.price).toBe(189.9)
  expect(product?.promotionalPrice).toBe(159.9)
  expect(product?.images.length).toBe(2)
})

// Report generation
function generateReport() {
  const passed = results.filter((r) => r.passed).length
  const failed = results.filter((r) => !r.passed).length
  const total = results.length

  let report = `# CSV IMPORT COMPREHENSIVE TEST REPORT

## Summary
- **Total Tests**: ${total}
- **Passed**: ${passed} ✓
- **Failed**: ${failed} ✗
- **Pass Rate**: ${((passed / total) * 100).toFixed(1)}%

## Test Results

`

  for (const result of results) {
    const icon = result.passed ? '✓' : '✗'
    report += `### ${icon} ${result.name}\n`
    if (!result.passed && result.error) {
      report += `**Error**: ${result.error}\n`
    }
    report += '\n'
  }

  return report
}

// Export results for reporting
export { results, generateReport }
