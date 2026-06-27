import { Metadata } from 'next'
import { notFound } from 'next/navigation'
import { AdminPageHeader } from '@/components/admin/admin-page-header'
import { BannerSlideForm } from '@/components/admin/banner-slide-form'
import { getBannerRepository } from '@/lib/banners/get-banner-repository'

type Props = { params: Promise<{ id: string }> }

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { id } = await params
  const repo = getBannerRepository()
  const slide = await repo.getById(id)
  return { title: slide?.title ?? 'Editar slide' }
}

export default async function EditBannerPage({ params }: Props) {
  const { id } = await params
  const repo = getBannerRepository()
  const slide = await repo.getById(id)
  if (!slide) notFound()

  return (
    <div className="w-full">
      <AdminPageHeader
        title={slide.title ?? 'Editar slide'}
        subtitle="Ajuste imagens, textos e exibição deste slide."
        back={{ href: '/admin/banners', label: 'Banners' }}
      />

      <div className="mx-auto max-w-4xl px-4 py-12 sm:px-6 lg:px-8">
        <BannerSlideForm mode="edit" slide={slide} />
      </div>
    </div>
  )
}
