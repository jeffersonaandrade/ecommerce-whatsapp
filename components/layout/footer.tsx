import Link from 'next/link'
import { siteConfig } from '@/config/site'

export function Footer() {
  return (
    <footer className="border-t border-hairline-dark bg-ink text-canvas">
      <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 sm:py-16 lg:px-8">
        <div className="mb-12 grid grid-cols-2 gap-8 sm:grid-cols-3 lg:grid-cols-4">
          <div className="col-span-2 sm:col-span-1">
            <h3 className="mb-4 text-lg font-bold text-canvas">
              {siteConfig.name}
            </h3>
            <p className="text-sm leading-relaxed text-mute">
              {siteConfig.description}
            </p>
          </div>

          <div>
            <h4 className="mb-4 text-xs font-semibold uppercase tracking-wide text-canvas">
              Produtos
            </h4>
            <ul className="space-y-2 text-sm">
              {siteConfig.categories.map((category) => (
                <li key={category}>
                  <Link
                    href={`/products?category=${encodeURIComponent(category)}`}
                    className="text-mute transition-colors hover:text-canvas"
                  >
                    {category}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h4 className="mb-4 text-xs font-semibold uppercase tracking-wide text-canvas">
              Empresa
            </h4>
            <ul className="space-y-2 text-sm">
              <li>
                <Link
                  href="#"
                  className="text-mute transition-colors hover:text-canvas"
                >
                  Sobre
                </Link>
              </li>
              <li>
                <Link
                  href="#"
                  className="text-mute transition-colors hover:text-canvas"
                >
                  Contato
                </Link>
              </li>
              <li>
                <Link
                  href="#"
                  className="text-mute transition-colors hover:text-canvas"
                >
                  FAQ
                </Link>
              </li>
            </ul>
          </div>

          <div>
            <h4 className="mb-4 text-xs font-semibold uppercase tracking-wide text-canvas">
              Legal
            </h4>
            <ul className="space-y-2 text-sm">
              <li>
                <Link
                  href="#"
                  className="text-mute transition-colors hover:text-canvas"
                >
                  Privacidade
                </Link>
              </li>
              <li>
                <Link
                  href="#"
                  className="text-mute transition-colors hover:text-canvas"
                >
                  Termos
                </Link>
              </li>
            </ul>
          </div>
        </div>

        <div className="flex flex-col items-center justify-between gap-4 border-t border-hairline-dark pt-8 text-sm text-mute sm:flex-row">
          <p>&copy; 2024 {siteConfig.name}. Todos os direitos reservados.</p>
          <div className="flex gap-6">
            <a href="#" className="transition-colors hover:text-canvas">
              Twitter
            </a>
            <a href="#" className="transition-colors hover:text-canvas">
              Instagram
            </a>
            <a href="#" className="transition-colors hover:text-canvas">
              Facebook
            </a>
          </div>
        </div>
      </div>
    </footer>
  )
}
