import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'
import { createClient } from '@supabase/supabase-js'

const root = path.join(path.dirname(fileURLToPath(import.meta.url)), '..')
const env = {}
for (const line of fs.readFileSync(path.join(root, '.env.local'), 'utf8').split(/\r?\n/)) {
  const m = line.match(/^([A-Za-z_][A-Za-z0-9_]*)=(.*)$/)
  if (m) env[m[1]] = m[2].trim()
}

const supabase = createClient(env.NEXT_PUBLIC_SUPABASE_URL, env.SUPABASE_SERVICE_ROLE_KEY, {
  auth: { persistSession: false, autoRefreshToken: false },
})

const testId = 'qa-create-test'
const testSku = 'QA-CREATE-SKU-001'

await supabase.from('product_variations').delete().eq('id', 'qa-create-var')
await supabase.from('products').delete().eq('id', testId)

const { error: createErr } = await supabase.from('products').insert({
  id: testId,
  slug: 'produto-qa-create-fix',
  name: 'Produto QA Create Fix',
  short_description: 'Teste',
  long_description: 'Teste pos-fix',
  price: 99.99,
  category: 'Camisas',
  images: ['https://cdn.exemplo.com/qa.jpg'],
  status: 'active',
})
if (createErr) {
  console.log('FAIL create product', createErr.message)
  process.exit(1)
}

const { error: varErr } = await supabase.from('product_variations').insert({
  id: 'qa-create-var',
  product_id: testId,
  size: 'M',
  sku: testSku,
  stock: 5,
})
if (varErr) {
  console.log('FAIL create variation', varErr.message)
  process.exit(1)
}

const { count } = await supabase
  .from('products')
  .select('*', { count: 'exact', head: true })
  .eq('id', testId)
console.log('PASS create count', count)

await supabase.from('product_variations').delete().eq('id', 'qa-create-var')
await supabase.from('products').delete().eq('id', testId)

const { count: after } = await supabase
  .from('products')
  .select('*', { count: 'exact', head: true })
  .eq('id', testId)
console.log(after === 0 ? 'PASS delete' : 'FAIL delete still exists')
