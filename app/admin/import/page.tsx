import { Metadata } from 'next'
import Link from 'next/link'
import { ImportWizard } from '@/components/admin/import/import-wizard'
import { getStoreSettings } from '@/lib/store/settings-repository'

export const metadata: Metadata = {
  title: 'Importação CSV',
  description: 'Importação de produtos via planilha CSV de carga em massa',
}

export default async function AdminImportPage() {
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
          <h1 className="mt-4 text-3xl font-bold sm:text-4xl">Catálogo · Importação</h1>
          <p className="mt-2 text-mute">
            Planilha de carga em massa — uma linha por variação de produto
          </p>
        </div>
      </div>

      <div className="mx-auto max-w-4xl px-4 py-12 sm:px-6 lg:px-8">
        <ImportWizard importStatusPolicy={settings.importStatusPolicy} />
      </div>
    </div>
  )
}
