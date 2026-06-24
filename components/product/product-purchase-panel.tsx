'use client'

import Image from 'next/image'
import Link from 'next/link'
import { useState } from 'react'
import { useCart } from '@/context/cart-context'
import { formatPrice } from '@/lib/formatters'
import {
  findDefaultVariation,
  resolveVariationBySelection,
} from '@/lib/cart-utils'
import { Product } from '@/types/product'
import { Button } from '@/components/ui/button'

interface ProductPurchasePanelProps {
  product: Product
}

export function ProductPurchasePanel({ product }: ProductPurchasePanelProps) {
  const { addItem } = useCart()
  const [selectedSize, setSelectedSize] = useState<string | undefined>(
    () => findDefaultVariation(product)?.size
  )
  const [selectedColor, setSelectedColor] = useState<string | undefined>(
    () => findDefaultVariation(product)?.color
  )
  const [addedFeedback, setAddedFeedback] = useState(false)

  const sizes = Array.from(
    new Set(product.variations.map((v) => v.size).filter(Boolean))
  ) as string[]
  const colors = Array.from(
    new Set(product.variations.map((v) => v.color).filter(Boolean))
  ) as string[]

  const selectedVariation = resolveVariationBySelection(
    product,
    selectedSize,
    selectedColor
  )
  const hasStock = product.variations.some((v) => v.stock > 0)
  const canAdd = hasStock && selectedVariation && selectedVariation.stock > 0

  function handleAddToCart() {
    if (!selectedVariation) return
    addItem(product.id, selectedVariation.id, 1)
    setAddedFeedback(true)
    window.setTimeout(() => setAddedFeedback(false), 2000)
  }

  return (
    <>
      <div className="space-y-4">
        {sizes.length > 0 && (
          <div>
            <h3 className="font-semibold mb-3">Tamanho</h3>
            <div className="flex flex-wrap gap-2">
              {sizes.map((size) => (
                <button
                  key={size}
                  type="button"
                  onClick={() => setSelectedSize(size)}
                  className={`px-4 py-2 border rounded-lg transition-colors ${
                    selectedSize === size
                      ? 'border-black bg-black text-white'
                      : 'border-gray-300 hover:border-black'
                  }`}
                >
                  {size}
                </button>
              ))}
            </div>
          </div>
        )}

        {colors.length > 0 && (
          <div>
            <h3 className="font-semibold mb-3">Cor</h3>
            <div className="flex flex-wrap gap-2">
              {colors.map((color) => (
                <button
                  key={color}
                  type="button"
                  onClick={() => setSelectedColor(color)}
                  className={`px-4 py-2 border rounded-lg transition-colors ${
                    selectedColor === color
                      ? 'border-black bg-black text-white'
                      : 'border-gray-300 hover:border-black'
                  }`}
                >
                  {color}
                </button>
              ))}
            </div>
          </div>
        )}
      </div>

      <div className="flex gap-3 pt-6">
        <Button
          size="lg"
          className="flex-1"
          disabled={!canAdd}
          onClick={handleAddToCart}
        >
          {addedFeedback
            ? 'Adicionado!'
            : hasStock
              ? 'Adicionar ao Carrinho'
              : 'Fora de estoque'}
        </Button>
        <Button size="lg" variant="outline" title="Wishlist em breve" disabled>
          ♡
        </Button>
      </div>

      {canAdd && (
        <p className="text-sm text-gray-600 pt-2">
          {selectedVariation!.stock} unidade(s) disponível(is) para esta opção
        </p>
      )}
    </>
  )
}
