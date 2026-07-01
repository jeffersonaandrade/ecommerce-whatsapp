import { assertProductionSupabaseRuntime } from '@/lib/env/assert-runtime-env'

export async function register() {
  if (process.env.NEXT_RUNTIME === 'nodejs') {
    assertProductionSupabaseRuntime('instrumentation')
  }
}
