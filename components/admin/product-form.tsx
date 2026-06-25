'use client'

import { useState, useTransition } from 'react'
import { useRouter } from 'next/navigation'
import { Product, ProductStatus } from '@/types/product'
import { Button } from '@/components/ui/button'
import { ImageGalleryField } from '@/components/admin/image-gallery-field'
import { isSupabaseAuthMode } from '@/lib/auth/mode'
import {
  createProductAction,
  updateProductAction,
  type ProductFormPayload,
} from '@/lib/catalog/actions'

type VariationRow = {
  id?: string
  size: string
  color: string
  sku: string
  stock: string
}

type ProductFormProps = {
  mode: 'create' | 'edit'
  product?: Product
  categories: string[]
}

const emptyVariation = (): VariationRow => ({
  size: '',
  color: '',
  sku: '',
  stock: '0',
})

function productToForm(product: Product) {
  return {
    name: product.name,
    slug: product.slug,
    shortDescription: product.shortDescription,
    longDescription: product.longDescription,
    price: String(product.price),
    promotionalPrice: product.promotionalPrice
      ? String(product.promotionalPrice)
      : '',
    category: product.category,
    club: product.club ?? '',
    status: product.status,
    images: [...product.images],
    variations: product.variations.map((v) => ({
      id: v.id,
      size: v.size ?? '',
      color: v.color ?? '',
      sku: v.sku,
      stock: String(v.stock),
    })),
  }
}

export function ProductForm({ mode, product, categories }: ProductFormProps) {
  const router = useRouter()
  const [isPending, startTransition] = useTransition()
  const initial = product
    ? productToForm(product)
    : {
        name: '',
        slug: '',
        shortDescription: '',
        longDescription: '',
        price: '',
        promotionalPrice: '',
        category: categories[0] ?? '',
        club: '',
        status: 'draft' as ProductStatus,
        images: [] as string[],
        variations: [emptyVariation()],
      }

  const [name, setName] = useState(initial.name)
  const [slug, setSlug] = useState(initial.slug)
  const [shortDescription, setShortDescription] = useState(initial.shortDescription)
  const [longDescription, setLongDescription] = useState(initial.longDescription)
  const [price, setPrice] = useState(initial.price)
  const [promotionalPrice, setPromotionalPrice] = useState(initial.promotionalPrice)
  const [category, setCategory] = useState(initial.category)
  const [club, setClub] = useState(initial.club)
  const [status, setStatus] = useState<ProductStatus>(initial.status)
  const [images, setImages] = useState<string[]>(initial.images)
  const [variations, setVariations] = useState<VariationRow[]>(initial.variations)
  const [errors, setErrors] = useState<string[]>([])
  const [success, setSuccess] = useState(false)

  function updateVariation(index: number, patch: Partial<VariationRow>) {
    setVariations((rows) =>
      rows.map((row, i) => (i === index ? { ...row, ...patch } : row))
    )
  }

  function buildPayload(): ProductFormPayload {
    return {
      name,
      slug: slug.trim() || undefined,
      shortDescription: shortDescription.trim() || undefined,
      longDescription,
      price: parseFloat(price) || 0,
      promotionalPrice: promotionalPrice
        ? parseFloat(promotionalPrice)
        : null,
      category,
      club: club.trim() || undefined,
      images,
      variations: variations.map((v) => ({
        id: v.id,
        size: v.size || undefined,
        color: v.color || undefined,
        sku: v.sku,
        stock: parseInt(v.stock, 10) || 0,
      })),
      status,
    }
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setErrors([])
    setSuccess(false)
    const payload = buildPayload()

    startTransition(async () => {
      if (mode === 'create') {
        const result = await createProductAction(payload)
        if (!result.ok) setErrors(result.errors)
      } else if (product) {
        const result = await updateProductAction(product.id, payload)
        if (result.ok) {
          setSuccess(true)
          router.refresh()
        } else {
          setErrors(result.errors)
        }
      }
    })
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-8">
      {errors.length > 0 && (
        <div className="rounded-lg border border-red-200 bg-red-50 p-4 text-sm text-red-800 space-y-1">
          {errors.map((msg) => (
            <p key={msg}>{msg}</p>
          ))}
        </div>
      )}

      {success && (
        <div className="rounded-lg border border-green-200 bg-green-50 p-4 text-sm text-green-800">
          Produto salvo com sucesso.
        </div>
      )}

      <section className="space-y-4">
        <h2 className="text-lg font-semibold">Informações básicas</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <label className="block space-y-1">
            <span className="text-sm font-medium text-gray-700">Nome *</span>
            <input
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm"
            />
          </label>
          <label className="block space-y-1">
            <span className="text-sm font-medium text-gray-700">
              Slug (opcional)
            </span>
            <input
              value={slug}
              onChange={(e) => setSlug(e.target.value)}
              placeholder="gerado automaticamente"
              className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm"
            />
          </label>
          <label className="block space-y-1">
            <span className="text-sm font-medium text-gray-700">Categoria *</span>
            <input
              required
              list="category-suggestions"
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm"
            />
            <datalist id="category-suggestions">
              {categories.map((c) => (
                <option key={c} value={c} />
              ))}
            </datalist>
          </label>
          <label className="block space-y-1">
            <span className="text-sm font-medium text-gray-700">Clube / Marca</span>
            <input
              value={club}
              onChange={(e) => setClub(e.target.value)}
              className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm"
            />
          </label>
          <label className="block space-y-1">
            <span className="text-sm font-medium text-gray-700">Preço *</span>
            <input
              required
              type="number"
              min="0"
              step="0.01"
              value={price}
              onChange={(e) => setPrice(e.target.value)}
              className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm"
            />
          </label>
          <label className="block space-y-1">
            <span className="text-sm font-medium text-gray-700">
              Preço promocional
            </span>
            <input
              type="number"
              min="0"
              step="0.01"
              value={promotionalPrice}
              onChange={(e) => setPromotionalPrice(e.target.value)}
              className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm"
            />
          </label>
          <label className="block space-y-1 sm:col-span-2">
            <span className="text-sm font-medium text-gray-700">Status</span>
            <select
              value={status}
              onChange={(e) => setStatus(e.target.value as ProductStatus)}
              className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm"
            >
              <option value="draft">Rascunho</option>
              <option value="active">Ativo</option>
              <option value="unavailable">Indisponível</option>
            </select>
          </label>
        </div>

        <label className="block space-y-1">
          <span className="text-sm font-medium text-gray-700">
            Descrição curta (opcional)
          </span>
          <input
            value={shortDescription}
            onChange={(e) => setShortDescription(e.target.value)}
            className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm"
          />
        </label>

        <label className="block space-y-1">
          <span className="text-sm font-medium text-gray-700">Descrição *</span>
          <textarea
            required
            rows={4}
            value={longDescription}
            onChange={(e) => setLongDescription(e.target.value)}
            className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm"
          />
        </label>
      </section>

      <section className="space-y-3">
        <h2 className="text-lg font-semibold">Galeria de imagens</h2>
        <p className="text-sm text-gray-500">
          Ao menos 1 imagem (máximo 5). Use URL externa ou envie arquivo (Supabase).
        </p>
        <ImageGalleryField
          images={images}
          onChange={setImages}
          productSlug={slug}
          uploadEnabled={isSupabaseAuthMode()}
        />
      </section>

      <section className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-semibold">Variações</h2>
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => setVariations((rows) => [...rows, emptyVariation()])}
          >
            + Variação
          </Button>
        </div>

        <div className="space-y-3">
          {variations.map((row, index) => (
            <div
              key={row.id ?? `new-${index}`}
              className="grid grid-cols-2 sm:grid-cols-5 gap-2 items-end border border-gray-100 rounded-lg p-3"
            >
              <label className="block space-y-1">
                <span className="text-xs text-gray-600">Tamanho</span>
                <input
                  value={row.size}
                  onChange={(e) => updateVariation(index, { size: e.target.value })}
                  className="w-full rounded border border-gray-300 px-2 py-1.5 text-sm"
                />
              </label>
              <label className="block space-y-1">
                <span className="text-xs text-gray-600">Cor</span>
                <input
                  value={row.color}
                  onChange={(e) => updateVariation(index, { color: e.target.value })}
                  className="w-full rounded border border-gray-300 px-2 py-1.5 text-sm"
                />
              </label>
              <label className="block space-y-1">
                <span className="text-xs text-gray-600">SKU *</span>
                <input
                  required
                  value={row.sku}
                  onChange={(e) => updateVariation(index, { sku: e.target.value })}
                  className="w-full rounded border border-gray-300 px-2 py-1.5 text-sm"
                />
              </label>
              <label className="block space-y-1">
                <span className="text-xs text-gray-600">Estoque</span>
                <input
                  type="number"
                  min="0"
                  value={row.stock}
                  onChange={(e) => updateVariation(index, { stock: e.target.value })}
                  className="w-full rounded border border-gray-300 px-2 py-1.5 text-sm"
                />
              </label>
              <Button
                type="button"
                variant="outline"
                size="sm"
                disabled={variations.length === 1}
                onClick={() =>
                  setVariations((rows) => rows.filter((_, i) => i !== index))
                }
              >
                Remover
              </Button>
            </div>
          ))}
        </div>
      </section>

      <div className="flex gap-3 pt-4 border-t">
        <Button type="submit" disabled={isPending}>
          {isPending
            ? 'Salvando...'
            : mode === 'create'
              ? 'Criar produto'
              : 'Salvar alterações'}
        </Button>
      </div>
    </form>
  )
}
