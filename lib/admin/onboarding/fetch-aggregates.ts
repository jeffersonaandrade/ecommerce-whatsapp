import 'server-only'

import { createAdminClient } from '@/lib/supabase/admin'
import { getAllProductsAdmin } from '@/lib/products'
import { classifyProductImagesInitial, normalizeSupabaseBaseUrl } from '@/lib/catalog/media/classify-url'
import { isSupabaseAuthMode } from '@/lib/auth/mode'

export type OnboardingProductCounts = {
  all: number
  active: number
}

export type OnboardingAggregates = {
  productCounts: OnboardingProductCounts
  mediaIssueCount: number
}

export async function fetchOnboardingAggregates(): Promise<OnboardingAggregates> {
  if (!isSupabaseAuthMode()) {
    const products = await getAllProductsAdmin()
    const active = products.filter((p) => p.status === 'active').length
    const supabaseUrl = normalizeSupabaseBaseUrl(process.env.NEXT_PUBLIC_SUPABASE_URL)
    const mediaIssueCount = products.filter((p) => {
      const status = classifyProductImagesInitial(p.images, supabaseUrl)
      return status === 'empty' || status === 'external'
    }).length

    return {
      productCounts: { all: products.length, active },
      mediaIssueCount,
    }
  }

  const supabase = createAdminClient()
  const [statusResult, mediaResult] = await Promise.all([
    supabase.rpc('get_product_status_counts').maybeSingle(),
    supabase.rpc('get_media_issue_count').maybeSingle(),
  ])

  if (statusResult.error || !statusResult.data) {
    throw new Error(
      `get_product_status_counts failed: ${statusResult.error?.message ?? 'empty response'}`
    )
  }

  if (mediaResult.error) {
    throw new Error(`get_media_issue_count failed: ${mediaResult.error.message}`)
  }

  const counts = statusResult.data as { all: number; active: number }

  return {
    productCounts: { all: counts.all, active: counts.active },
    mediaIssueCount: (mediaResult.data as number | null) ?? 0,
  }
}
