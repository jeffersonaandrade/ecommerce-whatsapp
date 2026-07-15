/**
 * Smoke test da RPC create_product_with_variations (Essenza).
 * Pré-requisito: migration aplicada no Supabase do cliente.
 *
 *   node scripts/qa/test-create-product-rpc.mjs essenza
 */
import { createClient } from '@supabase/supabase-js'
import { loadClientEnv } from '../operator/client-env.mjs'
import { randomUUID } from 'node:crypto'

const clientSlug = process.argv[2]?.trim()
if (!clientSlug) {
  console.error('Uso: node scripts/qa/test-create-product-rpc.mjs <client-slug>')
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

function buildPayload(overrides = {}) {
  const id = overrides.id ?? randomUUID()
  const slug = overrides.slug ?? `qa-create-${Date.now()}`
  const sku = overrides.sku ?? `QA-SKU-${Date.now()}`
  return {
    id,
    slug,
    sku,
    payload: {
      product: {
        id,
        slug,
        name: 'QA Create Atomic',
        short_description: 'smoke',
        long_description: 'Produto de teste create_product_with_variations',
        price: 99.9,
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
          stock: 3,
        },
      ],
    },
  }
}

async function main() {
  console.log(`Test create RPC → ${url}`)

  const first = buildPayload()
  const { data, error } = await supabase.rpc('create_product_with_variations', {
    payload: first.payload,
  })

  if (error) {
    console.error('FAIL create:', error.message)
    process.exit(1)
  }
  console.log('OK  create:', data)

  const { error: dupIdError } = await supabase.rpc('create_product_with_variations', {
    payload: first.payload,
  })
  if (!dupIdError) {
    console.error('FAIL: esperado erro em id duplicado')
    process.exit(1)
  }
  console.log('OK  duplicate id rejeitado:', dupIdError.message)

  const second = buildPayload({
    slug: first.slug,
    sku: `QA-SKU-OTHER-${Date.now()}`,
  })
  const { error: dupSlugError } = await supabase.rpc('create_product_with_variations', {
    payload: second.payload,
  })
  if (!dupSlugError) {
    console.error('FAIL: esperado erro em slug duplicado')
    process.exit(1)
  }
  console.log('OK  duplicate slug rejeitado:', dupSlugError.message)

  const third = buildPayload({ sku: first.sku })
  const { error: dupSkuError } = await supabase.rpc('create_product_with_variations', {
    payload: third.payload,
  })
  if (!dupSkuError) {
    console.error('FAIL: esperado erro em sku duplicado')
    process.exit(1)
  }
  console.log('OK  duplicate sku rejeitado:', dupSkuError.message)

  await supabase.from('products').delete().eq('id', first.id)
  console.log('OK  cleanup produto de teste')
  console.log('Todos os checks passaram.')
}

main().catch((err) => {
  console.error(err)
  process.exit(1)
})
