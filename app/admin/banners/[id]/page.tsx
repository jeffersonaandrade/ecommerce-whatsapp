import { Metadata } from 'next'
import { notFound } from 'next/navigation'
import Link from 'next/link'
import { AdminListPage } from '@/components/admin/admin-list-page'
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
    <AdminListPage
      header={
        <div>
          <Link href="/admin/banners" className="text-sm text-mute hover:text-ink">
            ← Banners
          </Link>
          <h1 className="mt-2 text-2xl font-bold text-ink">
            {slide.title ?? 'Editar slide'}
          </h1>
        </div>
      }
      content={<BannerSlideForm mode="edit" slide={slide} />}
    />
  )
}
