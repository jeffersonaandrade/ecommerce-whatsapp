import { HeaderBrandDisplay } from '@/types/store-settings'

export const HEADER_BRAND_DISPLAY_VALUES = ['both', 'logo_only', 'name_only'] as const

export const DEFAULT_HEADER_BRAND_DISPLAY: HeaderBrandDisplay = 'both'

export const HEADER_LOGO_CLASS_BOTH = 'h-8 w-auto max-w-[120px] shrink-0 rounded-sm object-contain'
export const HEADER_LOGO_CLASS_LOGO_ONLY =
  'h-12 w-auto max-w-[200px] shrink-0 rounded-sm object-contain'

export function isValidHeaderBrandDisplay(value: string): value is HeaderBrandDisplay {
  return (HEADER_BRAND_DISPLAY_VALUES as readonly string[]).includes(value)
}

export function normalizeHeaderBrandDisplay(
  value: string | undefined | null,
  fallback: HeaderBrandDisplay = DEFAULT_HEADER_BRAND_DISPLAY
): HeaderBrandDisplay {
  if (value && isValidHeaderBrandDisplay(value)) {
    return value
  }
  return fallback
}

export type HeaderBrandRender = {
  showLogo: boolean
  showName: boolean
  showInitialFallback: boolean
  logoClassName: string
}

export function resolveHeaderBrandRender(
  display: HeaderBrandDisplay,
  hasLogo: boolean
): HeaderBrandRender {
  if (display === 'name_only') {
    return {
      showLogo: false,
      showName: true,
      showInitialFallback: false,
      logoClassName: HEADER_LOGO_CLASS_BOTH,
    }
  }

  if (display === 'logo_only') {
    if (hasLogo) {
      return {
        showLogo: true,
        showName: false,
        showInitialFallback: false,
        logoClassName: HEADER_LOGO_CLASS_LOGO_ONLY,
      }
    }
    return {
      showLogo: false,
      showName: true,
      showInitialFallback: false,
      logoClassName: HEADER_LOGO_CLASS_LOGO_ONLY,
    }
  }

  if (hasLogo) {
    return {
      showLogo: true,
      showName: true,
      showInitialFallback: false,
      logoClassName: HEADER_LOGO_CLASS_BOTH,
    }
  }

  return {
    showLogo: false,
    showName: true,
    showInitialFallback: true,
    logoClassName: HEADER_LOGO_CLASS_BOTH,
  }
}
