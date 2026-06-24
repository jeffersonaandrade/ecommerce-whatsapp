import Link from 'next/link'
import { siteConfig } from '@/config/site'
import { getButtonClassName } from '@/components/ui/button'
import { CartNavLink } from '@/components/cart/cart-nav-link'

export function Header() {
  return (
    <header className="sticky top-0 z-40 w-full border-b border-hairline bg-canvas">
      <nav className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
        {/* Logo — DS §9.5: logo + wordmark; §7 flat radius on mark */}
        <Link href="/" className="flex items-center gap-2.5">
          <div className="flex h-8 w-8 items-center justify-center rounded-sm bg-ink text-sm font-bold text-canvas">
            S
          </div>
          <span className="hidden text-base font-semibold tracking-tight text-ink sm:inline">
            {siteConfig.name}
          </span>
        </Link>

        {/* Navigation — DS §9.5: body-strong, text-mute hover:text-ink */}
        <div className="hidden items-center gap-8 md:flex">
          {siteConfig.navigation.map((item) => (
            <Link
              key={item.title}
              href={item.href}
              className="text-sm font-medium text-mute transition-colors hover:text-ink"
            >
              {item.title}
            </Link>
          ))}
        </div>

        {/* Actions — DS §9.5: outline pill CTAs (via getButtonClassName) */}
        <div className="flex items-center gap-3 sm:gap-4">
          <CartNavLink />
          <Link href="/admin" className={getButtonClassName('outline', 'sm')}>
            Admin
          </Link>
        </div>
      </nav>
    </header>
  )
}
