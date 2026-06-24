import { SportsHero } from '@/components/commerce/sports-hero'
import { ProductCard } from '@/components/product/product-card'
import { getFeaturedProducts } from '@/lib/products'

export default function Home() {
  const featuredProducts = getFeaturedProducts(6)

  return (
    <div className="w-full">
      {/* Hero Section */}
      <SportsHero />

      {/* Featured Products Section */}
      <section className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-16 sm:py-20">
        <div className="mb-12">
          <h2 className="text-3xl sm:text-4xl font-bold mb-2">Produtos em Destaque</h2>
          <p className="text-gray-600">Confira nossa seleção de produtos esportivos premium</p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {featuredProducts.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      </section>

      {/* Trust Section */}
      <section className="bg-gray-50 py-16 sm:py-20">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-8">
            <div className="text-center">
              <div className="text-4xl mb-3">🚚</div>
              <h3 className="font-semibold text-lg mb-2">Envio Rápido</h3>
              <p className="text-gray-600 text-sm">
                Entrega em até 5 dias úteis em todo Brasil
              </p>
            </div>
            <div className="text-center">
              <div className="text-4xl mb-3">✅</div>
              <h3 className="font-semibold text-lg mb-2">Produtos Originais</h3>
              <p className="text-gray-600 text-sm">
                100% autênticos com garantia de qualidade
              </p>
            </div>
            <div className="text-center">
              <div className="text-4xl mb-3">💬</div>
              <h3 className="font-semibold text-lg mb-2">Suporte 24/7</h3>
              <p className="text-gray-600 text-sm">
                Estamos aqui para ajudar sempre que precisar
              </p>
            </div>
          </div>
        </div>
      </section>
    </div>
  )
}
