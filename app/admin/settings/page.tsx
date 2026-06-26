import { Metadata } from 'next'
import Link from 'next/link'
import { StoreSettingsForm } from '@/components/admin/settings/store-settings-form'
import { getStoreSettings } from '@/lib/store/settings-repository'

export const metadata: Metadata = {
  title: 'Configurações da Loja',
  description: 'Identidade da loja, WhatsApp e aparência',
}

export default async function AdminSettingsPage() {
  const settings = await getStoreSettings()

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
          <h1 className="mt-4 text-3xl font-bold sm:text-4xl">Configurações</h1>
          <p className="mt-2 text-mute">Conteúdo · WhatsApp · Hero · Identidade (implantação)</p>
        </div>
      </div>

      <div className="mx-auto max-w-3xl px-4 py-12 sm:px-6 lg:px-8">
        <StoreSettingsForm initial={settings} />
      </div>
    </div>
  )
}
