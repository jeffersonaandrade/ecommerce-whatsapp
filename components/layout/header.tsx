import Link from 'next/link'
import { AdminAccessButton } from '@/components/admin/admin-access-button'
import { CartNavLink } from '@/components/cart/cart-nav-link'
import { getStoreSettings } from '@/lib/store/settings-repository'
import { brandingAssetUrl } from '@/lib/store/branding-url'
import { resolveExistingBrandingPath } from '@/lib/store/generate-branding'

export async function Header() {
  const settings = await getStoreSettings()
  const logoPath = await resolveExistingBrandingPath(settings.logoPath)
  const logoUrl = brandingAssetUrl(logoPath, settings.updatedAt)

  return (
    <header className="sticky top-0 z-40 w-full border-b border-hairline bg-canvas">
      <nav
        className="mx-auto flex h-14 max-w-7xl items-center justify-between gap-4 px-4 sm:h-16 sm:px-6 lg:px-8"
        aria-label="Principal"
      >
        <Link href="/" className="flex min-w-0 shrink items-center gap-2.5">
          {logoUrl ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={logoUrl}
              alt={settings.storeName}
              className="h-8 w-auto max-w-[120px] shrink-0 rounded-sm object-contain"
            />
          ) : (
            <div
              className="flex h-8 w-8 shrink-0 items-center justify-center rounded-sm text-sm font-bold text-canvas"
              style={{ backgroundColor: settings.primaryColor }}
            >
              {settings.storeName.charAt(0).toUpperCase()}
            </div>
          )}
          <span className="truncate text-base font-semibold tracking-tight text-ink sm:max-w-[12rem] lg:max-w-none">
            {settings.storeName}
          </span>
        </Link>

        <div className="flex shrink-0 items-center gap-2 sm:gap-3">
          <CartNavLink />
          <AdminAccessButton />
        </div>
      </nav>
    </header>
  )
}
