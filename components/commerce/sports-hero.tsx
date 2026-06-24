import Image from 'next/image'
import Link from 'next/link'
import { ProductCard } from '@/components/product/product-card'
import { getButtonClassName } from '@/components/ui/button'
import { Product } from '@/types/product'

const HERO_IMAGE =
  'https://images.unsplash.com/photo-1461896836934-ffe607ba8211?w=1600&h=2000&fit=crop'

interface SportsHeroProps {
  featuredProducts: Product[]
}

export function SportsHero({ featuredProducts }: SportsHeroProps) {
  return (
    <section className="w-full">
      {/* Campaign — DS §2 photography-first; overlay flat for legibility only */}
      <div className="relative flex min-h-[75vh] flex-col justify-end lg:min-h-[88vh]">
        <Image
          src={HERO_IMAGE}
          alt="Equipamento esportivo premium"
          fill
          className="object-cover object-center"
          sizes="100vw"
          priority
        />
        <div
          className="absolute inset-0 bg-gradient-to-t from-ink/80 via-ink/45 to-ink/25"
          aria-hidden
        />

        <div className="relative z-10 mx-auto w-full max-w-7xl px-4 pb-10 pt-24 sm:px-6 sm:pb-14 lg:px-8 lg:pb-16">
          <p className="mb-3 text-xs font-semibold uppercase tracking-[0.25em] text-canvas/80 sm:text-sm">
            Sports Store
          </p>
          <h1 className="max-w-3xl font-display text-4xl font-bold uppercase leading-[0.95] tracking-tight text-canvas sm:text-5xl lg:text-6xl xl:text-7xl">
            Vista o jogo
            <span className="block text-canvas/90">Com autenticidade</span>
          </h1>
          <p className="mt-4 max-w-lg text-base leading-relaxed text-canvas/85 sm:text-lg">
            Equipamento esportivo premium selecionado para quem leva performance a
            sério.
          </p>
          <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:gap-4">
            <Link
              href="/products"
              className={getButtonClassName('default', 'lg', 'w-full sm:w-auto')}
            >
              Explorar produtos
            </Link>
            <Link
              href="/products"
              className={getButtonClassName(
                'outline',
                'lg',
                'w-full border-canvas/60 text-canvas hover:bg-canvas/10 sm:w-auto'
              )}
            >
              Coleções
            </Link>
          </div>
        </div>
      </div>

      {/* Featured strip — hero conversa com a vitrine */}
      {featuredProducts.length > 0 && (
        <div className="border-b border-hairline bg-canvas">
          <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 sm:py-12 lg:px-8">
            <div className="mb-6 flex items-end justify-between gap-4 sm:mb-8">
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.15em] text-mute">
                  Curadoria
                </p>
                <h2 className="mt-1 font-display text-2xl font-bold uppercase tracking-tight text-ink sm:text-3xl">
                  Favoritos da semana
                </h2>
              </div>
              <Link
                href="/products"
                className="hidden text-sm font-medium text-mute transition-colors hover:text-ink sm:inline"
              >
                Ver catálogo →
              </Link>
            </div>
            <div className="grid grid-cols-2 gap-4 md:grid-cols-4 md:gap-6">
              {featuredProducts.slice(0, 4).map((product) => (
                <ProductCard key={product.id} product={product} />
              ))}
            </div>
          </div>
        </div>
      )}
    </section>
  )
}
