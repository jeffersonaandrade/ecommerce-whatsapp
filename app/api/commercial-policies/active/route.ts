import { NextResponse } from 'next/server'
import { getStorefrontCommercialPolicies } from '@/lib/commercial/commercial-policies'

export const dynamic = 'force-dynamic'

export async function GET() {
  const policies = await getStorefrontCommercialPolicies('retail')
  return NextResponse.json(policies)
}
