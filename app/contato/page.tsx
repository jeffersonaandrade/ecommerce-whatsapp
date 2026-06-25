import { getStoreSettings } from '@/lib/store/settings-repository'
import {
  InstitutionalPage,
  buildInstitutionalMetadata,
} from '@/components/layout/institutional-page'

function socialHref(platform: 'instagram', value: string): string | null {
  if (!value.trim()) return null
  if (value.startsWith('http')) return value
  const handle = value.replace(/^@/, '')
  return `https://instagram.com/${handle}`
}

export async function generateMetadata() {
  const settings = getStoreSettings()
  return buildInstitutionalMetadata(
    settings.storeName,
    'Contato',
    `Entre em contato com ${settings.storeName}.`
  )
}

export default function ContatoPage() {
  const settings = getStoreSettings()
  const instagramUrl = socialHref('instagram', settings.instagram)
  const whatsappUrl = settings.whatsappPhone
    ? `https://wa.me/${settings.whatsappPhone.replace(/\D/g, '')}`
    : null

  return (
    <InstitutionalPage title="Contato">
      <div className="space-y-6">
        {(settings.address || settings.cityState) && (
          <div>
            <h2 className="text-sm font-semibold uppercase tracking-wide text-mute">
              Endereço
            </h2>
            <p className="mt-2">
              {settings.address}
              {settings.address && settings.cityState && <br />}
              {settings.cityState}
            </p>
          </div>
        )}

        {settings.businessHours && (
          <div>
            <h2 className="text-sm font-semibold uppercase tracking-wide text-mute">
              Horário
            </h2>
            <p className="mt-2">{settings.businessHours}</p>
          </div>
        )}

        <div>
          <h2 className="text-sm font-semibold uppercase tracking-wide text-mute">
            Canais
          </h2>
          <ul className="mt-2 space-y-2">
            {settings.email && (
              <li>
                <a href={`mailto:${settings.email}`} className="text-ink underline-offset-4 hover:underline">
                  {settings.email}
                </a>
              </li>
            )}
            {settings.phone && <li>{settings.phone}</li>}
            {whatsappUrl && (
              <li>
                <a
                  href={whatsappUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-ink underline-offset-4 hover:underline"
                >
                  WhatsApp
                </a>
              </li>
            )}
            {instagramUrl && (
              <li>
                <a
                  href={instagramUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-ink underline-offset-4 hover:underline"
                >
                  Instagram
                </a>
              </li>
            )}
          </ul>
        </div>
      </div>
    </InstitutionalPage>
  )
}
