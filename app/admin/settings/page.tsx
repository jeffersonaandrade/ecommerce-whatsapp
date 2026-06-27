import { Metadata } from 'next'
import { AdminPageHeader } from '@/components/admin/admin-page-header'
import { StoreSettingsForm } from '@/components/admin/settings/store-settings-form'
import { getActiveBannerSlides } from '@/lib/banners'
import { getStoreSettings } from '@/lib/store/settings-repository'

export const metadata: Metadata = {
  title: 'Configurações da Loja',
  description: 'Identidade da loja, WhatsApp e aparência',
}

export default async function AdminSettingsPage() {
  const [settings, activeBannerSlides] = await Promise.all([
    getStoreSettings(),
    getActiveBannerSlides(),
  ])
  const heroManagedByBanners = activeBannerSlides.length > 0

  return (
    <div className="w-full">
      <AdminPageHeader
        title="Configurações"
        subtitle={
          heroManagedByBanners
            ? 'Conteúdo · WhatsApp · Identidade (implantação) · Home via Banners'
            : 'Conteúdo · WhatsApp · Hero · Identidade (implantação)'
        }
        back={{ href: '/admin', label: 'Voltar ao Admin' }}
      />

      <div className="mx-auto max-w-3xl px-4 py-12 sm:px-6 lg:px-8">
        <StoreSettingsForm
          initial={settings}
          heroManagedByBanners={heroManagedByBanners}
          activeBannerCount={activeBannerSlides.length}
        />
      </div>
    </div>
  )
}
