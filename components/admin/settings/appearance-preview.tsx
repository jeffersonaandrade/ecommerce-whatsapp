'use client'

import { StoreSettings } from '@/types/store-settings'
import { BRANDING_ICON_FILES, brandingAssetUrl } from '@/lib/store/branding-url'

type AppearancePreviewProps = {
  settings: StoreSettings
}

export function AppearancePreview({ settings }: AppearancePreviewProps) {
  const v = settings.updatedAt
  const logoUrl = brandingAssetUrl(settings.logoPath, v)
  const ogUrl = brandingAssetUrl(settings.ogImagePath, v)
  const faviconUrl = brandingAssetUrl(BRANDING_ICON_FILES.favicon32, v)

  return (
    <div className="space-y-4 rounded-lg border border-hairline bg-soft-cloud p-4">
      <p className="text-sm font-semibold text-ink">Preview da identidade</p>

      <div className="rounded-lg border border-hairline bg-canvas p-4">
        <p className="mb-2 text-xs uppercase tracking-wide text-mute">Header</p>
        <div className="flex items-center gap-2 border-b border-hairline pb-3">
          {logoUrl ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={logoUrl} alt="" className="h-8 w-auto max-w-[120px] rounded-sm object-contain" />
          ) : (
            <div className="flex h-8 w-8 items-center justify-center rounded-sm bg-ink text-xs font-bold text-canvas">
              {settings.storeName.charAt(0).toUpperCase()}
            </div>
          )}
          <span className="text-sm font-semibold text-ink">{settings.storeName}</span>
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <div className="rounded-lg border border-hairline bg-canvas p-4">
          <p className="mb-2 text-xs uppercase tracking-wide text-mute">Favicon</p>
          {faviconUrl && settings.logoPath ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={faviconUrl} alt="" className="h-8 w-8" />
          ) : (
            <p className="text-xs text-mute">Envie uma logo para gerar favicons.</p>
          )}
        </div>

        <div className="rounded-lg border border-hairline bg-canvas p-4">
          <p className="mb-2 text-xs uppercase tracking-wide text-mute">Compartilhamento</p>
          <div className="overflow-hidden rounded border border-hairline">
            {ogUrl ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={ogUrl} alt="" className="aspect-[1200/630] w-full object-cover" />
            ) : (
              <div className="flex aspect-[1200/630] items-center justify-center bg-soft-cloud text-xs text-mute">
                OG gerada da logo
              </div>
            )}
            <div className="p-2">
              <p className="truncate text-xs font-semibold text-ink">{settings.storeName}</p>
              <p className="line-clamp-2 text-xs text-mute">{settings.description}</p>
            </div>
          </div>
        </div>
        <div className="rounded-lg border border-hairline bg-canvas p-4">
          <p className="mb-2 text-xs uppercase tracking-wide text-mute">Google</p>
          <p className="text-sm text-[#1a0dab]">{settings.siteUrl || 'https://sua-loja.com.br'}</p>
          <p className="text-base font-medium text-[#1a0dab]">{settings.storeName}</p>
          <p className="line-clamp-2 text-sm text-[#4d5156]">{settings.description}</p>
        </div>
      </div>
    </div>
  )
}
