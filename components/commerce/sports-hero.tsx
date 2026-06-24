import Link from 'next/link'
import { getButtonClassName } from '@/components/ui/button'

export function SportsHero() {
  return (
    <section className="relative overflow-hidden bg-gradient-to-br from-black via-gray-900 to-black text-white">
      {/* Background Pattern */}
      <div className="absolute inset-0 opacity-10">
        <div className="absolute top-0 left-0 w-96 h-96 bg-white rounded-full mix-blend-multiply filter blur-3xl" />
        <div className="absolute bottom-0 right-0 w-96 h-96 bg-gray-400 rounded-full mix-blend-multiply filter blur-3xl" />
      </div>

      <div className="relative z-10 mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-16 sm:py-24 lg:py-32">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12 items-center">
          {/* Content */}
          <div className="space-y-6 sm:space-y-8">
            {/* Eyebrow */}
            <div className="text-sm sm:text-base font-semibold text-gray-300 uppercase tracking-wider">
              Equipamento Esportivo Premium
            </div>

            {/* Headline */}
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold leading-tight">
              Sua Paixão, Nosso Compromisso
            </h1>

            {/* Subheadline */}
            <p className="text-lg sm:text-xl text-gray-300 max-w-lg">
              Camisas oficiais, equipamentos premium e acessórios para apaixonados por esporte.
              Qualidade, autenticidade e estilo em cada produto.
            </p>

            {/* CTA Buttons */}
            <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 pt-4">
              <Link
                href="/products"
                className={getButtonClassName(
                  'default',
                  'lg',
                  'w-full sm:w-auto bg-white text-black font-semibold hover:bg-gray-50 shadow-lg focus:ring-white'
                )}
              >
                Explorar Produtos
              </Link>
              <Link
                href="/products"
                className="w-full sm:w-auto inline-flex items-center justify-center px-6 py-3 border-2 border-white text-white font-medium rounded-lg hover:bg-white/20 transition-colors"
              >
                Coleções
              </Link>
            </div>

            {/* Trust Signal */}
            <div className="pt-4 border-t border-gray-700 text-sm text-gray-400">
              ✓ Produtos 100% Originais • ✓ Envio Rápido • ✓ Garantia de Qualidade
            </div>
          </div>

          {/* Visual - Sports Illustration */}
          <div className="relative hidden lg:block">
            <div className="relative w-full aspect-square bg-gradient-to-br from-gray-800 to-gray-900 rounded-2xl overflow-hidden">
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="text-center space-y-4 opacity-75">
                  <div className="text-6xl">⚽</div>
                  <div className="text-6xl">👟</div>
                  <div className="text-6xl">🏆</div>
                  <p className="text-gray-400 text-sm mt-4">
                    Imagem representativa
                  </p>
                </div>
              </div>
            </div>

            {/* Floating Cards */}
            <div className="absolute -bottom-6 -left-6 bg-white text-black p-4 rounded-lg shadow-lg max-w-xs">
              <p className="font-semibold text-sm mb-1">Camisas Oficiais</p>
              <p className="text-xs text-gray-600">De clubes e seleções</p>
            </div>

            <div className="absolute -top-6 -right-6 bg-white text-black p-4 rounded-lg shadow-lg max-w-xs">
              <p className="font-semibold text-sm mb-1">Melhor Preço</p>
              <p className="text-xs text-gray-600">Promoções exclusivas</p>
            </div>
          </div>
        </div>

        {/* Categories Grid */}
        <div className="mt-16 sm:mt-20 lg:mt-24">
          <h2 className="text-2xl sm:text-3xl font-bold mb-8 text-center">
            Categorias Populares
          </h2>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3 sm:gap-4">
            {[
              { name: 'Camisas', emoji: '👕' },
              { name: 'Shorts', emoji: '🩳' },
              { name: 'Jaquetas', emoji: '🧥' },
              { name: 'Meias', emoji: '🧦' },
              { name: 'Acessórios', emoji: '⌚' },
            ].map((category) => (
              <Link
                key={category.name}
                href={`/products?category=${category.name}`}
                className="group"
              >
                <div className="bg-white/10 backdrop-blur-sm hover:bg-white/20 rounded-lg p-4 text-center transition-colors cursor-pointer">
                  <div className="text-3xl mb-2">{category.emoji}</div>
                  <p className="font-medium text-sm">{category.name}</p>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </div>
    </section>
  )
}
