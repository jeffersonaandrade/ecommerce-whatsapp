import { Metadata } from 'next'
import Link from 'next/link'
import { BannerSlideForm } from '@/components/admin/banner-slide-form'

export const metadata: Metadata = {
  title: 'Novo slide',
}

export default function NewBannerPage() {
  return (
    <div className="w-full">
      <div className="bg-ink py-8 text-canvas sm:py-12">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <Link
            href="/admin/banners"
            className="text-sm text-mute transition-colors hover:text-canvas"
          >
            ← Banners
          </Link>
          <h1 className="mt-4 text-3xl font-bold sm:text-4xl">Novo slide</h1>
          <p className="mt-2 text-mute">
            Configure imagem, texto e posição do banner na home.
          </p>
        </div>
      </div>

      <div className="mx-auto max-w-4xl px-4 py-12 sm:px-6 lg:px-8">
        <BannerSlideForm mode="create" />
      </div>
    </div>
  )
}
