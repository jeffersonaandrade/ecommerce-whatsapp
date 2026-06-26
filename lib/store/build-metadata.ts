import type { Metadata } from 'next'
import { StoreSettings } from '@/types/store-settings'
import {
  BRANDING_ICON_FILES,
  brandingAssetUrl,
  brandingAssetUrlVersioned,
} from './branding-url'

const BRANDING_CACHE_CONTROL = 'public, max-age=60, must-revalidate'

export { BRANDING_CACHE_CONTROL }

function versionedIcons(updatedAt: string): NonNullable<Metadata['icons']> {
  const v = updatedAt
  return {
    icon: [
      {
        url: brandingAssetUrlVersioned(BRANDING_ICON_FILES.favicon32, v),
        sizes: '32x32',
        type: 'image/png',
      },
      {
        url: brandingAssetUrlVersioned(BRANDING_ICON_FILES.favicon16, v),
        sizes: '16x16',
        type: 'image/png',
      },
    ],
    apple: [
      {
        url: brandingAssetUrlVersioned(BRANDING_ICON_FILES.appleTouch, v),
        sizes: '180x180',
        type: 'image/png',
      },
    ],
    other: [
      {
        rel: 'icon',
        url: brandingAssetUrlVersioned(BRANDING_ICON_FILES.android192, v),
        sizes: '192x192',
        type: 'image/png',
      },
      {
        rel: 'icon',
        url: brandingAssetUrlVersioned(BRANDING_ICON_FILES.android512, v),
        sizes: '512x512',
        type: 'image/png',
      },
    ],
  }
}

function absoluteOgUrl(settings: StoreSettings): string | undefined {
  const ogPath = brandingAssetUrl(settings.ogImagePath, settings.updatedAt)
  return ogPath ? `${settings.siteUrl}${ogPath}` : undefined
}

export function buildRootMetadata(settings: StoreSettings): Metadata {
  const absoluteOg = absoluteOgUrl(settings)

  return {
    metadataBase: new URL(settings.siteUrl),
    title: {
      default: settings.storeName,
      template: `%s | ${settings.storeName}`,
    },
    description: settings.description,
    openGraph: {
      type: 'website',
      locale: 'pt_BR',
      siteName: settings.storeName,
      title: settings.storeName,
      description: settings.description,
      url: settings.siteUrl,
      images: absoluteOg ? [{ url: absoluteOg, alt: settings.storeName }] : [],
    },
    twitter: {
      card: 'summary_large_image',
      title: settings.storeName,
      description: settings.description,
      images: absoluteOg ? [absoluteOg] : [],
    },
    icons: settings.logoPath ? versionedIcons(settings.updatedAt) : undefined,
  }
}

export function buildPageMetadata(
  settings: StoreSettings,
  title: string,
  description: string,
  path = ''
): Metadata {
  const canonical = `${settings.siteUrl}${path}`
  const absoluteOg = absoluteOgUrl(settings)

  return {
    title,
    description,
    alternates: { canonical },
    openGraph: {
      title,
      description,
      url: canonical,
      siteName: settings.storeName,
      images: absoluteOg ? [{ url: absoluteOg, alt: settings.storeName }] : [],
    },
    twitter: {
      card: 'summary_large_image',
      title,
      description,
      images: absoluteOg ? [absoluteOg] : [],
    },
  }
}
