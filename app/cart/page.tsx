import { Metadata } from 'next'
import { CartContent } from '@/components/cart/cart-content'
import { getStoreSettings } from '@/lib/store/settings-repository'

export const metadata: Metadata = {
  title: 'Carrinho',
  description: 'Seu carrinho de compras',
}

export default function CartPage() {
  const settings = getStoreSettings()

  return (
    <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-12 sm:py-16">
      <header className="mb-8 space-y-2 sm:mb-10">
        <p className="text-xs font-semibold uppercase tracking-[0.15em] text-mute">
          Checkout
        </p>
        <h1 className="text-3xl font-bold tracking-tight text-ink sm:text-4xl">
          Seu carrinho
        </h1>
      </header>
      <CartContent
        siteUrl={settings.siteUrl}
        whatsappPhone={settings.whatsappPhone}
        whatsappMessagePrefix={settings.whatsappMessagePrefix}
      />
    </div>
  )
}
