import { SportsHero } from '@/components/commerce/sports-hero'
import { ProductCard } from '@/components/product/product-card'
import { getFeaturedProducts } from '@/lib/products'

export default function Home() {
  const featuredProducts = getFeaturedProducts(6)

  return (
    <div className="w-full">
      <SportsHero />

      {/* Featured — DS §5 PLP grid; §6 section rhythm py-12 sm:py-16 */}
      <section className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-12 sm:py-16">
        <header className="mb-8 space-y-2 sm:mb-12">
          <p className="text-xs font-semibold uppercase tracking-[0.15em] text-mute">
            Seleção curada
          </p>
          <h2 className="text-2xl font-bold tracking-tight text-ink sm:text-3xl">
            Produtos em destaque
          </h2>
          <p className="max-w-xl text-mute">
            Peças esportivas premium escolhidas para performance e autenticidade.
          </p>
        </header>

        <div className="grid grid-cols-2 gap-4 md:grid-cols-3 md:gap-6 lg:grid-cols-3">
          {featuredProducts.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      </section>

      {/* Trust — DS §8 flat; soft-cloud surface, no decorative shadow */}
      <section className="border-t border-hairline bg-soft-cloud py-12 sm:py-16">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 gap-10 sm:grid-cols-3 sm:gap-8">
            <div>
              <h3 className="mb-2 text-sm font-semibold uppercase tracking-wide text-ink">
                Envio rápido
              </h3>
              <p className="text-sm leading-relaxed text-mute">
                Entrega em até 5 dias úteis em todo o Brasil.
              </p>
            </div>
            <div>
              <h3 className="mb-2 text-sm font-semibold uppercase tracking-wide text-ink">
                Produtos originais
              </h3>
              <p className="text-sm leading-relaxed text-mute">
                100% autênticos com garantia de qualidade.
              </p>
            </div>
            <div>
              <h3 className="mb-2 text-sm font-semibold uppercase tracking-wide text-ink">
                Suporte dedicado
              </h3>
              <p className="text-sm leading-relaxed text-mute">
                Atendimento quando você precisar.
              </p>
            </div>
          </div>
        </div>
      </section>
    </div>
  )
}
