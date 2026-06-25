import 'server-only'

import { StoreSettings, StoreSettingsInput } from '@/types/store-settings'
import {
  DEFAULT_PRIMARY_COLOR,
  DEFAULT_SECONDARY_COLOR,
  isValidHexColor,
} from './settings-defaults'
import {
  loadStoreSettingsFromDisk,
  persistStoreSettings,
} from './settings-storage'

function normalizeColor(value: string | undefined, fallback: string): string {
  if (!value) return fallback
  const trimmed = value.trim()
  return isValidHexColor(trimmed) ? trimmed : fallback
}

export function getStoreSettings(): StoreSettings {
  return loadStoreSettingsFromDisk()
}

export function updateStoreSettings(input: StoreSettingsInput): StoreSettings {
  const current = loadStoreSettingsFromDisk()
  const next: StoreSettings = {
    ...current,
    ...input,
    storeName: input.storeName?.trim() ?? current.storeName,
    description: input.description?.trim() ?? current.description,
    siteUrl: (input.siteUrl ?? current.siteUrl).replace(/\/$/, ''),
    whatsappPhone: (input.whatsappPhone ?? current.whatsappPhone).replace(/\D/g, ''),
    whatsappMessagePrefix:
      input.whatsappMessagePrefix?.trim() ?? current.whatsappMessagePrefix,
    email: input.email?.trim() ?? current.email,
    instagram: input.instagram?.trim() ?? current.instagram,
    facebook: input.facebook?.trim() ?? current.facebook,
    phone: input.phone?.trim() ?? current.phone,
    logoPath: input.logoPath !== undefined ? input.logoPath : current.logoPath,
    ogImagePath: input.ogImagePath !== undefined ? input.ogImagePath : current.ogImagePath,
    primaryColor: normalizeColor(input.primaryColor, current.primaryColor || DEFAULT_PRIMARY_COLOR),
    secondaryColor: normalizeColor(
      input.secondaryColor,
      current.secondaryColor || DEFAULT_SECONDARY_COLOR
    ),
    heroImagePath:
      input.heroImagePath !== undefined ? input.heroImagePath : current.heroImagePath,
    heroHeadline: input.heroHeadline?.trim() ?? current.heroHeadline,
    heroHeadlineLine2: input.heroHeadlineLine2?.trim() ?? current.heroHeadlineLine2,
    heroSubheadline: input.heroSubheadline?.trim() ?? current.heroSubheadline,
    heroCtaLabel: input.heroCtaLabel?.trim() ?? current.heroCtaLabel,
    heroCtaHref: input.heroCtaHref?.trim() ?? current.heroCtaHref,
    aboutText: input.aboutText?.trim() ?? current.aboutText,
    address: input.address?.trim() ?? current.address,
    cityState: input.cityState?.trim() ?? current.cityState,
    businessHours: input.businessHours?.trim() ?? current.businessHours,
    exchangePolicyText: input.exchangePolicyText?.trim() ?? current.exchangePolicyText,
    updatedAt: new Date().toISOString(),
  }
  persistStoreSettings(next)
  return next
}
