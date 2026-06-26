'use client'

import { StoreSettings } from '@/types/store-settings'
import { BRANDING_ICON_FILES, brandingAssetUrl } from '@/lib/store/branding-url'
import { headerBrandPreviewClasses } from '@/components/layout/header-brand-mark'
import { resolveHeaderBrandRender } from '@/lib/store/header-brand-display'

type AppearancePreviewProps = {
  settings: StoreSettings
}

export function AppearancePreview({ settings }: AppearancePreviewProps) {
  const v = settings.updatedAt
  const logoUrl = brandingAssetUrl(settings.logoPath, v)
  const ogUrl = brandingAssetUrl(settings.ogImagePath, v)
  const faviconUrl = brandingAssetUrl(BRANDING_ICON_FILES.favicon32, v)
  const headerRender = resolveHeaderBrandRender(
    settings.headerBrandDisplay,
    Boolean(logoUrl)
  )
  const previewLogoClass = headerBrandPreviewClasses(settings.headerBrandDisplay)

  return (
    <div className="space-y-4 rounded-lg border border-hairline bg-soft-cloud p-4">
      <p className="text-sm font-semibold text-ink">Preview da identidade</p>

      <div className="rounded-lg border border-hairline bg-canvas p-4">
        <p className="mb-2 text-xs uppercase tracking-wide text-mute">Header</p>
        <div className="flex items-center gap-2 border-b border-hairline pb-3">
          {headerRender.showLogo && logoUrl ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={logoUrl} alt="" className={previewLogoClass} />
          ) : headerRender.showInitialFallback ? (
            <div className="flex h-8 w-8 items-center justify-center rounded-sm bg-ink text-xs font-bold text-canvas">
              {settings.storeName.charAt(0).toUpperCase()}
            </div>
          ) : null}
          {headerRender.showName ? (
            <span className="text-sm font-semibold text-ink">{settings.storeName}</span>
          ) : null}
        </div>
        {!logoUrl && settings.headerBrandDisplay === 'logo_only' && (
          <p className="mt-2 text-xs text-mute">
            Sem logo implantada — o nome da loja aparece como fallback.
          </p>
        )}
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <div className="rounded-lg border border-hairline bg-canvas p-4">
          <p className="mb-2 text-xs uppercase tracking-wide text-mute">Favicon</p>
          {faviconUrl && settings.logoPath ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={faviconUrl} alt="" className="h-8 w-8" />
          ) : (
            <p className="text-xs text-mute">Configurado na implantação da loja.</p>
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
                Imagem OG configurada na implantação
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
