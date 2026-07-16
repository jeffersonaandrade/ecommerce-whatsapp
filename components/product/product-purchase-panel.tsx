'use client'

import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { useSearchParams } from 'next/navigation'
import { useCart, useProductPersonalizationPrice } from '@/context/cart-context'
import { hasPersonalizationAddons } from '@/lib/personalization/validate-personalization'
import {
  FROM_CART_PARAM,
  shouldReplaceUnpersonalizedCartLine,
} from '@/lib/cart/personalization-shortcut'
import {
  findDefaultVariation,
  findVariation,
  resolveVariationBySelection,
} from '@/lib/cart-utils'
import { sortSizes } from '@/lib/catalog/size-order'
import { colorNameToHex, colorSwatchBorderClass } from '@/lib/colors'
import { Product } from '@/types/product'
import { Button } from '@/components/ui/button'
import { ProductAddonsFields } from '@/components/product/product-addons-fields'
import { PersonalizationAddon } from '@/types/cart-addons'

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
  const searchParams = useSearchParams()
  const { addItem, removeItem, updateQuantity, items, personalizationSettings } =
    useCart()
  const personalizationUnitPrice = useProductPersonalizationPrice(product)
  const personalizationRef = useRef<HTMLDivElement>(null)

  const personalizarIntent = searchParams.get('personalizar') === '1'
  const fromCartIntent = searchParams.get(FROM_CART_PARAM) === '1'
  const variationParam = searchParams.get('variation')?.trim() ?? ''

  const presetVariation = useMemo(() => {
    if (!variationParam) return undefined
    const variation = findVariation(product, variationParam)
    if (!variation || variation.stock <= 0) return undefined
    return variation
  }, [product, variationParam])

  const [selectedSize, setSelectedSize] = useState<string | undefined>(
    () => presetVariation?.size ?? findDefaultVariation(product)?.size
  )
  const [selectedColor, setSelectedColor] = useState<string | undefined>(
    () => presetVariation?.color ?? findDefaultVariation(product)?.color
  )
  const [addedFeedback, setAddedFeedback] = useState(false)
  const [addonEnabled, setAddonEnabled] = useState(
    () => personalizarIntent && personalizationSettings.enabled && product.personalizationEnabled
  )
  const [personalization, setPersonalization] = useState<PersonalizationAddon | null>(null)
  const [addonError, setAddonError] = useState<string | null>(null)

  const showPersonalization =
    personalizationSettings.enabled && product.personalizationEnabled
  const openPersonalizationOnLoad = personalizarIntent && showPersonalization

  useEffect(() => {
    if (!presetVariation) return
    if (presetVariation.size) setSelectedSize(presetVariation.size)
    if (presetVariation.color) setSelectedColor(presetVariation.color)
  }, [presetVariation])

  useEffect(() => {
    if (!openPersonalizationOnLoad) return
    setAddonEnabled(true)
    personalizationRef.current?.scrollIntoView({ behavior: 'smooth', block: 'center' })
  }, [openPersonalizationOnLoad])

  const sizes = sortSizes(
    Array.from(new Set(product.variations.map((v) => v.size).filter(Boolean))) as string[]
  )
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

  const handleAddonsChange = useCallback(
    (enabled: boolean, addon: PersonalizationAddon | null) => {
      setAddonEnabled(enabled)
      setPersonalization(addon)
      setAddonError(null)
    },
    []
  )

  function handleAddToCart() {
    if (!selectedVariation) return

    const addons =
      addonEnabled && personalization
        ? { personalization }
        : undefined

    if (
      shouldReplaceUnpersonalizedCartLine({
        fromCartIntent,
        personalizarIntent,
        hasPersonalization: hasPersonalizationAddons(addons),
      })
    ) {
      const unpersonalizedLine = items.find(
        (item) =>
          item.productId === product.id &&
          item.variationId === selectedVariation.id &&
          !hasPersonalizationAddons(item.addons)
      )

      if (unpersonalizedLine) {
        if (unpersonalizedLine.quantity <= 1) {
          removeItem(product.id, selectedVariation.id, undefined)
        } else {
          updateQuantity(
            product.id,
            selectedVariation.id,
            unpersonalizedLine.quantity - 1,
            undefined
          )
        }
      }
    }

    const error = addItem(product.id, selectedVariation.id, 1, addons)
    if (error) {
      setAddonError(error)
      return
    }

    setAddonError(null)
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

      {showPersonalization && (
        <div ref={personalizationRef}>
          <ProductAddonsFields
            settings={personalizationSettings}
            unitPrice={personalizationUnitPrice}
            initialEnabled={openPersonalizationOnLoad}
            onChange={handleAddonsChange}
            error={addonError}
          />
        </div>
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
