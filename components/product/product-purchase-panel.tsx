'use client'

import { useState } from 'react'
import { useCart } from '@/context/cart-context'
import {
  findDefaultVariation,
  resolveVariationBySelection,
} from '@/lib/cart-utils'
import { colorNameToHex, colorSwatchBorderClass } from '@/lib/colors'
import { Product } from '@/types/product'
import { Button } from '@/components/ui/button'

interface ProductPurchasePanelProps {
  product: Product
}

const optionBase =
  'inline-flex min-h-11 min-w-11 items-center justify-center rounded-full border px-4 py-2 text-sm font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-ink focus:ring-offset-2'

function optionClass(selected: boolean): string {
  return selected
    ? `${optionBase} border-ink bg-ink text-canvas`
    : `${optionBase} border-hairline bg-canvas text-ink hover:border-charcoal`
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
    <div className="space-y-6 border-t border-hairline pt-6">
      {sizes.length > 0 && (
        <fieldset className="space-y-3">
          <legend className="text-sm font-semibold uppercase tracking-wide text-ink">
            Tamanho
          </legend>
          <div className="flex flex-wrap gap-2">
            {sizes.map((size) => (
              <button
                key={size}
                type="button"
                aria-pressed={selectedSize === size}
                onClick={() => setSelectedSize(size)}
                className={optionClass(selectedSize === size)}
              >
                {size}
              </button>
            ))}
          </div>
        </fieldset>
      )}

      {colors.length > 0 && (
        <fieldset className="space-y-3">
          <legend className="text-sm font-semibold uppercase tracking-wide text-ink">
            Cor
          </legend>
          <div className="flex flex-wrap gap-2">
            {colors.map((color) => (
              <button
                key={color}
                type="button"
                aria-pressed={selectedColor === color}
                onClick={() => setSelectedColor(color)}
                className={`${optionClass(selectedColor === color)} gap-2`}
              >
                <span
                  className={`h-3.5 w-3.5 shrink-0 rounded-full border ${colorSwatchBorderClass(color)}`}
                  style={{ backgroundColor: colorNameToHex(color) }}
                  aria-hidden
                />
                {color}
              </button>
            ))}
          </div>
        </fieldset>
      )}

      <div className="space-y-3 pt-2">
        <div className="flex gap-3">
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

        {addedFeedback && (
          <p className="text-sm font-medium text-success" role="status">
            Produto adicionado ao carrinho.
          </p>
        )}

        {canAdd && !addedFeedback && (
          <p className="text-sm text-mute">
            {selectedVariation!.stock} unidade(s) disponível(is) para esta opção
          </p>
        )}
      </div>
    </div>
  )
}
