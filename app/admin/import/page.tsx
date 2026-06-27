import { Metadata } from 'next'
import { notFound } from 'next/navigation'
import { AdminPageHeader } from '@/components/admin/admin-page-header'
import { ImportWizard } from '@/components/admin/import/import-wizard'
import { isMigrationToolsEnabled } from '@/lib/env/migration-tools'
import { getStoreSettings } from '@/lib/store/settings-repository'

export const metadata: Metadata = {
  title: 'Importação CSV',
  description: 'Importação de produtos via planilha CSV de carga em massa',
}

export default async function AdminImportPage() {
  if (!isMigrationToolsEnabled()) notFound()

  const settings = await getStoreSettings()

  return (
    <div className="w-full">
      <AdminPageHeader
        title="Catálogo · Importação"
        subtitle="Planilha de carga em massa — uma linha por variação de produto"
        back={{ href: '/admin', label: 'Voltar ao Admin' }}
      />

      <div className="mx-auto max-w-4xl px-4 py-12 sm:px-6 lg:px-8">
        <ImportWizard importStatusPolicy={settings.importStatusPolicy} />
      </div>
    </div>
  )
}
