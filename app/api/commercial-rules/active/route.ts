import { NextResponse } from 'next/server'
import { getStorefrontCommercialRules } from '@/lib/commercial/commercial-rules'

const CACHE_HEADERS = {
  'Cache-Control': 'public, s-maxage=60, stale-while-revalidate=300',
}

export async function GET() {
  const rules = await getStorefrontCommercialRules()
  return NextResponse.json(rules, { headers: CACHE_HEADERS })
}
