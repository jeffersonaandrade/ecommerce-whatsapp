import Link from 'next/link'
import { siteConfig } from '@/config/site'
import { getButtonClassName } from '@/components/ui/button'
import { CartNavLink } from '@/components/cart/cart-nav-link'

export function Header() {
  return (
    <header className="sticky top-0 z-40 w-full bg-white border-b border-gray-200">
      <nav className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        {/* Logo */}
        <Link href="/" className="flex items-center gap-2">
          <div className="w-8 h-8 bg-black rounded-lg flex items-center justify-center text-white font-bold">
            S
          </div>
          <span className="font-bold text-lg hidden sm:inline">{siteConfig.name}</span>
        </Link>

        {/* Navigation */}
        <div className="hidden md:flex items-center gap-8">
          {siteConfig.navigation.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className="text-sm font-medium text-gray-700 hover:text-black transition-colors"
            >
              {item.title}
            </Link>
          ))}
        </div>

        {/* Right Side */}
        <div className="flex items-center gap-4">
          <CartNavLink />
          <Link
            href="/admin"
            className={getButtonClassName('outline', 'sm')}
          >
            Admin
          </Link>
        </div>
      </nav>
    </header>
  )
}
