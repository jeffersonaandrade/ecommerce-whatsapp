'use client'

import { useState, useTransition } from 'react'
import { useRouter } from 'next/navigation'
import { Category } from '@/types/category'
import { Button } from '@/components/ui/button'
import { generateCategorySlug } from '@/lib/catalog/category-utils'
import {
  createCategoryAction,
  deleteCategoryAction,
  updateCategoryAction,
  type CategoryFormPayload,
} from '@/lib/catalog/category-actions'

type CategoryFormProps = {
  mode: 'create' | 'edit'
  category?: Category
  productCount?: number
}

function categoryToForm(category: Category) {
  return {
    name: category.name,
    slug: category.slug,
    description: category.description,
    sortOrder: String(category.sortOrder),
    visible: category.visible,
  }
}

export function CategoryForm({ mode, category, productCount = 0 }: CategoryFormProps) {
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
      }

  const [name, setName] = useState(initial.name)
  const [slug, setSlug] = useState(initial.slug)
  const [slugTouched, setSlugTouched] = useState(mode === 'edit')
  const [description, setDescription] = useState(initial.description)
  const [sortOrder, setSortOrder] = useState(initial.sortOrder)
  const [visible, setVisible] = useState(initial.visible)
  const [errors, setErrors] = useState<string[]>([])
  const [success, setSuccess] = useState(false)
  const [deleteConfirm, setDeleteConfirm] = useState(false)

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
    }
  }

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
        <div className="rounded-lg border border-red-200 bg-red-50 p-4 text-sm text-red-800 space-y-1">
          {errors.map((msg) => (
            <p key={msg}>{msg}</p>
          ))}
        </div>
      )}

      {success && (
        <div className="rounded-lg border border-green-200 bg-green-50 p-4 text-sm text-green-800">
          Categoria salva com sucesso.
        </div>
      )}

      <section className="space-y-4">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <label className="block space-y-1">
            <span className="text-sm font-medium text-gray-700">Nome *</span>
            <input
              required
              value={name}
              onChange={(e) => handleNameChange(e.target.value)}
              className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm"
            />
          </label>
          <label className="block space-y-1">
            <span className="text-sm font-medium text-gray-700">Slug *</span>
            <input
              required
              value={slug}
              readOnly={mode === 'edit' && productCount > 0}
              disabled={mode === 'edit' && productCount > 0}
              onChange={(e) => {
                setSlugTouched(true)
                setSlug(e.target.value)
              }}
              className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm font-mono disabled:bg-gray-100 disabled:text-gray-600 disabled:cursor-not-allowed"
            />
            {mode === 'edit' && productCount > 0 && (
              <span className="text-xs text-gray-500">
                Slug bloqueado: {productCount} produto(s) vinculado(s).
              </span>
            )}
          </label>
          <label className="block space-y-1">
            <span className="text-sm font-medium text-gray-700">Ordem</span>
            <input
              type="number"
              value={sortOrder}
              onChange={(e) => setSortOrder(e.target.value)}
              className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm"
            />
          </label>
          <label className="flex items-center gap-2 pt-7">
            <input
              type="checkbox"
              checked={visible}
              onChange={(e) => setVisible(e.target.checked)}
              className="rounded border-gray-300"
            />
            <span className="text-sm font-medium text-gray-700">Visível na vitrine</span>
          </label>
        </div>
        <label className="block space-y-1">
          <span className="text-sm font-medium text-gray-700">Descrição</span>
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            rows={3}
            className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm"
          />
        </label>
      </section>

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
