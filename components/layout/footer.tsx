import Link from 'next/link'
import { getStorefrontCategories } from '@/lib/categories'
import {
  categoryProductsHref,
  resolveStorefrontCategoryList,
} from '@/lib/catalog/storefront-categories'
import { getStoreSettings } from '@/lib/store/settings-repository'

function socialHref(platform: 'instagram' | 'facebook', value: string): string | null {
  if (!value.trim()) return null
  if (value.startsWith('http')) return value
  if (platform === 'instagram') {
    const handle = value.replace(/^@/, '')
    return `https://instagram.com/${handle}`
  }
  return value.startsWith('facebook.com') ? `https://${value}` : `https://facebook.com/${value}`
}

export async function Footer() {
  const settings = await getStoreSettings()
  const instagramUrl = socialHref('instagram', settings.instagram)
  const facebookUrl = socialHref('facebook', settings.facebook)
  const categories = resolveStorefrontCategoryList(await getStorefrontCategories())

  return (
    <footer className="border-t border-hairline-dark bg-ink text-canvas">
      <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 sm:py-16 lg:px-8">
        <div className="mb-12 grid grid-cols-2 gap-8 sm:grid-cols-3 lg:grid-cols-4">
          <div className="col-span-2 sm:col-span-1">
            <h3 className="mb-4 text-lg font-bold text-canvas">{settings.storeName}</h3>
            {settings.description && (
              <p className="text-sm leading-relaxed text-mute">{settings.description}</p>
            )}
            {settings.email && (
              <p className="mt-3 text-sm text-mute">
                <a href={`mailto:${settings.email}`} className="hover:text-canvas">
                  {settings.email}
                </a>
              </p>
            )}
          </div>

          {categories.length > 0 && (
            <div>
              <h4 className="mb-4 text-xs font-semibold uppercase tracking-wide text-canvas">
                Produtos
              </h4>
              <ul className="space-y-2 text-sm">
                {categories.map((category) => (
                  <li key={category.id}>
                    <Link
                      href={categoryProductsHref(category.slug)}
                      className="text-mute transition-colors hover:text-canvas"
                    >
                      {category.name}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          )}

          <div>
            <h4 className="mb-4 text-xs font-semibold uppercase tracking-wide text-canvas">
              Empresa
            </h4>
            <ul className="space-y-2 text-sm">
              <li>
                <Link href="/sobre" className="text-mute transition-colors hover:text-canvas">
                  Sobre
                </Link>
              </li>
              <li>
                <Link href="/contato" className="text-mute transition-colors hover:text-canvas">
                  Contato
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
                  href="/politica-de-trocas"
                  className="text-mute transition-colors hover:text-canvas"
                >
                  Política de trocas
                </Link>
              </li>
            </ul>
          </div>
        </div>

        <div className="flex flex-col items-center justify-between gap-4 border-t border-hairline-dark pt-8 text-sm text-mute sm:flex-row">
          <p>
            &copy; {new Date().getFullYear()} {settings.storeName}. Todos os direitos reservados.
          </p>
          <div className="flex gap-6">
            {instagramUrl && (
              <a
                href={instagramUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="transition-colors hover:text-canvas"
              >
                Instagram
              </a>
            )}
            {facebookUrl && (
              <a
                href={facebookUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="transition-colors hover:text-canvas"
              >
                Facebook
              </a>
            )}
          </div>
        </div>
      </div>
    </footer>
  )
}
