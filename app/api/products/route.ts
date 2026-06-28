import { NextRequest, NextResponse } from 'next/server'
import { getStorefrontProductsLiteByIds } from '@/lib/products'

const CACHE_HEADERS = {
  'Cache-Control': 'public, s-maxage=60, stale-while-revalidate=300',
}

const MAX_IDS = 100

function parseIdsParam(raw: string | null): string[] {
  if (!raw?.trim()) return []
  return [...new Set(raw.split(',').map((id) => id.trim()).filter(Boolean))].slice(0, MAX_IDS)
}

export async function GET(request: NextRequest) {
  const ids = parseIdsParam(request.nextUrl.searchParams.get('ids'))

  if (ids.length === 0) {
    return NextResponse.json([], { headers: CACHE_HEADERS })
  }

  const products = await getStorefrontProductsLiteByIds(ids)
  return NextResponse.json(products, { headers: CACHE_HEADERS })
}
