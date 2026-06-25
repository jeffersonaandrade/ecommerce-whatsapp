import { getStoreSettings } from '@/lib/store/settings-repository'
import {
  InstitutionalPage,
  buildInstitutionalMetadata,
} from '@/components/layout/institutional-page'

export async function generateMetadata() {
  const settings = await getStoreSettings()
  return buildInstitutionalMetadata(
    settings.storeName,
    'Sobre',
    settings.aboutText.slice(0, 160)
  )
}

export default async function SobrePage() {
  const settings = await getStoreSettings()

  return (
    <InstitutionalPage title={`Sobre ${settings.storeName}`}>
      <p className="whitespace-pre-wrap">{settings.aboutText}</p>
    </InstitutionalPage>
  )
}
