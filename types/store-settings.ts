export type StoreSettings = {
  storeName: string
  description: string
  siteUrl: string
  whatsappPhone: string
  whatsappMessagePrefix: string
  email: string
  instagram: string
  facebook: string
  logoPath: string | null
  ogImagePath: string | null
}

export type StoreSettingsInput = Partial<StoreSettings>
