import { Metadata } from 'next'
import Link from 'next/link'
import { AdminListPage } from '@/components/admin/admin-list-page'
import { BannerSlideForm } from '@/components/admin/banner-slide-form'

export const metadata: Metadata = {
  title: 'Novo slide',
}

export default function NewBannerPage() {
  return (
    <AdminListPage
      header={
        <div>
          <Link href="/admin/banners" className="text-sm text-mute hover:text-ink">
            ← Banners
          </Link>
          <h1 className="mt-2 text-2xl font-bold text-ink">Novo slide</h1>
        </div>
      }
      content={<BannerSlideForm mode="create" />}
    />
  )
}
