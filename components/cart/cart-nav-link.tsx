'use client'

import Link from 'next/link'
import { useCart } from '@/context/cart-context'
import { Button } from '@/components/ui/button'

export function CartNavLink() {
  const { itemCount, isHydrated } = useCart()
  const showBadge = isHydrated && itemCount > 0

  return (
    <Link href="/cart" className="relative inline-flex">
      <Button variant="outline" size="sm">
        🛒 Carrinho
      </Button>
      {showBadge && (
        <span className="absolute -top-2 -right-2 flex h-5 min-w-5 items-center justify-center rounded-full bg-black px-1 text-xs font-semibold text-white">
          {itemCount > 99 ? '99+' : itemCount}
        </span>
      )}
    </Link>
  )
}
