import { notFound } from 'next/navigation'
import { CartTestClient } from './cart-test-client'

export default function CartTestPage() {
  if (process.env.NODE_ENV === 'production') {
    notFound()
  }

  return <CartTestClient />
}
