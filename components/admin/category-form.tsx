'use client'

import { useEffect, useState, useTransition } from 'react'
import { useRouter } from 'next/navigation'
import { Category } from '@/types/category'
import { Alert } from '@/components/ui/alert'
import { Button } from '@/components/ui/button'
import { generateCategorySlug } from '@/lib/catalog/category-utils'
import {
  buildCategoryTree,
  flattenCategoryTree,
  formatCategoryOptionLabel,
  getDescendantIds,
  MAX_CATEGORY_DEPTH,
} from '@/lib/catalog/category-tree'
import {
  createCategoryAction,
  deleteCategoryAction,
  updateCategoryAction,
  uploadCategoryImageAction,
  removeCategoryImageAction,
  type CategoryFormPayload,
} from '@/lib/catalog/category-actions'
import { categoryImageUrl } from '@/lib/catalog/category-image-url'

type CategoryFormProps = {
  mode: 'create' | 'edit'
  category?: Category
  productCount?: number
  allCategories?: Category[]
}

function categoryToForm(category: Category) {
  return {
    name: category.name,
    slug: category.slug,
    description: category.description,
    sortOrder: String(category.sortOrder),
    visible: category.visible,
    parentId: category.parentId ?? '',
  }
}

export function CategoryForm({
  mode,
  category,
  productCount = 0,
  allCategories = [],
}: CategoryFormProps) {
  const router = useRouter()
  const [isPending, startTransition] = useTransition()
  const initial = category
    ? categoryToForm(category)
    : {
        name: '',
        slug: '',
        description: '',
        sortOrder: '0',
        visible: true,
        parentId: '',
      }

  const [name, setName] = useState(initial.name)
  const [slug, setSlug] = useState(initial.slug)
  const [slugTouched, setSlugTouched] = useState(mode === 'edit')
  const [description, setDescription] = useState(initial.description)
  const [sortOrder, setSortOrder] = useState(initial.sortOrder)
  const [visible, setVisible] = useState(initial.visible)
  const [parentId, setParentId] = useState(initial.parentId)
  const [errors, setErrors] = useState<string[]>([])
  const [success, setSuccess] = useState(false)
  const [deleteConfirm, setDeleteConfirm] = useState(false)
  const [imageFile, setImageFile] = useState<File | null>(null)
  const [isImagePending, startImageTransition] = useTransition()
  const [imageError, setImageError] = useState<string | null>(null)
  const [imageSuccess, setImageSuccess] = useState<string | null>(null)
  const [currentImagePath, setCurrentImagePath] = useState(category?.imagePath ?? null)
  const [imageVersion, setImageVersion] = useState(category?.updatedAt ?? '')

  useEffect(() => {
    setCurrentImagePath(category?.imagePath ?? null)
    if (category?.updatedAt) setImageVersion(category.updatedAt)
  }, [category?.imagePath, category?.updatedAt])

  function handleNameChange(value: string) {
    setName(value)
    if (!slugTouched) {
      setSlug(generateCategorySlug(value))
    }
  }

  function buildPayload(): CategoryFormPayload {
    return {
      name,
      slug: slug.trim() || undefined,
      description,
      sortOrder: parseInt(sortOrder, 10) || 0,
      visible,
      parentId: parentId || null,
    }
  }

  const excludeParentIds = new Set<string>()
  if (mode === 'edit' && category) {
    excludeParentIds.add(category.id)
    for (const id of getDescendantIds(allCategories, category.id)) {
      excludeParentIds.add(id)
    }
  }
  const parentOptions = flattenCategoryTree(buildCategoryTree(allCategories)).filter(
    (item) => !excludeParentIds.has(item.id) && item.depth < MAX_CATEGORY_DEPTH
  )

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setErrors([])
    setSuccess(false)
    const payload = buildPayload()

    startTransition(async () => {
      if (mode === 'create') {
        const result = await createCategoryAction(payload)
        if (result.ok) {
          router.push('/admin/categories')
          router.refresh()
        } else {
          setErrors(result.errors)
        }
      } else if (category) {
        const result = await updateCategoryAction(category.id, payload)
        if (result.ok) {
          setSuccess(true)
          router.refresh()
        } else {
          setErrors(result.errors)
        }
      }
    })
  }

  function handleImageUpload() {
    if (!category || !imageFile) return
    setImageError(null)
    setImageSuccess(null)
    startImageTransition(async () => {
      const formData = new FormData()
      formData.set('image', imageFile)
      const result = await uploadCategoryImageAction(category.id, formData)
      if (result.ok) {
        setCurrentImagePath(`categories/${category.id}.webp`)
        setImageFile(null)
        setImageSuccess('Imagem enviada com sucesso.')
        setImageVersion(String(Date.now()))
        router.refresh()
      } else {
        setImageError(result.error)
      }
    })
  }

  function handleImageRemove() {
    if (!category) return
    setImageError(null)
    setImageSuccess(null)
    startImageTransition(async () => {
      const result = await removeCategoryImageAction(category.id)
      if (result.ok) {
        setCurrentImagePath(null)
        setImageSuccess('Imagem removida.')
        setImageVersion(String(Date.now()))
        router.refresh()
      } else {
        setImageError(result.error)
      }
    })
  }

  function handleDelete() {
    if (!category) return
    if (!deleteConfirm) {
      setDeleteConfirm(true)
      return
    }

    startTransition(async () => {
      const result = await deleteCategoryAction(category.id)
      if (result.ok) {
        router.push('/admin/categories')
        router.refresh()
      } else {
        setErrors([result.error])
        setDeleteConfirm(false)
      }
    })
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-8">
      {errors.length > 0 && (
        <Alert type="error" className="space-y-1">
          {errors.map((msg) => (
            <p key={msg}>{msg}</p>
          ))}
        </Alert>
      )}

      {success && <Alert type="success" message="Categoria salva com sucesso." />}

      <section className="space-y-4">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <label className="block space-y-1">
            <span className="text-sm font-medium text-ink">Nome *</span>
            <input
              required
              value={name}
              onChange={(e) => handleNameChange(e.target.value)}
              className="w-full rounded-lg border border-hairline px-3 py-2 text-sm"
            />
          </label>
          <label className="block space-y-1">
            <span className="text-sm font-medium text-ink">Slug *</span>
            <input
              required
              value={slug}
              readOnly={mode === 'edit' && productCount > 0}
              disabled={mode === 'edit' && productCount > 0}
              onChange={(e) => {
                setSlugTouched(true)
                setSlug(e.target.value)
              }}
              className="w-full rounded-lg border border-hairline px-3 py-2 text-sm font-mono disabled:bg-soft-cloud disabled:text-mute disabled:cursor-not-allowed"
            />
            {mode === 'edit' && productCount > 0 && (
              <span className="text-xs text-mute">
                Slug bloqueado: {productCount} produto(s) vinculado(s).
              </span>
            )}
          </label>
          <label className="block space-y-1">
            <span className="text-sm font-medium text-ink">Ordem</span>
            <input
              type="number"
              value={sortOrder}
              onChange={(e) => setSortOrder(e.target.value)}
              className="w-full rounded-lg border border-hairline px-3 py-2 text-sm"
            />
          </label>
          <label className="block space-y-1 sm:col-span-2">
            <span className="text-sm font-medium text-ink">Categoria pai</span>
            <select
              value={parentId}
              onChange={(e) => setParentId(e.target.value)}
              className="w-full rounded-lg border border-hairline px-3 py-2 text-sm bg-white"
            >
              <option value="">Nenhuma (raiz)</option>
              {parentOptions.map((item) => (
                <option key={item.id} value={item.id}>
                  {formatCategoryOptionLabel(item)}
                </option>
              ))}
            </select>
            <span className="text-xs text-mute">
              Máximo de 4 níveis (tipo → liga → linha → time/clube).
            </span>
          </label>
          <label className="flex items-center gap-2 pt-7">
            <input
              type="checkbox"
              checked={visible}
              onChange={(e) => setVisible(e.target.checked)}
              className="rounded border-hairline"
            />
            <span className="text-sm font-medium text-ink">Visível na vitrine</span>
          </label>
        </div>
        <label className="block space-y-1">
          <span className="text-sm font-medium text-ink">Descrição</span>
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            rows={3}
            className="w-full rounded-lg border border-hairline px-3 py-2 text-sm"
          />
        </label>
      </section>

      {mode === 'edit' && category && (
        <section className="space-y-3 rounded-lg border border-hairline bg-soft-cloud p-4">
          <h3 className="text-sm font-medium text-ink">Imagem da categoria</h3>
          <p className="text-xs text-mute">
            Exibida como card visual na vitrine. Use <strong>Enviar imagem</strong> — não depende de
            Salvar alterações. PNG, JPG ou WebP, máx. 2 MB.
          </p>
          {imageError && <Alert type="error" size="sm" message={imageError} />}
          {imageSuccess && <Alert type="success" size="sm" message={imageSuccess} />}
          {currentImagePath && (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={categoryImageUrl(category.id, imageVersion)}
              alt="Imagem atual da categoria"
              className="h-24 w-full rounded-lg object-cover"
            />
          )}
          <input
            type="file"
            accept="image/png,image/jpeg,image/webp"
            onChange={(e) => setImageFile(e.target.files?.[0] ?? null)}
            disabled={isImagePending}
            className="block w-full text-sm text-mute file:mr-4 file:rounded-full file:border-0 file:bg-soft-cloud file:px-4 file:py-2 file:text-sm file:font-medium file:text-ink"
          />
          <div className="flex gap-2">
            <Button
              type="button"
              disabled={isImagePending || !imageFile}
              onClick={handleImageUpload}
            >
              {isImagePending ? 'Enviando...' : 'Enviar imagem'}
            </Button>
            {currentImagePath && (
              <Button
                type="button"
                variant="outline"
                disabled={isImagePending}
                onClick={handleImageRemove}
              >
                Remover imagem
              </Button>
            )}
          </div>
        </section>
      )}

      <div className="flex flex-wrap items-center gap-3">
        <Button type="submit" disabled={isPending}>
          {mode === 'create' ? 'Criar categoria' : 'Salvar alterações'}
        </Button>
        {mode === 'edit' && category && (
          <Button
            type="button"
            variant="outline"
            disabled={isPending || productCount > 0}
            onClick={handleDelete}
            className={deleteConfirm ? 'border-red-300 text-red-700' : ''}
          >
            {productCount > 0
              ? `Excluir (${productCount} produto(s))`
              : deleteConfirm
                ? 'Confirmar exclusão'
                : 'Excluir categoria'}
          </Button>
        )}
      </div>
    </form>
  )
}
