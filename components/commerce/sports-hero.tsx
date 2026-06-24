import Image from 'next/image'
import Link from 'next/link'
import { siteConfig } from '@/config/site'
import { getButtonClassName } from '@/components/ui/button'

const HERO_IMAGE =
  'https://images.unsplash.com/photo-1461896836934-ffe607ba8211?w=1200&h=1400&fit=crop'

export function SportsHero() {
  return (
    <section className="border-b border-hairline bg-canvas">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-12 sm:py-16 lg:py-20">
        <div className="grid grid-cols-1 items-center gap-8 lg:grid-cols-2 lg:gap-12">
          {/* Photography — DS §2 photography-first; mobile-first (stacked first) */}
          <div className="relative aspect-[4/5] w-full overflow-hidden bg-soft-cloud sm:aspect-square lg:aspect-[4/5] lg:order-2">
            <Image
              src={HERO_IMAGE}
              alt="Equipamento esportivo premium"
              fill
              className="object-cover"
              sizes="(max-width: 1024px) 100vw, 50vw"
              priority
            />
          </div>

          {/* Copy — DS §4 display/h1 hierarchy; §3 ink/mute palette */}
          <div className="space-y-6 sm:space-y-8 lg:order-1">
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-mute sm:text-sm">
              Equipamento esportivo premium
            </p>

            <h1 className="max-w-xl text-4xl font-bold leading-[1.1] tracking-tight text-ink sm:text-5xl lg:text-6xl">
              Vista o jogo.
              <span className="block text-charcoal">Com autenticidade.</span>
            </h1>

            <p className="max-w-lg text-base leading-relaxed text-mute sm:text-lg">
              Camisas oficiais, equipamentos e acessórios selecionados para quem
              leva esporte a sério — qualidade editorial, catálogo curado.
            </p>

            {/* CTAs — DS §9.1 pill primary + outline secondary */}
            <div className="flex flex-col gap-3 pt-2 sm:flex-row sm:gap-4">
              <Link
                href="/products"
                className={getButtonClassName('default', 'lg', 'w-full sm:w-auto')}
              >
                Explorar Produtos
              </Link>
              <Link
                href="/products"
                className={getButtonClassName('outline', 'lg', 'w-full sm:w-auto')}
              >
                Coleções
              </Link>
            </div>

            {/* Trust — DS §8 hairline divider, flat */}
            <div className="border-t border-hairline pt-4 text-sm text-mute">
              Produtos originais · Envio rápido · Garantia de qualidade
            </div>
          </div>
        </div>

        {/* Categories — DS §7 pills; §8 flat chips, no blur/backdrop */}
        <div className="mt-16 sm:mt-20">
          <h2 className="mb-6 text-center text-sm font-semibold uppercase tracking-[0.15em] text-mute sm:mb-8">
            Categorias populares
          </h2>
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 sm:gap-4 lg:grid-cols-5">
            {siteConfig.categories.map((category) => (
              <Link
                key={category}
                href={`/products?category=${encodeURIComponent(category)}`}
                className={getButtonClassName(
                  'secondary',
                  'sm',
                  'w-full justify-center'
                )}
              >
                {category}
              </Link>
            ))}
          </div>
        </div>
      </div>
    </section>
  )
}
