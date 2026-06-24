import { Metadata } from 'next'
import { CartContent } from '@/components/cart/cart-content'

export const metadata: Metadata = {
  title: 'Carrinho',
  description: 'Seu carrinho de compras',
}

export default function CartPage() {
  return (
    <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-12 sm:py-16">
      <h1 className="text-3xl sm:text-4xl font-bold mb-8">Seu Carrinho</h1>
      <CartContent />
    </div>
  )
}
