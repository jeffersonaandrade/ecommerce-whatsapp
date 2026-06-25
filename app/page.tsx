import { SportsHero } from '@/components/commerce/sports-hero'
import { HomeCategories } from '@/components/commerce/home-categories'
import { EditorialBanner } from '@/components/commerce/editorial-banner'
import { HomeBenefits } from '@/components/commerce/home-benefits'
import { NewsletterBlock } from '@/components/commerce/newsletter-block'
import { ProductCard } from '@/components/product/product-card'
import { getAllProducts, getFeaturedProducts } from '@/lib/products'
import { getStoreSettings } from '@/lib/store/settings-repository'
import { resolveExistingBrandingPath } from '@/lib/store/generate-branding'
import { buildPageMetadata } from '@/lib/store/build-metadata'
import type { Metadata } from 'next'

export async function generateMetadata(): Promise<Metadata> {
  const settings = getStoreSettings()
  return buildPageMetadata(settings, settings.storeName, settings.description, '/')
}

export default function Home() {
  const settings = getStoreSettings()
  const allProducts = getAllProducts()
  const heroFeatured = getFeaturedProducts(4)
  const featuredProducts = getFeaturedProducts(6)
  const bestSellers = allProducts.slice(2, 6)

  return (
    <div className="w-full">
      <SportsHero
        featuredProducts={heroFeatured}
        content={{
          storeName: settings.storeName,
          heroImagePath: resolveExistingBrandingPath(settings.heroImagePath),
          heroHeadline: settings.heroHeadline,
          heroHeadlineLine2: settings.heroHeadlineLine2,
          heroSubheadline: settings.heroSubheadline,
          heroCtaLabel: settings.heroCtaLabel,
          heroCtaHref: settings.heroCtaHref,
          updatedAt: settings.updatedAt,
        }}
      />

      <HomeCategories />

      <section className="py-12 sm:py-16 lg:py-20">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <header className="mb-8 space-y-2 sm:mb-12">
            <p className="text-xs font-semibold uppercase tracking-[0.15em] text-mute">
              Seleção curada
            </p>
            <h2 className="font-display text-2xl font-bold uppercase tracking-tight text-ink sm:text-3xl">
              Produtos em destaque
            </h2>
            <p className="max-w-xl text-mute">
              Peças esportivas premium escolhidas para performance e autenticidade.
            </p>
          </header>
          <div className="grid grid-cols-2 gap-6 md:grid-cols-3 md:gap-8 lg:grid-cols-3">
            {featuredProducts.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        </div>
      </section>

      <EditorialBanner />

      <section className="border-t border-hairline bg-canvas py-12 sm:py-16 lg:py-20">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <header className="mb-8 space-y-2 sm:mb-12">
            <p className="text-xs font-semibold uppercase tracking-[0.15em] text-mute">
              Mais procurados
            </p>
            <h2 className="font-display text-2xl font-bold uppercase tracking-tight text-ink sm:text-3xl">
              Mais vendidos
            </h2>
          </header>
          <div className="grid grid-cols-2 gap-6 md:grid-cols-4 md:gap-8">
            {bestSellers.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        </div>
      </section>

      <HomeBenefits />
      <NewsletterBlock />
    </div>
  )
}
