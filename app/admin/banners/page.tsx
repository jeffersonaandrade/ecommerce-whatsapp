import { Metadata } from 'next'
import Link from 'next/link'
import { getButtonClassName } from '@/components/ui/button'
import { getAllBannerSlides } from '@/lib/banners'
import { ReorderBannerButtons } from '@/components/admin/reorder-banner-buttons'
import { ToggleBannerActiveButton } from '@/components/admin/toggle-banner-active-button'
import { bannerImageUrl } from '@/lib/banners/banner-storage'
import { BANNER_VISIBILITY_OPTIONS, BannerSlideVisibility } from '@/types/banner-slide'

function visibilityLabel(visibility: BannerSlideVisibility): string {
  return BANNER_VISIBILITY_OPTIONS.find((o) => o.value === visibility)?.label ?? visibility
}

function visibilityBadgeClass(visibility: BannerSlideVisibility): string {
  if (visibility === 'desktop') return 'bg-blue-50 text-blue-800'
  if (visibility === 'mobile') return 'bg-violet-50 text-violet-800'
  return 'bg-soft-cloud text-ink'
}

export const metadata: Metadata = {
  title: 'Banners',
  description: 'Gerenciar slides do carrossel da home',
}

export default async function AdminBannersPage() {
  const slides = await getAllBannerSlides()

  return (
    <div className="w-full">
      <div className="bg-ink py-8 text-canvas sm:py-12">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <Link
            href="/admin"
            className="text-sm text-mute transition-colors hover:text-canvas"
          >
            ← Voltar ao Admin
          </Link>
          <div className="mt-4 flex flex-wrap items-end justify-between gap-4">
            <div>
              <h1 className="text-3xl font-bold sm:text-4xl">Banners</h1>
              <p className="mt-2 text-mute">
                Slides do carrossel na home. Ordem pelo campo &quot;Ordem&quot;.
              </p>
            </div>
            <Link
              href="/admin/banners/new"
              className={getButtonClassName('secondary', 'md', '!text-ink')}
            >
              + Novo slide
            </Link>
          </div>
        </div>
      </div>

      <div className="mx-auto max-w-4xl px-4 py-12 sm:px-6 lg:px-8">
        {slides.length === 0 ? (
          <div className="rounded-lg border border-hairline bg-canvas px-6 py-12 text-center">
            <p className="text-mute">Nenhum slide cadastrado.</p>
            <Link
              href="/admin/banners/new"
              className={getButtonClassName('default', 'sm', 'mt-4 inline-flex')}
            >
              Criar primeiro slide
            </Link>
          </div>
        ) : (
          <div className="overflow-x-auto rounded-lg border border-hairline">
            <table className="w-full text-sm">
              <thead className="bg-soft-cloud">
                <tr>
                  <th className="px-4 py-3 text-left font-medium text-mute">Slide</th>
                  <th className="px-4 py-3 text-left font-medium text-mute">Título</th>
                  <th className="px-4 py-3 text-left font-medium text-mute">Visibilidade</th>
                  <th className="px-4 py-3 text-center font-medium text-mute">Ordem</th>
                  <th className="px-4 py-3 text-center font-medium text-mute">Ativo</th>
                  <th className="px-4 py-3 text-right font-medium text-mute">Ações</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-hairline bg-canvas">
                {slides.map((slide) => (
                  <tr key={slide.id} className="hover:bg-soft-cloud/50">
                    <td className="px-4 py-3">
                      {slide.desktopImagePath ? (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img
                          src={bannerImageUrl(slide.id, 'desktop', slide.updatedAt)}
                          alt={slide.title ?? ''}
                          className="h-12 w-20 rounded object-cover"
                        />
                      ) : (
                        <div className="h-12 w-20 rounded bg-soft-cloud" />
                      )}
                    </td>
                    <td className="px-4 py-3">
                      <p className="font-medium text-ink">{slide.title ?? <span className="text-mute italic">Sem título</span>}</p>
                      {slide.subtitle && <p className="text-xs text-mute">{slide.subtitle}</p>}
                    </td>
                    <td className="px-4 py-3">
                      <span
                        className={`inline-flex rounded-full px-2.5 py-0.5 text-xs font-medium ${visibilityBadgeClass(slide.visibility ?? 'all')}`}
                      >
                        {visibilityLabel(slide.visibility ?? 'all')}
                      </span>
                      {slide.mobileImagePath ? (
                        <p className="mt-1 text-xs text-mute">Com imagem mobile dedicada</p>
                      ) : slide.visibility !== 'mobile' ? (
                        <p className="mt-1 text-xs text-mute">Mobile usa desktop</p>
                      ) : null}
                    </td>
                    <td className="px-4 py-3 text-center">
                      <div className="flex items-center justify-center gap-1">
                        <span className="w-8 text-center tabular-nums">{slide.sortOrder}</span>
                        <ReorderBannerButtons slideId={slide.id} />
                      </div>
                    </td>
                    <td className="px-4 py-3 text-center">
                      <ToggleBannerActiveButton slideId={slide.id} active={slide.active} />
                    </td>
                    <td className="px-4 py-3 text-right">
                      <Link
                        href={`/admin/banners/${slide.id}`}
                        className="text-sm font-medium text-accent hover:underline"
                      >
                        Editar
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  )
}
