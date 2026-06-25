import 'server-only'

import { StoreSettings, StoreSettingsInput } from '@/types/store-settings'
import {
  loadStoreSettingsFromDisk,
  persistStoreSettings,
} from './settings-storage'

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
    logoPath: input.logoPath !== undefined ? input.logoPath : current.logoPath,
    ogImagePath: input.ogImagePath !== undefined ? input.ogImagePath : current.ogImagePath,
  }
  persistStoreSettings(next)
  return next
}
