import { HeaderBrandDisplay } from '@/types/store-settings'
import {
  HEADER_LOGO_CLASS_BOTH,
  HEADER_LOGO_CLASS_LOGO_ONLY,
  resolveHeaderBrandRender,
} from '@/lib/store/header-brand-display'

type HeaderBrandMarkProps = {
  storeName: string
  logoUrl: string | null
  primaryColor: string
  headerBrandDisplay: HeaderBrandDisplay
  nameClassName?: string
}

export function HeaderBrandMark({
  storeName,
  logoUrl,
  primaryColor,
  headerBrandDisplay,
  nameClassName = 'truncate text-base font-semibold tracking-tight text-ink sm:max-w-[12rem] lg:max-w-none',
}: HeaderBrandMarkProps) {
  const render = resolveHeaderBrandRender(headerBrandDisplay, Boolean(logoUrl))

  return (
    <>
      {render.showLogo && logoUrl ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={logoUrl}
          alt={storeName}
          className={render.logoClassName}
        />
      ) : render.showInitialFallback ? (
        <div
          className="flex h-8 w-8 shrink-0 items-center justify-center rounded-sm text-sm font-bold text-canvas"
          style={{ backgroundColor: primaryColor }}
        >
          {storeName.charAt(0).toUpperCase()}
        </div>
      ) : null}
      {render.showName ? <span className={nameClassName}>{storeName}</span> : null}
    </>
  )
}

export function headerBrandPreviewClasses(display: HeaderBrandDisplay) {
  const render = resolveHeaderBrandRender(display, true)
  return render.logoClassName === HEADER_LOGO_CLASS_LOGO_ONLY
    ? HEADER_LOGO_CLASS_LOGO_ONLY
    : HEADER_LOGO_CLASS_BOTH
}
