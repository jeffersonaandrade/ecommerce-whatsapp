import { Metadata } from 'next'
import { AdminPageHeader } from '@/components/admin/admin-page-header'
import { PersonalizationSettingsForm } from '@/components/admin/commercial/personalization-settings-form'
import { getStoreSettings } from '@/lib/store/settings-repository'
import { storeSettingsToPersonalization } from '@/lib/personalization/personalization-settings'

export const metadata: Metadata = {
  title: 'Personalização',
}

export default async function AdminPersonalizacaoPage() {
  const settings = await getStoreSettings()
  const personalization = storeSettingsToPersonalization(settings)

  return (
    <div className="w-full">
      <AdminPageHeader
        title="Personalização"
        subtitle="Configuração global. Produtos elegíveis são marcados no cadastro."
        back={{ href: '/admin/comercial', label: 'Comercial' }}
      />
      <div className="px-4 py-12 sm:px-6 lg:px-8">
        <PersonalizationSettingsForm initial={personalization} />
      </div>
    </div>
  )
}
