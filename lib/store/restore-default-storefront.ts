import { StoreSettings, StoreSettingsInput } from '@/types/store-settings'
import { getDefaultStorefrontVisualPreset } from './default-storefront-preset'

/** Campos operacionais preservados ao restaurar aparência padrão. */
export const PRESERVED_STOREFRONT_FIELDS = [
  'storeName',
  'whatsappPhone',
  'siteUrl',
  'email',
  'phone',
  'instagram',
  'facebook',
  'whatsappMessagePrefix',
] as const satisfies ReadonlyArray<keyof StoreSettings>

export function buildRestoreStorefrontPatch(
  current: StoreSettings,
  branding: { logoPath: string; ogImagePath: string }
): StoreSettingsInput {
  const preset = getDefaultStorefrontVisualPreset()
  return {
    ...preset,
    storeName: current.storeName,
    whatsappPhone: current.whatsappPhone,
    siteUrl: current.siteUrl,
    email: current.email,
    phone: current.phone,
    instagram: current.instagram,
    facebook: current.facebook,
    whatsappMessagePrefix: current.whatsappMessagePrefix,
    logoPath: branding.logoPath,
    ogImagePath: branding.ogImagePath,
  }
}
