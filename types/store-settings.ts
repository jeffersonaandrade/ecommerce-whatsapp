import type { CommercialSalesChannels } from '@/types/commercial-policy'

export type HeaderBrandDisplay = 'both' | 'logo_only' | 'name_only'

export type { CommercialSalesChannels }

export type StoreSettings = {
  storeName: string
  description: string
  siteUrl: string
  whatsappPhone: string
  whatsappMessagePrefix: string
  email: string
  instagram: string
  facebook: string
  phone: string
  logoPath: string | null
  ogImagePath: string | null
  primaryColor: string
  secondaryColor: string
  heroImagePath: string | null
  heroHeadline: string
  heroHeadlineLine2: string
  heroSubheadline: string
  heroCtaLabel: string
  heroCtaHref: string
  aboutText: string
  address: string
  cityState: string
  businessHours: string
  exchangePolicyText: string
  importStatusPolicy: 'active' | 'draft'
  headerBrandDisplay: HeaderBrandDisplay
  benefitsEyebrow: string
  benefitsTitle: string
  personalizationEnabled: boolean
  personalizationDefaultPrice: number
  personalizationNameMaxLength: number
  personalizationNumberMin: number
  personalizationNumberMax: number
  personalizationNotesRequired: boolean
  personalizationNotesMaxLength: number
  commercialSalesChannels: CommercialSalesChannels
  commercialDefaultPolicyId: string | null
  updatedAt: string
}

export type StoreSettingsInput = Partial<StoreSettings>
