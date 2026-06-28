import { NextResponse } from 'next/server'
import { getStorefrontProductsLite } from '@/lib/products'

export async function GET() {
  const products = await getStorefrontProductsLite()
  return NextResponse.json(products)
}
