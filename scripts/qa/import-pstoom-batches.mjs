/**
 * Importa lotes PStoom (CSV) direto no Supabase via RPC apply_product_import_batch.
 *
 * Uso:
 *   npx tsx scripts/qa/import-pstoom-batches.mjs
 *   npx tsx scripts/qa/import-pstoom-batches.mjs --from 2 --through 10
 *   npx tsx scripts/qa/import-pstoom-batches.mjs --dry-run
 */
import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import { randomUUID } from 'node:crypto'
import { createClient } from '@supabase/supabase-js'
import { prepareImportBatch } from '../../lib/catalog/import/prepare-import-batch.ts'
import {
  buildImportPreview,
  getValidProducts,
  validateCatalogSkus,
  validateImportProductCategories,
} from '../../lib/catalog/import/validate-import.ts'
import { IMPORT_CSV_MAX_BYTES, IMPORT_MAX_PRODUCTS } from '../../lib/catalog/import/parse-limits.ts'
import { canonicalImportSlug } from '../../lib/catalog/import/canonical-import-slug.ts'
import { rowsToProduct } from '../../lib/catalog/supabase-mappers.ts'
import { rowToCategory } from '../../lib/catalog/supabase-category-mapper.ts'

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../..')
const reportsDir = path.join(root, 'test-data/reports')

loadEnvFile(path.join(root, '.env.local'))

const args = process.argv.slice(2)
const dryRun = args.includes('--dry-run')
const partial = args.includes('--partial') || !args.includes('--strict')
const fromLote = readFlag(args, '--from', 2)
const throughLote = readFlag(args, '--through', 28)

function readFlag(argv, flag, fallback) {
  const index = argv.indexOf(flag)
  if (index === -1) return fallback
  const value = Number(argv[index + 1])
  return Number.isFinite(value) ? value : fallback
}

function loadEnvFile(filePath) {
  if (!fs.existsSync(filePath)) return
  for (const line of fs.readFileSync(filePath, 'utf8').split(/\r?\n/)) {
    const trimmed = line.trim()
    if (!trimmed || trimmed.startsWith('#')) continue
    const eq = trimmed.indexOf('=')
    if (eq <= 0) continue
    const key = trimmed.slice(0, eq).trim()
    let value = trimmed.slice(eq + 1).trim()
    if (
      (value.startsWith('"') && value.endsWith('"')) ||
      (value.startsWith("'") && value.endsWith("'"))
    ) {
      value = value.slice(1, -1)
    }
    if (!process.env[key]) process.env[key] = value
  }
}

function requireEnv(name) {
  const value = process.env[name]?.trim()
  if (!value) {
    console.error(`Missing env: ${name}`)
    process.exit(1)
  }
  return value
}

function createSupabase() {
  return createClient(requireEnv('NEXT_PUBLIC_SUPABASE_URL'), requireEnv('SUPABASE_SERVICE_ROLE_KEY'), {
    auth: { autoRefreshToken: false, persistSession: false },
  })
}

async function fetchCatalog(supabase) {
  const products = []
  const pageSize = 1000
  let from = 0

  while (true) {
    const { data: productRows, error: productsError } = await supabase
      .from('products')
      .select('*, product_variations(*)')
      .order('id')
      .range(from, from + pageSize - 1)

    if (productsError) throw new Error(`products read failed: ${productsError.message}`)
    if (!productRows?.length) break

    products.push(
      ...productRows.map((row) => rowsToProduct(row, row.product_variations ?? []))
    )

    if (productRows.length < pageSize) break
    from += pageSize
  }

  const { data: categoryRows, error: categoriesError } = await supabase
    .from('categories')
    .select('*')
    .order('sort_order', { ascending: true })

  if (categoriesError) throw new Error(`categories read failed: ${categoriesError.message}`)

  const categories = (categoryRows ?? []).map((row) => rowToCategory(row))
  return { products, categories }
}

async function fetchImportedFilenames(supabase) {
  const { data, error } = await supabase.from('import_batches').select('filename')
  if (error) throw new Error(`import_batches read failed: ${error.message}`)
  return new Set((data ?? []).map((row) => row.filename))
}

function buildRpcPayload(prepared, options) {
  return {
    batchId: options.batchId,
    filename: options.filename.slice(0, 255),
    skipped: prepared.skipped,
    warnings: Math.max(0, Math.floor(options.warningCount)),
    products: prepared.items.map(({ product, isUpdate }) => ({
      id: product.id,
      slug: product.slug,
      name: product.name,
      short_description: product.shortDescription,
      long_description: product.longDescription,
      price: product.price,
      promotional_price: product.promotionalPrice ?? null,
      category: product.category,
      club: product.club ?? null,
      images: product.images,
      status: product.status,
      import_batch_id: options.batchId,
      is_update: isUpdate,
    })),
    variations: prepared.items.flatMap(({ product }) =>
      product.variations.map((variation) => ({
        product_slug: product.slug,
        sku: variation.sku,
        size: variation.size ?? null,
        color: variation.color ?? null,
        stock: variation.stock,
      }))
    ),
  }
}

function filterImportableProducts(products, catalog) {
  const catalogSkus = new Map()

  for (const product of catalog) {
    const canonical = canonicalImportSlug(product.slug)
    for (const variation of product.variations) {
      catalogSkus.set(variation.sku, canonical)
    }
  }

  const usedSkusInBatch = new Set()
  const importable = []

  for (const parsed of products) {
    const canonical = canonicalImportSlug(parsed.slug)
    let ok = true

    for (const variation of parsed.variations) {
      const owner = catalogSkus.get(variation.sku)
      if (owner && owner !== canonical) {
        ok = false
        break
      }
      if (usedSkusInBatch.has(variation.sku)) {
        ok = false
        break
      }
    }

    if (!ok) continue

    for (const variation of parsed.variations) {
      usedSkusInBatch.add(variation.sku)
      catalogSkus.set(variation.sku, canonical)
    }

    importable.push(parsed)
  }

  return importable
}

async function importBatch(supabase, csvPath, catalog, categories) {
  const filename = path.basename(csvPath)
  const text = fs.readFileSync(csvPath, 'utf8')
  const size = Buffer.byteLength(text, 'utf8')

  if (size > IMPORT_CSV_MAX_BYTES) {
    throw new Error(`${filename} excede ${IMPORT_CSV_MAX_BYTES} bytes`)
  }

  const preview = buildImportPreview(text, filename, catalog, categories)
  let products = preview.products

  if (partial) {
    const beforePartial = products.length
    products = getValidProducts(preview)
    products = filterImportableProducts(products, catalog)
    const dropped = beforePartial - products.length
    if (dropped > 0) {
      console.log(`  · ${dropped} produto(s) ignorado(s) por conflito de SKU/validação`)
    }
  } else {
    const blocking = preview.issues.filter((issue) => issue.severity === 'error')
    if (blocking.length) {
      throw new Error(`${filename}: ${blocking[0].message}`)
    }
  }

  if (!products.length) {
    throw new Error(`${filename}: nenhum produto válido para importar`)
  }

  if (products.length > IMPORT_MAX_PRODUCTS) {
    throw new Error(`${filename} excede ${IMPORT_MAX_PRODUCTS} produtos`)
  }

  const categoryIssues = validateImportProductCategories(products, categories)
  const catalogIssues = validateCatalogSkus(products, catalog)
  const confirmBlocking = [...categoryIssues, ...catalogIssues].filter(
    (issue) => issue.severity === 'error'
  )
  if (confirmBlocking.length) {
    if (partial) {
      throw new Error(`${filename}: ainda há erros após filtro parcial (${confirmBlocking[0].message})`)
    }
    throw new Error(`${filename}: ${confirmBlocking[0].message}`)
  }

  const batchId = randomUUID()
  const prepared = prepareImportBatch(products, catalog, {
    batchId,
    policy: 'draft',
  })

  if (dryRun) {
    const draftCount = prepared.items.filter(({ product }) => product.status === 'draft').length
    return {
      filename,
      batchId,
      created: prepared.created,
      updated: prepared.updated,
      skipped: prepared.skipped,
      draftCount,
      dryRun: true,
    }
  }

  const payload = buildRpcPayload(prepared, {
    batchId,
    filename,
    warningCount: preview.stats.warningCount,
  })

  const { data, error } = await supabase.rpc('apply_product_import_batch', { payload })
  if (error) throw new Error(`${filename}: ${error.message}`)

  return {
    filename,
    batchId: data?.batchId ?? batchId,
    created: data?.created ?? prepared.created,
    updated: data?.updated ?? prepared.updated,
    skipped: data?.skipped ?? prepared.skipped,
    dryRun: false,
  }
}

function padLote(n) {
  return String(n).padStart(2, '0')
}

async function main() {
  const supabase = createSupabase()
  const { products: initialCatalog, categories } = await fetchCatalog(supabase)
  let catalog = initialCatalog
  const imported = await fetchImportedFilenames(supabase)

  const results = []
  const failures = []

  for (let lote = fromLote; lote <= throughLote; lote++) {
    const filename = `import-pstoom-lote-${padLote(lote)}.csv`
    const csvPath = path.join(reportsDir, filename)

    if (!fs.existsSync(csvPath)) {
      failures.push({ lote, filename, error: 'arquivo não encontrado' })
      continue
    }

    if (imported.has(filename)) {
      console.log(`[skip] ${filename} — já importado`)
      results.push({ lote, filename, skipped: true, reason: 'already_imported' })
      continue
    }

    console.log(`[${dryRun ? 'dry-run' : 'import'}] ${filename} (${catalog.length} produtos no catálogo)...`)

    try {
      const result = await importBatch(supabase, csvPath, catalog, categories)
      results.push({ lote, ...result })

      if (!dryRun) {
        catalog = (await fetchCatalog(supabase)).products
        imported.add(filename)
      }

      console.log(
        `  ✓ created=${result.created} updated=${result.updated} skipped=${result.skipped}`
      )
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error)
      failures.push({ lote, filename, error: message })
      console.error(`  ✗ ${message}`)
    }
  }

  const report = {
    generatedAt: new Date().toISOString(),
    dryRun,
    fromLote,
    throughLote,
    results,
    failures,
    totals: results.reduce(
      (acc, row) => {
        if (row.skipped) acc.skippedBatches++
        else {
          acc.batches++
          acc.created += row.created ?? 0
          acc.updated += row.updated ?? 0
          acc.productsSkipped += row.skipped ?? 0
        }
        return acc
      },
      { batches: 0, skippedBatches: 0, created: 0, updated: 0, productsSkipped: 0 }
    ),
  }

  const reportPath = path.join(reportsDir, 'PSTOOM_BULK_IMPORT_REPORT.json')
  fs.writeFileSync(reportPath, JSON.stringify(report, null, 2))

  console.log('\n--- resumo ---')
  console.log(JSON.stringify(report.totals, null, 2))
  if (failures.length) {
    console.error(`\n${failures.length} falha(s). Ver ${reportPath}`)
    process.exit(1)
  }
  console.log(`\nRelatório: ${reportPath}`)
}

main().catch((error) => {
  console.error(error)
  process.exit(1)
})
