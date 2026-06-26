'use client'

import { useState, useTransition } from 'react'
import { useRouter } from 'next/navigation'
import { BannerSlide } from '@/types/banner-slide'
import { Button } from '@/components/ui/button'
import {
  createBannerSlideWithDesktopAction,
  updateBannerSlideAction,
  deleteBannerSlideAction,
  uploadBannerDesktopAction,
  uploadBannerMobileAction,
  removeBannerDesktopAction,
  removeBannerMobileAction,
} from '@/lib/banners/banner-actions'
import { bannerImageUrl } from '@/lib/banners/banner-image-url'

type BannerSlideFormProps = {
  mode: 'create' | 'edit'
  slide?: BannerSlide
}

export function BannerSlideForm({ mode, slide }: BannerSlideFormProps) {
  const router = useRouter()
  const [isPending, startTransition] = useTransition()
  const [isImagePending, startImageTransition] = useTransition()

  const [title, setTitle] = useState(slide?.title ?? '')
  const [subtitle, setSubtitle] = useState(slide?.subtitle ?? '')
  const [ctaLabel, setCtaLabel] = useState(slide?.ctaLabel ?? '')
  const [ctaHref, setCtaHref] = useState(slide?.ctaHref ?? '')
  const [sortOrder, setSortOrder] = useState(String(slide?.sortOrder ?? 0))
  const [active, setActive] = useState(slide?.active ?? true)
  const [error, setError] = useState<string | null>(null)
  const [imageError, setImageError] = useState<string | null>(null)
  const [imageSuccess, setImageSuccess] = useState<string | null>(null)
  const [desktopFile, setDesktopFile] = useState<File | null>(null)
  const [mobileFile, setMobileFile] = useState<File | null>(null)
  const [hasDesktop, setHasDesktop] = useState(!!slide?.desktopImagePath)
  const [hasMobile, setHasMobile] = useState(!!slide?.mobileImagePath)
  const [deleteConfirm, setDeleteConfirm] = useState(false)

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError(null)

    if (mode === 'create' && !desktopFile) {
      setError('Selecione a imagem desktop antes de criar o slide.')
      return
    }

    startTransition(async () => {
      if (mode === 'create') {
        if (!desktopFile) return

        const formData = new FormData()
        formData.set('image', desktopFile)
        formData.set('title', title)
        formData.set('subtitle', subtitle)
        formData.set('ctaLabel', ctaLabel)
        formData.set('ctaHref', ctaHref)
        formData.set('sortOrder', sortOrder)
        formData.set('active', String(active))

        const result = await createBannerSlideWithDesktopAction(formData)
        if (result.ok) {
          router.push(`/admin/banners/${result.id}`)
          router.refresh()
        } else {
          setError(result.error)
        }
      } else if (slide) {
        const result = await updateBannerSlideAction(slide.id, {
          title: title.trim() || null,
          subtitle: subtitle.trim() || null,
          ctaLabel: ctaLabel.trim() || null,
          ctaHref: ctaHref.trim() || null,
          sortOrder: parseInt(sortOrder, 10) || 0,
          active,
        })
        if (result.ok) {
          router.refresh()
        } else {
          setError(result.error)
        }
      }
    })
  }

  async function handleImageUpload(side: 'desktop' | 'mobile', file: File) {
    if (!slide) return
    setImageError(null)
    setImageSuccess(null)
    const formData = new FormData()
    formData.set('image', file)

    startImageTransition(async () => {
      const result =
        side === 'desktop'
          ? await uploadBannerDesktopAction(slide.id, formData)
          : await uploadBannerMobileAction(slide.id, formData)

      if (result.ok) {
        if (side === 'desktop') setHasDesktop(true)
        if (side === 'mobile') setHasMobile(true)
        setImageSuccess(`Imagem ${side === 'desktop' ? 'desktop' : 'mobile'} enviada.`)
        router.refresh()
      } else {
        setImageError(result.error)
      }
    })
  }

  function handleRemoveImage(side: 'desktop' | 'mobile') {
    if (!slide) return
    setImageError(null)
    startImageTransition(async () => {
      const result =
        side === 'desktop'
          ? await removeBannerDesktopAction(slide.id)
          : await removeBannerMobileAction(slide.id)
      if (result.ok) {
        if (side === 'desktop') setHasDesktop(false)
        if (side === 'mobile') setHasMobile(false)
        setImageSuccess(`Imagem ${side === 'desktop' ? 'desktop' : 'mobile'} removida.`)
        router.refresh()
      } else {
        setImageError(result.error)
      }
    })
  }

  function handleDelete() {
    if (!slide) return
    if (!deleteConfirm) { setDeleteConfirm(true); return }
    startTransition(async () => {
      const result = await deleteBannerSlideAction(slide.id)
      if (result.ok) {
        router.push('/admin/banners')
        router.refresh()
      } else {
        setError(result.error)
        setDeleteConfirm(false)
      }
    })
  }

  return (
    <div className="space-y-8">
      <form onSubmit={handleSubmit} className="space-y-6 rounded-lg border border-hairline bg-canvas p-6">
        <h2 className="text-lg font-semibold text-ink">
          {mode === 'create' ? 'Novo slide' : 'Editar slide'}
        </h2>

        {error && (
          <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
            {error}
          </div>
        )}

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <label className="block space-y-1 sm:col-span-2">
            <span className="text-sm font-medium text-ink">Título (opcional)</span>
            <input
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full rounded-lg border border-hairline bg-canvas px-3 py-2 text-sm"
            />
          </label>
          <label className="block space-y-1 sm:col-span-2">
            <span className="text-sm font-medium text-ink">Subtítulo (opcional)</span>
            <input
              value={subtitle}
              onChange={(e) => setSubtitle(e.target.value)}
              className="w-full rounded-lg border border-hairline bg-canvas px-3 py-2 text-sm"
            />
          </label>
          <label className="block space-y-1">
            <span className="text-sm font-medium text-ink">Texto do botão (CTA)</span>
            <input
              value={ctaLabel}
              onChange={(e) => setCtaLabel(e.target.value)}
              placeholder="Ex: Ver coleção"
              className="w-full rounded-lg border border-hairline bg-canvas px-3 py-2 text-sm"
            />
          </label>
          <label className="block space-y-1">
            <span className="text-sm font-medium text-ink">Link do botão (CTA)</span>
            <input
              value={ctaHref}
              onChange={(e) => setCtaHref(e.target.value)}
              placeholder="Ex: /products?category=camisas"
              className="w-full rounded-lg border border-hairline bg-canvas px-3 py-2 text-sm"
            />
          </label>
          <label className="block space-y-1">
            <span className="text-sm font-medium text-ink">Ordem</span>
            <input
              type="number"
              value={sortOrder}
              onChange={(e) => setSortOrder(e.target.value)}
              className="w-full rounded-lg border border-hairline bg-canvas px-3 py-2 text-sm"
            />
          </label>
          <label className="flex items-center gap-2 pt-7">
            <input
              type="checkbox"
              checked={active}
              onChange={(e) => setActive(e.target.checked)}
              className="rounded border-hairline"
            />
            <span className="text-sm font-medium text-ink">Ativo na vitrine</span>
          </label>
        </div>

        <div className="flex gap-3">
          <Button type="submit" disabled={isPending || (mode === 'create' && !desktopFile)}>
            {isPending ? 'Salvando...' : mode === 'create' ? 'Criar slide' : 'Salvar'}
          </Button>
          {mode === 'edit' && slide && (
            <Button
              type="button"
              variant="outline"
              disabled={isPending}
              onClick={handleDelete}
              className={deleteConfirm ? 'border-red-300 text-red-700' : ''}
            >
              {deleteConfirm ? 'Confirmar exclusão' : 'Excluir slide'}
            </Button>
          )}
        </div>
      </form>

      {mode === 'create' && (
        <div className="space-y-4 rounded-lg border border-hairline bg-canvas p-6">
          <h3 className="text-base font-semibold text-ink">Imagem desktop</h3>
          <p className="text-xs text-mute">
            Obrigatória para criar o slide. PNG, JPG ou WebP, máx. 5 MB. Mobile pode ser adicionado
            após a criação.
          </p>
          <input
            type="file"
            accept="image/png,image/jpeg,image/webp"
            required
            disabled={isPending}
            onChange={(e) => setDesktopFile(e.target.files?.[0] ?? null)}
            className="block w-full text-sm text-mute file:mr-3 file:rounded-full file:border-0 file:bg-soft-cloud file:px-3 file:py-1.5 file:text-xs file:font-medium file:text-ink"
          />
          {desktopFile && (
            <p className="text-sm text-mute">Selecionado: {desktopFile.name}</p>
          )}
        </div>
      )}

      {mode === 'edit' && slide && (
        <div className="space-y-4 rounded-lg border border-hairline bg-canvas p-6">
          <h3 className="text-base font-semibold text-ink">Imagens</h3>
          <p className="text-xs text-mute">PNG, JPG ou WebP, máx. 5 MB. Upload independente de Salvar.</p>

          {imageError && (
            <p className="text-sm text-red-600">{imageError}</p>
          )}
          {imageSuccess && (
            <p className="text-sm text-green-600">{imageSuccess}</p>
          )}

          <div className="grid gap-6 sm:grid-cols-2">
            <div className="space-y-2">
              <p className="text-sm font-medium text-ink">Desktop (obrigatório)</p>
              {hasDesktop && (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={bannerImageUrl(slide.id, 'desktop', slide.updatedAt)}
                  alt="Desktop"
                  className="h-28 w-full rounded-lg object-cover"
                />
              )}
              <input
                type="file"
                accept="image/png,image/jpeg,image/webp"
                disabled={isImagePending}
                onChange={(e) => setDesktopFile(e.target.files?.[0] ?? null)}
                className="block w-full text-sm text-mute file:mr-3 file:rounded-full file:border-0 file:bg-soft-cloud file:px-3 file:py-1.5 file:text-xs file:font-medium file:text-ink"
              />
              <div className="flex gap-2">
                <Button
                  type="button"
                  disabled={isImagePending || !desktopFile}
                  onClick={() => desktopFile && handleImageUpload('desktop', desktopFile)}
                >
                  {isImagePending ? 'Enviando...' : 'Enviar desktop'}
                </Button>
                {hasDesktop && (
                  <Button
                    type="button"
                    variant="outline"
                    disabled={isImagePending}
                    onClick={() => handleRemoveImage('desktop')}
                  >
                    Remover
                  </Button>
                )}
              </div>
              {!hasDesktop && (
                <p className="text-xs text-mute">
                  Sem imagem desktop, o slide não aparece na vitrine.
                </p>
              )}
            </div>

            <div className="space-y-2">
              <p className="text-sm font-medium text-ink">Mobile (opcional)</p>
              {!hasMobile && (
                <p className="text-xs text-amber-800">
                  Sem imagem mobile — no celular este slide usa a versão desktop.
                </p>
              )}
              {hasMobile && (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={bannerImageUrl(slide.id, 'mobile', slide.updatedAt)}
                  alt="Mobile"
                  className="h-28 w-full rounded-lg object-cover"
                />
              )}
              <input
                type="file"
                accept="image/png,image/jpeg,image/webp"
                disabled={isImagePending}
                onChange={(e) => setMobileFile(e.target.files?.[0] ?? null)}
                className="block w-full text-sm text-mute file:mr-3 file:rounded-full file:border-0 file:bg-soft-cloud file:px-3 file:py-1.5 file:text-xs file:font-medium file:text-ink"
              />
              <div className="flex gap-2">
                <Button
                  type="button"
                  disabled={isImagePending || !mobileFile}
                  onClick={() => mobileFile && handleImageUpload('mobile', mobileFile)}
                >
                  {isImagePending ? 'Enviando...' : 'Enviar mobile'}
                </Button>
                {hasMobile && (
                  <Button
                    type="button"
                    variant="outline"
                    disabled={isImagePending}
                    onClick={() => handleRemoveImage('mobile')}
                  >
                    Remover
                  </Button>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
