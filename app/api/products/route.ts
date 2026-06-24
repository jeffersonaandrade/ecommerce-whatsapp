import { NextResponse } from 'next/server'
import { getAllProducts } from '@/lib/products'

export function GET() {
  const products = getAllProducts()
  return NextResponse.json(products)
}
