/**
 * Stress create: N produtos em paralelo via create_product_with_variations.
 * Verifica que todos ficam salvos (sem overwrite silencioso).
 *
 *   node scripts/qa/test-create-product-rpc-batch.mjs essenza [count=8]
 */
import { createClient } from '@supabase/supabase-js'
import { loadClientEnv } from '../operator/client-env.mjs'
import { randomUUID } from 'node:crypto'

const clientSlug = process.argv[2]?.trim()
const count = Math.max(5, Number.parseInt(process.argv[3] ?? '8', 10) || 8)

if (!clientSlug) {
  console.error('Uso: node scripts/qa/test-create-product-rpc-batch.mjs <client-slug> [count]')
  process.exit(1)
}

loadClientEnv(clientSlug)

const url = process.env.NEXT_PUBLIC_SUPABASE_URL?.trim()
const key = process.env.SUPABASE_SERVICE_ROLE_KEY?.trim()
if (!url || !key) {
  console.error('Missing NEXT_PUBLIC_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY')
  process.exit(1)
}

const supabase = createClient(url, key, {
  auth: { persistSession: false, autoRefreshToken: false },
})

const runId = Date.now()

function buildPayload(index) {
  const id = randomUUID()
  const slug = `qa-batch-${runId}-${index}`
  const sku = `QA-BATCH-${runId}-${index}`
  return {
    id,
    slug,
    sku,
    payload: {
      product: {
        id,
        slug,
        name: `QA Batch ${index}`,
        short_description: 'batch smoke',
        long_description: `Produto paralelo ${index} — create_product_with_variations`,
        price: 50 + index,
        promotional_price: null,
        category: 'masculinos',
        category_id: null,
        club: null,
        images: [],
        status: 'draft',
        import_batch_id: null,
        personalization_enabled: false,
        personalization_price: null,
      },
      variations: [
        {
          id: randomUUID(),
          sku,
          size: '100ml',
          color: null,
          stock: index,
        },
        {
          id: randomUUID(),
          sku: `${sku}-B`,
          size: '50ml',
          color: null,
          stock: index + 1,
        },
      ],
    },
  }
}

async function main() {
  console.log(`Batch create ×${count} (paralelo) → ${url}`)
  const items = Array.from({ length: count }, (_, i) => buildPayload(i + 1))
  const ids = items.map((item) => item.id)

  const results = await Promise.all(
    items.map(async (item) => {
      const { data, error } = await supabase.rpc('create_product_with_variations', {
        payload: item.payload,
      })
      return { id: item.id, slug: item.slug, data, error: error?.message ?? null }
    })
  )

  const failed = results.filter((r) => r.error)
  const ok = results.filter((r) => !r.error)

  console.log(`Criados OK: ${ok.length}/${count}`)
  if (failed.length) {
    for (const f of failed) {
      console.error(`FAIL ${f.slug}: ${f.error}`)
    }
    process.exit(1)
  }

  const { data: rows, error: fetchError } = await supabase
    .from('products')
    .select('id, slug, name, status')
    .in('id', ids)

  if (fetchError) {
    console.error('FAIL fetch:', fetchError.message)
    process.exit(1)
  }

  const found = rows ?? []
  console.log(`Persistidos no banco: ${found.length}/${count}`)

  if (found.length !== count) {
    const foundIds = new Set(found.map((r) => r.id))
    const missing = ids.filter((id) => !foundIds.has(id))
    console.error('IDs ausentes (possível overwrite/perda):', missing)
    process.exit(1)
  }

  const uniqueSlugs = new Set(found.map((r) => r.slug))
  if (uniqueSlugs.size !== count) {
    console.error('FAIL: slugs não únicos após create paralelo')
    process.exit(1)
  }

  const { count: variationCount, error: varError } = await supabase
    .from('product_variations')
    .select('id', { count: 'exact', head: true })
    .in('product_id', ids)

  if (varError) {
    console.error('FAIL variations:', varError.message)
    process.exit(1)
  }

  const expectedVariations = count * 2
  console.log(`Variações: ${variationCount}/${expectedVariations}`)
  if (variationCount !== expectedVariations) {
    console.error('FAIL: contagem de variações divergente')
    process.exit(1)
  }

  await supabase.from('products').delete().in('id', ids)
  console.log('OK  cleanup batch')
  console.log('Batch paralelo: todos os produtos salvos corretamente.')
}

main().catch((err) => {
  console.error(err)
  process.exit(1)
})
