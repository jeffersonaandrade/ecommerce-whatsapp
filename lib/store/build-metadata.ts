import type { Metadata } from 'next'
import { StoreSettings } from '@/types/store-settings'
import { brandingAssetUrl } from './branding-url'

export function buildRootMetadata(settings: StoreSettings): Metadata {
  const ogUrl = brandingAssetUrl(settings.ogImagePath)
  const absoluteOg = ogUrl ? `${settings.siteUrl}${ogUrl}` : undefined

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
    icons: {
      icon: [
        { url: '/api/branding/favicon-32.png', sizes: '32x32', type: 'image/png' },
        { url: '/api/branding/favicon-16.png', sizes: '16x16', type: 'image/png' },
      ],
      apple: [{ url: '/api/branding/apple-touch-icon.png', sizes: '180x180' }],
    },
  }
}

export function buildPageMetadata(
  settings: StoreSettings,
  title: string,
  description: string,
  path = ''
): Metadata {
  const canonical = `${settings.siteUrl}${path}`
  const ogUrl = brandingAssetUrl(settings.ogImagePath)
  const absoluteOg = ogUrl ? `${settings.siteUrl}${ogUrl}` : undefined

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
