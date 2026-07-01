import type { Metadata, Viewport } from 'next'
import { Inter, Barlow_Condensed } from 'next/font/google'
import { Header } from '@/components/layout/header'
import { Footer } from '@/components/layout/footer'
import { CartProvider } from '@/context/cart-context'
import { assertProductionSupabaseRuntime } from '@/lib/env/assert-runtime-env'
import { getStoreSettings } from '@/lib/store/settings-repository'
import { buildRootMetadata } from '@/lib/store/build-metadata'
import { getStorefrontCommercialRules } from '@/lib/commercial/commercial-rules'
import { getStorefrontCommercialPolicies } from '@/lib/commercial/commercial-policies'
import { storeSettingsToPersonalization } from '@/lib/personalization/personalization-settings'
import './globals.css'

const inter = Inter({
  subsets: ['latin'],
  variable: '--font-inter',
  display: 'swap',
})

const barlowCondensed = Barlow_Condensed({
  subsets: ['latin'],
  weight: ['600', '700'],
  variable: '--font-barlow-condensed',
  display: 'swap',
})

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 5,
}

export async function generateMetadata(): Promise<Metadata> {
  return buildRootMetadata(await getStoreSettings())
}

export default async function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  assertProductionSupabaseRuntime('root-layout')
  const [settings, commercialRules, commercialPolicies] = await Promise.all([
    getStoreSettings(),
    getStorefrontCommercialRules(),
    getStorefrontCommercialPolicies('retail'),
  ])
  const pricingConfig = {
    personalizationSettings: storeSettingsToPersonalization(settings),
    commercialRules,
    commercialPolicies,
    salesChannels: settings.commercialSalesChannels,
  }

  return (
    <html
      lang="pt-BR"
      className={`${inter.variable} ${barlowCondensed.variable} h-full scroll-smooth antialiased`}
      style={
        {
          '--color-store-primary': settings.primaryColor,
          '--color-store-secondary': settings.secondaryColor,
        } as React.CSSProperties
      }
    >
      <body className="flex min-h-screen flex-col bg-canvas font-sans text-ink">
        <CartProvider pricingConfig={pricingConfig}>
          <Header />
          <main className="flex-1">{children}</main>
          <Footer />
        </CartProvider>
      </body>
    </html>
  )
}
