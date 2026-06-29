'use client'

import { useEffect, useRef, useState, useTransition } from 'react'
import { useRouter } from 'next/navigation'
import { Product, ProductStatus } from '@/types/product'
import { Category } from '@/types/category'
import { Alert } from '@/components/ui/alert'
import { Button } from '@/components/ui/button'
import { ImageGalleryField } from '@/components/admin/image-gallery-field'
import { CategoryTreePicker } from '@/components/admin/category-tree-picker'
import { MoneyInput, type MoneyInputHandle } from '@/components/admin/money-input'
import { isSupabaseAuthMode } from '@/lib/auth/mode'
import { isLeafCategory } from '@/lib/catalog/category-tree'
import {
  defaultCategorySlug,
  resolveProductCategorySelectValue,
} from '@/lib/catalog/category-utils'
import {
  createProductAction,
  updateProductAction,
  type ProductFormPayload,
} from '@/lib/catalog/actions'
import {
  errorsToFieldMap,
  formatProductValidationError,
  normalizeProductErrors,
} from '@/lib/catalog/product-form-errors'
import { getStorefrontVisibility } from '@/lib/catalog/storefront-visibility'
import { validateProductInput } from '@/lib/catalog/product-utils'
import { ProductInput } from '@/lib/catalog/product-repository'

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
  categories: Category[]
}

const emptyVariation = (): VariationRow => ({
  size: '',
  color: '',
  sku: '',
  stock: '0',
})

function FieldError({ message }: { message?: string }) {
  if (!message) return null
  return <p className="text-xs text-red-600">{message}</p>
}

function visibilityBannerClass(tone: 'success' | 'warning' | 'info') {
  if (tone === 'success') return 'border-green-200 bg-green-50 text-green-900'
  if (tone === 'warning') return 'border-amber-200 bg-amber-50 text-amber-900'
  return 'border-blue-200 bg-blue-50 text-blue-900'
}

function productToForm(product: Product, categories: Category[]) {
  const resolvedId =
    product.categoryId ??
    categories.find(
      (c) =>
        c.slug === product.category ||
        c.name.trim().toLowerCase() === product.category.trim().toLowerCase()
    )?.id ??
    ''
  const categoryId = categories.some((c) => c.id === resolvedId) ? resolvedId : ''
  const categorySlug = categoryId
    ? (categories.find((c) => c.id === categoryId)?.slug ?? product.category)
    : resolveProductCategorySelectValue(product.category, categories)

  return {
    name: product.name,
    slug: product.slug,
    shortDescription: product.shortDescription,
    longDescription: product.longDescription,
    price: product.price,
    promotionalPrice: product.promotionalPrice ?? null,
    category: categorySlug,
    categoryId,
    club: product.club ?? '',
    status: product.status,
    personalizationEnabled: product.personalizationEnabled ?? false,
    personalizationPrice: product.personalizationPrice ?? null,
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
  const errorAlertRef = useRef<HTMLDivElement>(null)
  const priceInputRef = useRef<MoneyInputHandle>(null)
  const promotionalPriceInputRef = useRef<MoneyInputHandle>(null)
  const personalizationPriceInputRef = useRef<MoneyInputHandle>(null)
  const initial = product
    ? productToForm(product, categories)
    : {
        name: '',
        slug: '',
        shortDescription: '',
        longDescription: '',
        price: null as number | null,
        promotionalPrice: null as number | null,
        category: defaultCategorySlug(categories),
        categoryId:
          categories.find((c) => c.slug === defaultCategorySlug(categories))?.id ?? '',
        club: '',
        status: 'draft' as ProductStatus,
        personalizationEnabled: false,
        personalizationPrice: null as number | null,
        images: [] as string[],
        variations: [emptyVariation()],
      }

  const [name, setName] = useState(initial.name)
  const [slug, setSlug] = useState(initial.slug)
  const [shortDescription, setShortDescription] = useState(initial.shortDescription)
  const [longDescription, setLongDescription] = useState(initial.longDescription)
  const [price, setPrice] = useState<number | null>(initial.price)
  const [promotionalPrice, setPromotionalPrice] = useState<number | null>(
    initial.promotionalPrice
  )
  const [category, setCategory] = useState(initial.category)
  const [categoryId, setCategoryId] = useState(initial.categoryId)
  const [club, setClub] = useState(initial.club)
  const [status, setStatus] = useState<ProductStatus>(initial.status)
  const [personalizationEnabled, setPersonalizationEnabled] = useState(
    initial.personalizationEnabled
  )
  const [personalizationPrice, setPersonalizationPrice] = useState<number | null>(
    initial.personalizationPrice
  )
  const [images, setImages] = useState<string[]>(initial.images)
  const [variations, setVariations] = useState<VariationRow[]>(initial.variations)
  const [errors, setErrors] = useState<string[]>([])
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({})
  const [success, setSuccess] = useState(false)
  const [createCompleted, setCreateCompleted] = useState(false)

  const formLocked = isPending || createCompleted

  const storefrontVisibility = getStorefrontVisibility({
    status,
    name: name || product?.name || '',
    slug: slug || product?.slug || '',
    category,
    club: club || undefined,
  })

  function inputClass(field: string) {
    const base = 'w-full rounded-lg border px-3 py-2 text-sm'
    return fieldErrors[field]
      ? `${base} border-red-500 ring-1 ring-red-200`
      : `${base} border-hairline`
  }

  function applyValidationErrors(
    validationErrors: Array<{ field: string; message: string }>
  ) {
    const normalized = normalizeProductErrors(validationErrors)
    setFieldErrors(errorsToFieldMap(normalized))
    setErrors(normalized.map(formatProductValidationError))
  }

  useEffect(() => {
    if (errors.length === 0 && Object.keys(fieldErrors).length === 0) return
    const firstField = Object.keys(fieldErrors)[0]
    if (firstField && firstField !== 'form') {
      document
        .getElementById(`product-field-${firstField}`)
        ?.scrollIntoView?.({ behavior: 'smooth', block: 'center' })
    }
    const el = errorAlertRef.current
    if (!el) return
    el.scrollIntoView?.({ behavior: 'smooth', block: 'start' })
    el.focus?.({ preventScroll: true })
  }, [errors, fieldErrors])

  function updateVariation(index: number, patch: Partial<VariationRow>) {
    setVariations((rows) =>
      rows.map((row, i) => (i === index ? { ...row, ...patch } : row))
    )
  }

  function buildPayload(priceValue: number | null, promoValue: number | null): ProductFormPayload {
    return {
      name,
      slug: slug.trim() || undefined,
      shortDescription: shortDescription.trim() || undefined,
      longDescription,
      price: priceValue ?? 0,
      promotionalPrice: promoValue,
      category,
      categoryId: categoryId || null,
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
      personalizationEnabled,
      personalizationPrice,
    }
  }

  function payloadToInput(payload: ProductFormPayload): ProductInput {
    return {
      name: payload.name,
      slug: payload.slug,
      shortDescription: payload.shortDescription,
      longDescription: payload.longDescription,
      price: payload.price,
      promotionalPrice: payload.promotionalPrice ?? undefined,
      category: payload.category,
      categoryId: payload.categoryId ?? null,
      club: payload.club,
      images: payload.images,
      variations: payload.variations,
      status: payload.status,
      personalizationEnabled: payload.personalizationEnabled,
      personalizationPrice: payload.personalizationPrice ?? null,
    }
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (formLocked) return

    setErrors([])
    setFieldErrors({})
    setSuccess(false)

    const committedPrice = priceInputRef.current?.commit() ?? price
    const committedPromo = promotionalPriceInputRef.current?.commit() ?? promotionalPrice
    const committedPersoPrice =
      personalizationPriceInputRef.current?.commit() ?? personalizationPrice
    setPrice(committedPrice)
    setPromotionalPrice(committedPromo)
    setPersonalizationPrice(committedPersoPrice)

    if (committedPrice == null || committedPrice <= 0) {
      applyValidationErrors([
        { field: 'price', message: 'Informe o preço do produto (ex.: 129,90)' },
      ])
      return
    }

    const payload = buildPayload(committedPrice, committedPromo)
    payload.personalizationEnabled = personalizationEnabled
    payload.personalizationPrice = committedPersoPrice
    const clientErrors = validateProductInput(
      payloadToInput(payload),
      [],
      mode === 'edit' ? product?.id : undefined,
      categories
    )
    if (clientErrors.length > 0) {
      applyValidationErrors(clientErrors)
      return
    }

    startTransition(async () => {
      if (mode === 'create') {
        const result = await createProductAction(payload)
        if (result.ok) {
          setCreateCompleted(true)
          router.push(`/admin/products/${result.id}/edit?created=1`)
          return
        }
        applyValidationErrors(result.errors)
      } else if (product) {
        const result = await updateProductAction(product.id, payload)
        if (result.ok) {
          setSuccess(true)
          router.refresh()
        } else {
          applyValidationErrors(result.errors)
        }
      }
    })
  }

  return (
    <form onSubmit={handleSubmit} noValidate className="space-y-8">
      {mode === 'edit' && (
        <div
          className={`rounded-lg border p-4 text-sm ${visibilityBannerClass(storefrontVisibility.tone)}`}
          role="status"
        >
          <p className="font-semibold">{storefrontVisibility.title}</p>
          <p className="mt-1">{storefrontVisibility.detail}</p>
        </div>
      )}

      {errors.length > 0 && (
        <Alert
          ref={errorAlertRef}
          type="error"
          tabIndex={-1}
          className="space-y-1 outline-none focus:ring-2 focus:ring-error/30"
        >
          {errors.map((msg) => (
            <p key={msg}>{msg}</p>
          ))}
        </Alert>
      )}

      {success && <Alert type="success" message="Produto salvo com sucesso." />}

      <fieldset disabled={formLocked} className="space-y-8 min-w-0 border-0 p-0 m-0">
        <section className="space-y-4">
          <h2 className="text-lg font-semibold">Informações básicas</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <label className="block space-y-1">
              <span className="text-sm font-medium text-ink">Nome *</span>
              <input
                id="product-field-name"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                className={inputClass('name')}
              />
              <FieldError message={fieldErrors.name} />
            </label>
            <label className="block space-y-1">
              <span className="text-sm font-medium text-ink">
                Slug (opcional)
              </span>
              <input
                id="product-field-slug"
                value={slug}
                onChange={(e) => setSlug(e.target.value)}
                placeholder="gerado automaticamente"
                className={inputClass('slug')}
              />
              <FieldError message={fieldErrors.slug} />
            </label>
            <label className="block space-y-1">
              <span className="text-sm font-medium text-ink">Categoria *</span>
              <CategoryTreePicker
                id="product-field-category"
                categories={categories}
                value={categoryId}
                onChange={(id, slug) => {
                  setCategoryId(id)
                  setCategory(slug)
                }}
                required
                allowAnyNode
              />
              <p className="text-xs text-mute">
                Tipo do produto na loja (ex.: Camisas › Brasileiro › Santa Cruz). Clube/time vai em
                Clube / Marca.
              </p>
              {categoryId && !isLeafCategory(categories, categoryId) && (
                <p className="text-xs text-amber-700">
                  Recomendado: classificar em subcategoria folha quando possível.
                </p>
              )}
              <FieldError message={fieldErrors.category} />
            </label>
            <label className="block space-y-1">
              <span className="text-sm font-medium text-ink">Clube / Marca</span>
              <input
                id="product-field-club"
                value={club}
                onChange={(e) => setClub(e.target.value)}
                placeholder="Ex.: Santa Cruz, Seleção Brasileira"
                className={inputClass('club')}
              />
              <FieldError message={fieldErrors.club} />
            </label>
            <label className="block space-y-1">
              <span className="text-sm font-medium text-ink">Preço *</span>
              <MoneyInput
                ref={priceInputRef}
                id="product-field-price"
                required
                value={price}
                onChange={setPrice}
                aria-label="Preço"
                className={fieldErrors.price ? 'border-red-500 ring-1 ring-red-200' : undefined}
              />
              <FieldError message={fieldErrors.price} />
            </label>
            <label className="block space-y-1">
              <span className="text-sm font-medium text-ink">
                Preço promocional
              </span>
              <MoneyInput
                ref={promotionalPriceInputRef}
                id="product-field-promotionalPrice"
                value={promotionalPrice}
                onChange={setPromotionalPrice}
                aria-label="Preço promocional"
                className={
                  fieldErrors.promotionalPrice ? 'border-red-500 ring-1 ring-red-200' : undefined
                }
              />
              <FieldError message={fieldErrors.promotionalPrice} />
            </label>
            <div className="space-y-3 sm:col-span-2 rounded-lg border border-hairline p-4">
              <h3 className="text-sm font-semibold text-ink">Personalização de camisa</h3>
              <label className="flex items-center gap-2 text-sm text-ink">
                <input
                  type="checkbox"
                  checked={personalizationEnabled}
                  onChange={(e) => setPersonalizationEnabled(e.target.checked)}
                  className="h-4 w-4 rounded border-hairline"
                />
                Permitir nome e número neste produto
              </label>
              <label className="block space-y-1">
                <span className="text-sm font-medium text-ink">
                  Preço adicional de nome + número
                </span>
                <MoneyInput
                  ref={personalizationPriceInputRef}
                  id="product-field-personalizationPrice"
                  value={personalizationPrice}
                  onChange={setPersonalizationPrice}
                  aria-label="Preço adicional de nome e número"
                />
                <p className="text-xs text-mute">
                  Deixe vazio para usar o preço padrão configurado em Comercial → Personalização.
                </p>
              </label>
            </div>
            <label className="block space-y-1 sm:col-span-2">
              <span className="text-sm font-medium text-ink">Status</span>
              <select
                id="product-field-status"
                value={status}
                onChange={(e) => setStatus(e.target.value as ProductStatus)}
                className={`${inputClass('status')} bg-white`}
              >
                <option value="draft">Rascunho — só no admin, não aparece na loja</option>
                <option value="active">Ativo — visível na loja (/products)</option>
                <option value="unavailable">Indisponível — oculto na vitrine</option>
              </select>
              <FieldError message={fieldErrors.status} />
            </label>
          </div>

          <label className="block space-y-1">
            <span className="text-sm font-medium text-ink">
              Descrição curta (opcional)
            </span>
            <input
              value={shortDescription}
              onChange={(e) => setShortDescription(e.target.value)}
              className="w-full rounded-lg border border-hairline px-3 py-2 text-sm"
            />
          </label>

          <label className="block space-y-1">
            <span className="text-sm font-medium text-ink">Descrição *</span>
            <textarea
              id="product-field-longDescription"
              required
              rows={4}
              value={longDescription}
              onChange={(e) => setLongDescription(e.target.value)}
              className={inputClass('longDescription')}
            />
            <FieldError message={fieldErrors.longDescription} />
          </label>
        </section>

        <section id="product-field-images" className="space-y-3">
          <h2 className="text-lg font-semibold">Galeria de imagens</h2>
          <p className="text-sm text-mute">
            Ao menos 1 imagem (máximo 5). Use URL externa ou envie arquivo (Supabase).
            Defina a <strong>posição na loja</strong>: a 1 aparece em destaque; 2, 3… seguem na galeria.
          </p>
          <FieldError message={fieldErrors.images} />
          <ImageGalleryField
            images={images}
            onChange={setImages}
            productSlug={slug}
            uploadEnabled={isSupabaseAuthMode()}
          />
        </section>

        <section id="product-field-variations" className="space-y-4">
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
          <FieldError message={fieldErrors.variations} />

          <div className="space-y-3">
            {variations.map((row, index) => (
              <div
                key={row.id ?? `new-${index}`}
                className="grid grid-cols-2 sm:grid-cols-5 gap-2 items-end border border-hairline rounded-lg p-3"
              >
                <label className="block space-y-1">
                  <span className="text-xs text-mute">Tamanho</span>
                  <input
                    value={row.size}
                    onChange={(e) => updateVariation(index, { size: e.target.value })}
                    className="w-full rounded border border-hairline px-2 py-1.5 text-sm"
                  />
                </label>
                <label className="block space-y-1">
                  <span className="text-xs text-mute">Cor</span>
                  <input
                    value={row.color}
                    onChange={(e) => updateVariation(index, { color: e.target.value })}
                    className="w-full rounded border border-hairline px-2 py-1.5 text-sm"
                  />
                </label>
                <label className="block space-y-1">
                  <span className="text-xs text-mute">SKU *</span>
                  <input
                    required
                    value={row.sku}
                    onChange={(e) => updateVariation(index, { sku: e.target.value })}
                    className="w-full rounded border border-hairline px-2 py-1.5 text-sm"
                  />
                </label>
                <label className="block space-y-1">
                  <span className="text-xs text-mute">Estoque</span>
                  <input
                    type="number"
                    min="0"
                    value={row.stock}
                    onChange={(e) => updateVariation(index, { stock: e.target.value })}
                    className="w-full rounded border border-hairline px-2 py-1.5 text-sm"
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
      </fieldset>

      <div className="flex gap-3 pt-4 border-t">
        <Button type="submit" disabled={formLocked}>
          {isPending
            ? 'Salvando...'
            : createCompleted
              ? 'Redirecionando...'
              : mode === 'create'
                ? 'Criar produto'
                : 'Salvar alterações'}
        </Button>
      </div>
    </form>
  )
}
