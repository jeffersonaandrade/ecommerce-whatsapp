import { Metadata } from 'next'
import { AdminPageHeader } from '@/components/admin/admin-page-header'
import { BannerSlideForm } from '@/components/admin/banner-slide-form'

export const metadata: Metadata = {
  title: 'Novo slide',
}

export default function NewBannerPage() {
  return (
    <div className="w-full">
      <AdminPageHeader
        title="Novo slide"
        subtitle="Configure imagem, texto e posição do banner na home."
        back={{ href: '/admin/banners', label: 'Banners' }}
      />

      <div className="mx-auto max-w-4xl px-4 py-12 sm:px-6 lg:px-8">
        <BannerSlideForm mode="create" />
      </div>
    </div>
  )
}
