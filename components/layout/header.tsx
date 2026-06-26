import Link from 'next/link'
import { siteConfig } from '@/config/site'
import { AdminAccessButton } from '@/components/admin/admin-access-button'
import { CartNavLink } from '@/components/cart/cart-nav-link'
import { getStoreSettings } from '@/lib/store/settings-repository'
import { brandingAssetUrl } from '@/lib/store/branding-url'
import { resolveExistingBrandingPath } from '@/lib/store/generate-branding'
import { getCategories } from '@/lib/products'
import {
  categoryProductsHref,
  resolveStorefrontCategories,
} from '@/lib/catalog/storefront-categories'

export async function Header() {
  const settings = await getStoreSettings()
  const logoPath = await resolveExistingBrandingPath(settings.logoPath)
  const logoUrl = brandingAssetUrl(logoPath, settings.updatedAt)
  const catalogCategories = await getCategories()
  const categories = resolveStorefrontCategories(catalogCategories)

  const institutionalNav = siteConfig.navigation.filter(
    (item) => item.href !== '/products'
  )

  return (
    <header className="sticky top-0 z-40 w-full border-b border-hairline bg-canvas">
      <nav className="mx-auto flex h-16 max-w-7xl items-center justify-between gap-4 px-4 sm:px-6 lg:px-8">
        <Link href="/" className="flex shrink-0 items-center gap-2.5">
          {logoUrl ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={logoUrl}
              alt={settings.storeName}
              className="h-8 w-8 rounded-sm object-cover"
            />
          ) : (
            <div
              className="flex h-8 w-8 items-center justify-center rounded-sm text-sm font-bold text-canvas"
              style={{ backgroundColor: settings.primaryColor }}
            >
              {settings.storeName.charAt(0).toUpperCase()}
            </div>
          )}
          <span className="hidden text-base font-semibold tracking-tight text-ink sm:inline">
            {settings.storeName}
          </span>
        </Link>

        <div className="hidden min-w-0 flex-1 items-center justify-center gap-4 overflow-x-auto lg:flex xl:gap-6">
          {categories.map((category) => (
            <Link
              key={category}
              href={categoryProductsHref(category)}
              className="shrink-0 text-sm font-medium text-mute transition-colors hover:text-ink"
            >
              {category}
            </Link>
          ))}
          <Link
            href="/products"
            className="shrink-0 text-sm font-semibold text-ink transition-colors hover:text-mute"
          >
            Ver tudo
          </Link>
        </div>

        <div className="hidden items-center gap-6 xl:flex">
          {institutionalNav.map((item) => (
            <Link
              key={item.title}
              href={item.href}
              className="text-sm font-medium text-mute transition-colors hover:text-ink"
            >
              {item.title}
            </Link>
          ))}
        </div>

        <div className="flex shrink-0 items-center gap-3 sm:gap-4">
          <CartNavLink />
          <AdminAccessButton />
        </div>
      </nav>
    </header>
  )
}
