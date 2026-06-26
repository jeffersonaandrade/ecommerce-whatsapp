import { SportsHero } from '@/components/commerce/sports-hero'
import { BannerCarousel } from '@/components/commerce/banner-carousel'
import { CategoryChips } from '@/components/commerce/category-chips'
import { HomeCategories } from '@/components/commerce/home-categories'
import { HomeBenefits } from '@/components/commerce/home-benefits'
import { ProductCard } from '@/components/product/product-card'
import { getAllProducts } from '@/lib/products'
import { pickHomeProductSections } from '@/lib/products-home-sections'
import { getStorefrontCategories } from '@/lib/categories'
import { resolveStorefrontCategoryList } from '@/lib/catalog/storefront-categories'
import { getStoreSettings } from '@/lib/store/settings-repository'
import { resolveExistingBrandingPath } from '@/lib/store/branding-storage'
import { buildPageMetadata } from '@/lib/store/build-metadata'
import { getActiveBannerSlides } from '@/lib/banners'
import type { Metadata } from 'next'

export async function generateMetadata(): Promise<Metadata> {
  const settings = await getStoreSettings()
  return buildPageMetadata(settings, settings.storeName, settings.description, '/')
}

export default async function Home() {
  const [settings, allProducts, bannerSlides] = await Promise.all([
    getStoreSettings(),
    getAllProducts(),
    getActiveBannerSlides(),
  ])
  const { featured, seeAlso } = pickHomeProductSections(allProducts, 6, 4)
  const categories = resolveStorefrontCategoryList(await getStorefrontCategories())
  const heroImagePath = await resolveExistingBrandingPath(settings.heroImagePath)

  return (
    <div className="w-full">
      {bannerSlides.length > 0 ? (
        <BannerCarousel slides={bannerSlides} />
      ) : (
        <SportsHero
          content={{
            storeName: settings.storeName,
            heroImagePath,
            heroHeadline: settings.heroHeadline,
            heroHeadlineLine2: settings.heroHeadlineLine2,
            heroSubheadline: settings.heroSubheadline,
            heroCtaLabel: settings.heroCtaLabel,
            heroCtaHref: settings.heroCtaHref,
            updatedAt: settings.updatedAt,
          }}
        />
      )}

      <CategoryChips categories={categories} />
      <HomeCategories categories={categories} />

      {featured.length > 0 && (
        <section className="py-12 sm:py-16 lg:py-20">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <header className="mb-8 space-y-2 sm:mb-12">
              <p className="text-xs font-semibold uppercase tracking-[0.15em] text-mute">
                Destaques
              </p>
              <h2 className="font-display text-2xl font-bold uppercase tracking-tight text-ink sm:text-3xl">
                Produtos em destaque
              </h2>
              <p className="max-w-xl text-mute">
                Confira os produtos mais relevantes da loja.
              </p>
            </header>
            <div className="grid grid-cols-2 gap-6 md:grid-cols-3 md:gap-8 lg:grid-cols-3">
              {featured.map((product) => (
                <ProductCard key={product.id} product={product} />
              ))}
            </div>
          </div>
        </section>
      )}

      {seeAlso.length > 0 && (
        <section className="border-t border-hairline bg-canvas py-12 sm:py-16 lg:py-20">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <header className="mb-8 space-y-2 sm:mb-12">
              <p className="text-xs font-semibold uppercase tracking-[0.15em] text-mute">
                Explore mais
              </p>
              <h2 className="font-display text-2xl font-bold uppercase tracking-tight text-ink sm:text-3xl">
                Veja também
              </h2>
            </header>
            <div className="grid grid-cols-2 gap-6 md:grid-cols-4 md:gap-8">
              {seeAlso.map((product) => (
                <ProductCard key={product.id} product={product} />
              ))}
            </div>
          </div>
        </section>
      )}

      <HomeBenefits />
    </div>
  )
}
