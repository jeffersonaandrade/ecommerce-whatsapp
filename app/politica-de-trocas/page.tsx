import { getStoreSettings } from '@/lib/store/settings-repository'
import {
  InstitutionalPage,
  buildInstitutionalMetadata,
} from '@/components/layout/institutional-page'

export async function generateMetadata() {
  const settings = getStoreSettings()
  return buildInstitutionalMetadata(
    settings.storeName,
    'Política de trocas',
    settings.exchangePolicyText.slice(0, 160)
  )
}

export default function PoliticaDeTrocasPage() {
  const settings = getStoreSettings()

  return (
    <InstitutionalPage title="Política de trocas">
      <p className="whitespace-pre-wrap">{settings.exchangePolicyText}</p>
    </InstitutionalPage>
  )
}
