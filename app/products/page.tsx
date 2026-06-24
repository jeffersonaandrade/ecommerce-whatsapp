import { Metadata } from 'next'
import { ProductCard } from '@/components/product/product-card'
import { getAllProducts, getProductsByCategory } from '@/lib/products'

export const metadata: Metadata = {
  title: 'Produtos',
  description: 'Confira nossa seleção completa de produtos esportivos',
}

interface ProductsPageProps {
  searchParams: Promise<{ category?: string }>
}

export default async function ProductsPage({ searchParams }: ProductsPageProps) {
  const { category } = await searchParams

  const filteredProducts = category
    ? getProductsByCategory(category)
    : getAllProducts()

  return (
    <div className="w-full">
      {/* Header */}
      <div className="bg-gray-50 border-b border-gray-200 py-8 sm:py-12">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <h1 className="text-3xl sm:text-4xl font-bold">
            {category ? `${category}` : 'Todos os Produtos'}
          </h1>
          <p className="text-gray-600 mt-2">
            {filteredProducts.length} produtos disponíveis
          </p>
        </div>
      </div>

      {/* Products Grid */}
      <section className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-12 sm:py-16">
        {filteredProducts.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredProducts.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        ) : (
          <div className="text-center py-16">
            <p className="text-gray-600 text-lg">
              Nenhum produto encontrado nesta categoria.
            </p>
          </div>
        )}
      </section>
    </div>
  )
}
