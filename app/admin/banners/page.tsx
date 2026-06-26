import { Metadata } from 'next'
import Link from 'next/link'
import { getButtonClassName } from '@/components/ui/button'
import { AdminListPage } from '@/components/admin/admin-list-page'
import { getAllBannerSlides } from '@/lib/banners'
import { ReorderBannerButtons } from '@/components/admin/reorder-banner-buttons'
import { ToggleBannerActiveButton } from '@/components/admin/toggle-banner-active-button'
import { bannerImageUrl } from '@/lib/banners/banner-storage'

export const metadata: Metadata = {
  title: 'Banners',
  description: 'Gerenciar slides do carrossel da home',
}

export default async function AdminBannersPage() {
  const slides = await getAllBannerSlides()

  return (
    <AdminListPage
      header={
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-ink">Banners</h1>
            <p className="mt-1 text-sm text-mute">
              Slides do carrossel na home. Ordem pelo campo &quot;Ordem&quot;.
            </p>
          </div>
          <Link href="/admin/banners/new" className={getButtonClassName('default', 'sm')}>
            + Novo slide
          </Link>
        </div>
      }
      content={
        slides.length === 0 ? (
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
          <div className="overflow-hidden rounded-lg border border-hairline">
            <table className="w-full text-sm">
              <thead className="bg-soft-cloud">
                <tr>
                  <th className="px-4 py-3 text-left font-medium text-mute">Slide</th>
                  <th className="px-4 py-3 text-left font-medium text-mute">Título</th>
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
        )
      }
    />
  )
}
